// Shared data layer for the mockup. Loads the live PocketBase (?pb=URL to override), falls back to sample data.
//
// Contract object:   { id, co, title, start:Date, end:Date, current:boolean, skills:string[], pts:string[], headline:string, group:string }
// Employer object:   { kind:'group'|'solo', id, name, desc?:string, contracts:Contract[] (newest first), start:Date, end:Date, current:boolean }
//                    `solo` employers have exactly one contract and no desc. `group` employers (e.g. SYSTOLIC) hold several contracts.
// `employers` is sorted newest first.

export const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches
const PB = new URLSearchParams(location.search).get('pb') || 'http://127.0.0.1:8091'

export const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c])
export const list = (v) => (Array.isArray(v) ? v : String(v || '').split(/[,\n]/).map((x) => x.trim()).filter(Boolean))
const D = (s) => new Date(String(s).replace(' ', 'T'))
export const fmt = (d) => d.toLocaleDateString('en-US', { month: 'short', year: 'numeric', timeZone: 'UTC' })
export const months = (a, b) => Math.max(1, Math.round((b - a) / 2.63e9))
export const dur = (a, b) => {
  const m = months(a, b), y = Math.floor(m / 12), r = m % 12
  return [y && `${y} yr`, r && `${r} mo`].filter(Boolean).join(' ')
}
export const range = (c) => `${fmt(c.start)} – ${c.current ? 'Present' : fmt(c.end)}`
export const grpMeta = (e) => `${fmt(e.start)} – ${e.current ? 'Present' : fmt(e.end)} · ${e.contracts.length} contract${e.contracts.length > 1 ? 's' : ''}`

/* ---- tech normalisation: one key per technology, regardless of how it was typed ---- */
const ALIASES = { 'ruby on rails': 'rails', 'polymer (js)': 'polymer', js: 'javascript', postgres: 'postgresql', 'react native': 'react-native', 'aws s3': 'aws' }
const NAMES = { javascript: 'JavaScript', typescript: 'TypeScript', rails: 'Ruby on Rails', polymer: 'Polymer', postgresql: 'PostgreSQL', activerecord: 'ActiveRecord', rspec: 'RSpec', jquery: 'jQuery', html: 'HTML', css: 'CSS', 'react-native': 'React Native' }
export const techKey = (n) => { const k = String(n).trim().toLowerCase(); return ALIASES[k] || k }
export const techName = (n) => NAMES[techKey(n)] || String(n).trim()

/** Map of techKey -> { key, name, contracts:Contract[], months:number } across the given contracts, most-used first. */
export function techIndex(contracts) {
  const m = new Map()
  for (const c of contracts) {
    for (const s of c.skills) {
      const key = techKey(s)
      const t = m.get(key) || { key, name: techName(s), contracts: [], months: 0 }
      t.contracts.push(c)
      t.months += months(c.start, c.end)
      m.set(key, t)
    }
  }
  return [...m.values()].sort((a, b) => b.contracts.length - a.contracts.length || b.months - a.months || a.name.localeCompare(b.name))
}

/* ---- loading ---- */
async function pbList(c, sort) {
  const r = await fetch(`${PB}/api/collections/${c}/records?perPage=100&sort=${sort}`, { signal: AbortSignal.timeout(2500) })
  if (!r.ok) throw new Error(`${c} ${r.status}`)
  return (await r.json()).items
}

const firstSentence = (s) => {
  const t = ((s.match(/^.*?[.!?](\s|$)/) || [s])[0] || '').trim()
  return t.length > 90 ? t.slice(0, 88).replace(/\s+\S*$/, '') + '…' : t
}

let live = true, rawP, rawE, rawG
try {
  ;[rawP, rawE, rawG] = await Promise.all([pbList('projects', '-start_date,created'), pbList('experiences', '-start_date,created'), pbList('experience_groups', 'created')])
} catch (e) {
  live = false
  console.warn('PocketBase unreachable, using sample data', e)
  rawG = [{ id: 'g1', name: 'SYSTOLIC Inc', description: 'Working as a government subcontractor in software development, providing high-quality software engineering services to the Intelligence Community (IC) in support of U.S. national defense.' }]
  rawE = [
    { id: 'e1', company: 'SYSTOLIC Inc', title: 'Software Engineer', start_date: '2025-01-08', end_date: '', current: true, group: 'g1', skills: ['Ruby', 'Ruby on Rails', 'PostgreSQL', 'ActiveRecord', 'Git', 'Docker', 'RSpec'], headline: 'Built an internal app for staffing, acquisitions, security and management operations.', description: ['Developing an internal application for the company to streamline staffing, acquisitions, security, and management operations.', 'Collaborating with end users to gather feedback and prioritize feature requests.', 'Directing efforts to implement robust test coverage.'] },
    { id: 'e2', company: 'Peraton', title: 'Software Engineer', start_date: '2024-09-04', end_date: '2025-01-07', current: false, group: 'g1', skills: ['Javascript', 'jQuery', 'Java', 'HTML', 'CSS', 'Git', 'Docker', 'Maven'], headline: 'Prototyped a Cyber Threat Intelligence exchange web app for a government agency.', description: ['Worked closely with a team to design and prototype a Cyber Threat Intelligence exchange web application.', 'Designed, developed, and implemented new features.'] },
    { id: 'e3', company: 'Katapult Engineering', title: 'Software Development Intern', start_date: '2023-06-01', end_date: '2023-11-30', current: false, group: '', skills: ['Polymer (JS)', 'Firebase', 'CSS', 'Git'], headline: 'Fixed bugs and built custom features for client products as an engineering intern.', description: ['Enhanced user experience and product quality by resolving software bugs.', 'Designed and implemented custom software features.'] },
  ]
  rawP = [{ id: 'p1', name: 'Sample project', start_date: '2025-01-01', current: true, stack: ['Vue'], highlights: ['Sample highlight.'] }]
}
import { NOW, seed, seedProjects } from './seed.js'
export const isSeeded = new URLSearchParams(location.search).get('seed') !== '0'
if (isSeeded) { ({ rawG, rawE } = seed(rawG, rawE)); rawP = seedProjects(rawP) }
export const isLive = live

const palettes = [['#ff8c2b', '#1b2a33', '#5ad1e6'], ['#c0502a', '#101820', '#ff8c2b'], ['#5ad1e6', '#2a1608', '#ff8c2b'], ['#ff8c2b', '#0e1a1f', '#c0502a'], ['#d98a4a', '#1a1208', '#5ad1e6']]
export const projects = rawP.map((p) => ({ ...p, pal: palettes[[...p.name].reduce((a, c) => a + c.charCodeAt(0), 0) % palettes.length] })).sort((a, b) => D(b.start_date) - D(a.start_date))

export const contracts = rawE.map((e) => {
  const start = D(e.start_date)
  const pts = Array.isArray(e.description) ? e.description : list(e.description)
  const end = e.current ? (isSeeded ? NOW : new Date()) : (isNaN(D(e.end_date)) ? start : D(e.end_date))
  return { id: e.id, co: e.company, title: e.title, start, end, current: !!e.current, skills: list(e.skills), pts, headline: e.headline || firstSentence(pts[0] || ''), group: e.group }
})

const grouped = rawG.map((g) => {
  const cs = contracts.filter((c) => c.group === g.id).sort((a, b) => b.start - a.start)
  return cs.length && { kind: 'group', id: g.id, name: g.name, desc: g.description, contracts: cs, start: new Date(Math.min(...cs.map((c) => c.start))), end: new Date(Math.max(...cs.map((c) => c.end))), current: cs.some((c) => c.current) }
}).filter(Boolean)
const solos = contracts.filter((c) => !rawG.some((g) => g.id === c.group)).map((c) => ({ kind: 'solo', id: c.id, name: c.co, contracts: [c], start: c.start, end: c.end, current: c.current }))
export const employers = [...grouped, ...solos].sort((a, b) => b.end - a.end || b.start - a.start)

/** Employers reduced to their current contracts (falls back to the newest employer). Used for the home page. */
export function currentEmployers() {
  const f = employers.filter((e) => e.current).map((e) => ({ ...e, contracts: e.contracts.filter((c) => c.current) }))
  return f.length ? f : employers.slice(0, 1)
}
