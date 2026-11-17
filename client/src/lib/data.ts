// Shared data layer. Pure helpers plus `loadPortfolio()`, which reads PocketBase once and returns the model every view uses.
//
// Contract:  { id, co, title, start, end, current, skills[], pts[], headline, group }
// Employer:  { kind:'group'|'solo', id, name, desc?, contracts[] (newest first), start, end, current }. `solo` has one contract and no desc.
//            `employers` is sorted newest first.
import type { RecordModel } from 'pocketbase'
import pb from '@/config/pocketbase'

export const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches

export const esc = (s: unknown) =>
  String(s ?? '').replace(
    /[&<>"']/g,
    (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c] as string,
  )
export const list = (v: unknown): string[] =>
  Array.isArray(v)
    ? v.map(String)
    : String(v || '')
        .split(/[,\n]/)
        .map((x) => x.trim())
        .filter(Boolean)
const D = (s: unknown) => new Date(String(s).replace(' ', 'T'))
export const fmt = (d: Date) =>
  d.toLocaleDateString('en-US', { month: 'short', year: 'numeric', timeZone: 'UTC' })
export const months = (a: Date, b: Date) => Math.max(1, Math.round((+b - +a) / 2.63e9))
export const dur = (a: Date, b: Date) => {
  const m = months(a, b)
  const y = Math.floor(m / 12)
  const r = m % 12
  return [y && `${y} yr`, r && `${r} mo`].filter(Boolean).join(' ')
}
export const range = (c: Contract) => `${fmt(c.start)} – ${c.current ? 'Present' : fmt(c.end)}`
export const grpMeta = (e: Employer) =>
  `${fmt(e.start)} – ${e.current ? 'Present' : fmt(e.end)} · ${e.contracts.length} contract${e.contracts.length > 1 ? 's' : ''}`

/* ---- tech normalisation: one key per technology, regardless of how it was typed ---- */
const ALIASES: Record<string, string> = {
  'ruby on rails': 'rails',
  'polymer (js)': 'polymer',
  js: 'javascript',
  postgres: 'postgresql',
  'react native': 'react-native',
  'aws s3': 'aws',
  'next.js': 'nextjs',
  node: 'nodejs',
  'node.js': 'nodejs',
  'c++': 'cpp',
  wasm: 'webassembly',
  tailwind: 'tailwindcss',
}
const NAMES: Record<string, string> = {
  javascript: 'JavaScript',
  typescript: 'TypeScript',
  rails: 'Ruby on Rails',
  polymer: 'Polymer',
  postgresql: 'PostgreSQL',
  activerecord: 'ActiveRecord',
  rspec: 'RSpec',
  jquery: 'jQuery',
  html: 'HTML',
  css: 'CSS',
  'react-native': 'React Native',
  nextjs: 'Next.js',
  nodejs: 'Node.js',
  cpp: 'C++',
  webassembly: 'WebAssembly',
  tailwindcss: 'TailwindCSS',
  graphql: 'GraphQL',
  pytorch: 'PyTorch',
  fastapi: 'FastAPI',
  sqlite: 'SQLite',
  htmx: 'HTMX',
  opengl: 'OpenGL',
  cmake: 'CMake',
  swiftui: 'SwiftUI',
  liveview: 'LiveView',
  pocketbase: 'PocketBase',
  grpc: 'gRPC',
  mysql: 'MySQL',
  php: 'PHP',
  'google gemini': 'Google Gemini',
}
export const techKey = (n: unknown) => {
  const k = String(n).trim().toLowerCase()
  return ALIASES[k] || k
}
export const techName = (n: unknown) => NAMES[techKey(n)] || String(n).trim()

export interface Contract {
  id: string
  co: string
  title: string
  start: Date
  end: Date
  current: boolean
  skills: string[]
  pts: string[]
  headline: string
  group: string
}
export interface Employer {
  kind: 'group' | 'solo'
  id: string
  name: string
  desc?: string
  contracts: Contract[]
  start: Date
  end: Date
  current: boolean
}
export interface Project {
  id: string
  name: string
  start: Date
  end: Date | null
  current: boolean
  stack: string[]
  headline: string
  highlights: string[]
  role: string
  kind: string
  metric: { value: string; label: string } | null
  summary: string
  challenges: string
  status: 'active' | 'shipped'
  code_url: string
  demo_url: string
  cover: string
  screenshots: string[]
  pal: string[]
  accent: string
}
export interface Interest {
  id: string
  title: string
  line: string
  phrase: string
  art: string
  stat: { value: string; label: string; live: boolean } | null
}
export interface TechEntry {
  key: string
  name: string
  contracts: Contract[]
  months: number
}

/** Map of techKey -> { key, name, contracts, months } across the given contracts, most-used first. */
export function techIndex(contracts: Contract[]): TechEntry[] {
  const m = new Map<string, TechEntry>()
  for (const c of contracts) {
    for (const s of c.skills) {
      const key = techKey(s)
      const t = m.get(key) || { key, name: techName(s), contracts: [], months: 0 }
      t.contracts.push(c)
      t.months += months(c.start, c.end)
      m.set(key, t)
    }
  }
  return [...m.values()].sort(
    (a, b) =>
      b.contracts.length - a.contracts.length ||
      b.months - a.months ||
      a.name.localeCompare(b.name),
  )
}

const firstSentence = (s: string) => {
  const t = ((s.match(/^.*?[.!?](\s|$)/) || [s])[0] || '').trim()
  return t.length > 90 ? t.slice(0, 88).replace(/\s+\S*$/, '') + '…' : t
}

const palettes = [
  ['#ff8c2b', '#1b2a33', '#5ad1e6'],
  ['#c0502a', '#101820', '#ff8c2b'],
  ['#5ad1e6', '#2a1608', '#ff8c2b'],
  ['#ff8c2b', '#0e1a1f', '#c0502a'],
  ['#d98a4a', '#1a1208', '#5ad1e6'],
]
/* per-project accent (blue stays reserved for live things). Overridable with an `accent` field. */
const accents = ['#ff8c2b', '#ff4fa3', '#f0b44c', '#e8603c', '#d98cff', '#7fe0b0']
const MOBILE = /react native|swift|kotlin|expo|flutter/i

/** A PocketBase file field holds file names; turn them into URLs. Absolute URLs and paths pass through. */
const fileUrl = (rec: RecordModel, v: unknown) => {
  const f = String(v || '')
  return !f || /^(https?:)?\/|^data:/.test(f) ? f : pb.files.getURL(rec, f)
}

export interface Portfolio {
  projects: Project[]
  contracts: Contract[]
  employers: Employer[]
  interests: Interest[]
  /** Employers reduced to their current contracts (falls back to the newest employer). Used for the home page. */
  currentEmployers: () => Employer[]
}

function build(
  rawP: RecordModel[],
  rawE: RecordModel[],
  rawG: RecordModel[],
  rawI: RecordModel[],
): Portfolio {
  const interests: Interest[] = rawI.map((r) => ({
    id: r.id,
    title: r.title,
    line: r.line || '',
    phrase: r.phrase || '',
    art: r.art || 'none',
    stat: r.stat_value
      ? { value: String(r.stat_value), label: r.stat_label || '', live: !!r.stat_live }
      : null,
  }))

  const projects: Project[] = rawP
    .map((p) => {
      const hl0 = list(p.highlights)
      const same = !p.headline && hl0.length > 1 && firstSentence(hl0[0]) === hl0[0].trim()
      const stack = [...new Map(list(p.stack).map((s) => [techKey(s), techName(s)])).values()]
      const kind =
        p.kind || (MOBILE.test(stack.join()) ? 'Mobile app' : p.demo_url ? 'Web app' : 'Project')
      return {
        id: p.id,
        name: p.name,
        start: D(p.start_date),
        end: p.end_date ? D(p.end_date) : null,
        current: !!p.current,
        stack,
        headline: p.headline || firstSentence(hl0[0] || ''),
        highlights: same ? hl0.slice(1) : hl0,
        role: p.role || 'Solo developer',
        kind,
        metric: p.metric_value
          ? { value: String(p.metric_value), label: p.metric_label || '' }
          : null,
        summary: p.summary || '',
        challenges: p.challenges || '',
        status: p.current ? ('active' as const) : ('shipped' as const),
        code_url: p.code_url || '',
        demo_url: p.demo_url || '',
        cover: fileUrl(p, p.cover),
        screenshots: list(p.screenshots).map((f) => fileUrl(p, f)),
        pal: palettes[
          [...p.name].reduce((a: number, c: string) => a + c.charCodeAt(0), 0) % palettes.length
        ],
        accent: p.accent || '',
      }
    })
    .sort((a, b) => +b.start - +a.start)
    .map((p, i) => ({ ...p, accent: p.accent || accents[(i * 5) % accents.length] }))

  const contracts: Contract[] = rawE.map((e) => {
    const start = D(e.start_date)
    const pts = list(e.description)
    const end = e.current ? new Date() : isNaN(+D(e.end_date)) ? start : D(e.end_date)
    return {
      id: e.id,
      co: e.company,
      title: e.title,
      start,
      end,
      current: !!e.current,
      skills: list(e.skills),
      pts,
      headline: e.headline || firstSentence(pts[0] || ''),
      group: e.group,
    }
  })

  const grouped = rawG
    .map((g): Employer | null => {
      const cs = contracts.filter((c) => c.group === g.id).sort((a, b) => +b.start - +a.start)
      return cs.length
        ? {
            kind: 'group',
            id: g.id,
            name: g.name,
            desc: g.description,
            contracts: cs,
            start: new Date(Math.min(...cs.map((c) => +c.start))),
            end: new Date(Math.max(...cs.map((c) => +c.end))),
            current: cs.some((c) => c.current),
          }
        : null
    })
    .filter((e): e is Employer => !!e)
  const solos: Employer[] = contracts
    .filter((c) => !rawG.some((g) => g.id === c.group))
    .map((c) => ({
      kind: 'solo',
      id: c.id,
      name: c.co,
      contracts: [c],
      start: c.start,
      end: c.end,
      current: c.current,
    }))
  const employers = [...grouped, ...solos].sort((a, b) => +b.end - +a.end || +b.start - +a.start)

  const currentEmployers = () => {
    const f = employers
      .filter((e) => e.current)
      .map((e) => ({ ...e, contracts: e.contracts.filter((c) => c.current) }))
    return f.length ? f : employers.slice(0, 1)
  }
  return { projects, contracts, employers, interests, currentEmployers }
}

let cached: Promise<Portfolio> | undefined
/** Loads everything once. Rejects if PocketBase is unreachable, so callers can show an error. */
export function loadPortfolio(): Promise<Portfolio> {
  cached ??= Promise.all([
    pb.collection('projects').getFullList({ sort: '-start_date,created' }),
    pb.collection('experiences').getFullList({ sort: '-start_date,created' }),
    pb.collection('experience_groups').getFullList({ sort: 'created' }),
    pb.collection('interests').getFullList({ sort: 'order,created' }),
  ]).then(
    ([p, e, g, i]) => build(p, e, g, i),
    (err) => {
      cached = undefined
      throw err
    },
  )
  return cached
}
