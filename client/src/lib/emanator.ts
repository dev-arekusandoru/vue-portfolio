// Emanator: a line of light with one orb gliding along it (Joi's projector).
// Desktop: a vertical line at the far left of the page. Employers that hold several contracts branch off the line like a tree.
// Mobile: the same instrument laid on its side in the bottom bar.
import './emanator.css'
import { esc, reduce, range } from '@/lib/data'
import type { Contract, Employer } from '@/lib/data'

export const id = 'emanator'

export interface FlatItem {
  e: Employer
  c: Contract
  ci: number
  i: number
}
export interface RailState {
  q: number
  idx: number
}
export interface RailCtx {
  el: HTMLElement
  gut: HTMLElement | null
  bar: HTMLElement | null
  flat: FlatItem[]
  employers: Employer[]
  n: number
  frames: HTMLElement[]
  goTo: (i: number) => void
  subscribe: (fn: (s: RailState) => void) => () => void
}

interface Group {
  e: Employer
  a: number
  b: number
}
interface Nav {
  host: HTMLElement
  nav: HTMLElement
  h: boolean
  size: number
  rail: HTMLElement
  orb: HTMLElement
  fl: HTMLElement
  stops: HTMLElement[]
  grp: (Group & { br: HTMLElement; gn: HTMLElement })[]
  now: HTMLElement | null
  ee: HTMLElement | null
  sep: HTMLElement | null
  cn: HTMLElement | null
  ct: HTMLElement | null
  lv: HTMLElement | null
}

/* ---------- helpers ---------- */
const yearSpan = (c: Contract) => {
  const a = c.start.getUTCFullYear()
  const b = c.end.getUTCFullYear()
  return c.current ? `${a} – now` : a === b ? `${a}` : `${a} – ${b}`
}
// the name a contract goes by: a group's own-name contract is told apart by its title
const cname = (e: Employer, c: Contract) => (e.kind === 'group' && c.co === e.name ? c.title : c.co)
const aria = ({ e, c }: FlatItem) =>
  `${c.co}, ${c.title}, ${range(c)}${c.current ? ', current' : ''}${e.kind === 'group' ? `, employer ${e.name}` : ''}`

export function mount(ctx: RailCtx): () => void {
  const { el, gut, bar, flat, n, goTo, subscribe } = ctx
  if (!n) return () => {}

  const pct = (k: number) => ((k + 0.5) / n) * 100
  const groups: Group[] = ctx.employers
    .filter((e) => e.kind === 'group')
    .map((e) => {
      const ix = flat.filter((f) => f.e === e).map((f) => f.i)
      return { e, a: Math.min(...ix), b: Math.max(...ix) }
    })
  const gIndex = (e: Employer) => groups.findIndex((g) => g.e === e)

  const inGroup = (it: FlatItem) => it.e.kind === 'group'
  const stopHTML = (it: FlatItem) => {
    const nm = cname(it.e, it.c)
    const eg = inGroup(it) ? `<span class="em-eg">${esc(it.e.name)}</span>` : ''
    return `<button type="button" class="em-stop${it.c.current ? ' is-live' : ''}${inGroup(it) ? ' ing' : ''}" data-i="${it.i}" style="--at:${pct(it.i)}%" aria-label="${esc(aria(it))}"><span class="em-ring"></span><span class="em-lab" aria-hidden="true">${eg}<span class="em-nm" data-t="${esc(nm)}">${esc(nm)}</span><span class="em-yr">${esc(yearSpan(it.c))}</span></span></button>`
  }
  const sty = (g: Group) => `style="--ta:${pct(g.a)}%;--sp:${((g.b - g.a) / n) * 100}%"`
  const brHTML = (g: Group) => `<span class="em-br" ${sty(g)} aria-hidden="true"></span>`
  const gnHTML = (g: Group) =>
    `<span class="em-gn" ${sty(g)} title="${esc(g.e.name)}" aria-hidden="true">${esc(g.e.name)}</span>`
  const layers =
    '<span class="em-bloom"></span><span class="em-streak"></span><span class="em-core"></span>'
  const nowHTML =
    '<p class="em-now" aria-hidden="true"><span class="em-nn"><span class="em-ee"></span><span class="em-sep">›</span><span class="em-cn"></span></span><span class="em-ct"></span><span class="em-lv" hidden>now</span></p>'

  const build = (host: HTMLElement, axis: 'v' | 'h'): Nav => {
    host.innerHTML = `<nav class="em-nav em-${axis}" aria-label="Experience timeline" style="--n:${n}">${axis === 'h' ? nowHTML : ''}<div class="em-rail"><div class="em-lines" aria-hidden="true"><span class="em-ln"></span><span class="em-ha"></span><span class="em-fl"><span class="em-fa"></span><span class="em-fb"></span></span></div>${groups.map(brHTML).join('')}${groups.map(gnHTML).join('')}${flat.map(stopHTML).join('')}<div class="em-orb" aria-hidden="true"><span class="em-ly a">${layers}</span><span class="em-ly b">${layers}</span></div></div></nav>`
    const nav = host.firstElementChild as HTMLElement
    const $ = <T extends HTMLElement>(s: string) => nav.querySelector<T>(s)
    const brs = [...nav.querySelectorAll<HTMLElement>('.em-br')]
    const gns = [...nav.querySelectorAll<HTMLElement>('.em-gn')]
    return {
      host,
      nav,
      h: axis === 'h',
      size: 0,
      rail: $('.em-rail')!,
      orb: $('.em-orb')!,
      fl: $('.em-fl')!,
      stops: [...nav.querySelectorAll<HTMLElement>('.em-stop')],
      grp: groups.map((g, k) => ({ ...g, br: brs[k]!, gn: gns[k]! })),
      now: $('.em-now'),
      ee: $('.em-ee'),
      sep: $('.em-sep'),
      cn: $('.em-cn'),
      ct: $('.em-ct'),
      lv: $('.em-lv'),
    }
  }

  const navs = [gut && build(gut, 'v'), bar && build(bar, 'h')].filter((x): x is Nav => !!x)

  /* jump: one delegated listener per host */
  const onClick = (ev: Event) => {
    const b = (ev.target as Element).closest<HTMLElement>('.em-stop')
    if (b) goTo(+(b.dataset.i ?? 0))
  }
  navs.forEach((N) => N.host.addEventListener('click', onClick))

  /* far left: when the page has room beside the content, the line moves out to the viewport edge and its gutter collapses. Otherwise it stays in the gutter. */
  const place = () => {
    const left = el.getBoundingClientRect().left
    const far = innerWidth >= 900 && left >= 150
    el.classList.toggle('em-far', far)
    for (const N of navs) {
      if (N.h) continue
      N.nav.style.setProperty('--fx', far ? `${10 - left}px` : '0px')
      if (far) N.nav.style.setProperty('--lw', `${Math.floor(left - 36)}px`)
      else N.nav.style.removeProperty('--lw')
    }
  }

  /* orb: eased toward the stop of the current contract, the lag stretches its streak */
  let target = 0
  let cur = 0
  let lag = 0
  let raf = 0
  let last = 0
  let started = false
  const draw = () => {
    const s = lag === 0 ? 0 : Math.min(Math.abs(lag) * n * 46, 130)
    const shift = -Math.sign(lag) * (s / 2)
    const scale = (34 + s) / 100
    for (const N of navs) {
      if (!N.size) continue
      const px = cur * N.size
      N.orb.style.transform = N.h ? `translate3d(${px}px,0,0)` : `translate3d(0,${px}px,0)`
      N.fl.style.transform = N.h ? `scaleX(${cur})` : `scaleY(${cur})`
      N.orb.style.setProperty('--sh', `${shift}px`)
      N.orb.style.setProperty('--ss', String(scale))
    }
  }

  /* sizes of the rails (read by observer, never inside the scroll callback) */
  const ro = new ResizeObserver((entries) => {
    for (const en of entries) {
      const N = navs.find((x) => x.rail === en.target)
      if (N) N.size = N.h ? en.contentRect.width : en.contentRect.height
    }
    place()
    draw()
  })
  navs.forEach((N) => ro.observe(N.rail))
  ro.observe(el)

  const tick = (t: number) => {
    raf = 0
    const dt = Math.min(0.05, (t - last) / 1000)
    last = t
    const d = target - cur
    if (Math.abs(d) < 0.0002 / n) {
      cur = target
      lag = 0
      draw()
      return
    }
    cur += d * (1 - Math.exp(-dt * 9))
    lag = target - cur
    draw()
    raf = requestAnimationFrame(tick)
  }
  const kick = () => {
    if (!raf) {
      last = performance.now()
      raf = requestAnimationFrame(tick)
    }
  }

  /* discrete state: current contract, reached stops, live crossfade, bar label */
  let idx = -1
  const setIdx = (i: number) => {
    idx = i
    const { e, c } = flat[i]!
    const gi = gIndex(e)
    for (const N of navs) {
      N.stops.forEach((b, k) => {
        const on = k === i
        b.classList.toggle('on', on)
        b.classList.toggle('past', k <= i)
        if (on) b.setAttribute('aria-current', 'true')
        else b.removeAttribute('aria-current')
      })
      N.grp.forEach((g, k) => {
        const on = k === gi
        g.br.classList.toggle('on', on)
        g.gn.classList.toggle('on', on)
      })
      N.nav.dataset.live = c.current ? '1' : '0'
      if (N.now && N.ee && N.sep && N.cn && N.ct && N.lv) {
        const grouped = e.kind === 'group'
        N.ee.hidden = N.sep.hidden = !grouped
        N.ee.textContent = e.name
        N.cn.textContent = cname(e, c)
        N.ct.textContent = `${i + 1} of ${n}`
        N.lv.hidden = !c.current
        N.now.classList.toggle('live', c.current)
      }
    }
  }

  const unsub = subscribe(({ idx: i }) => {
    target = (i + 0.5) / n
    if (!started || reduce) {
      cur = target
      lag = 0
      started = true
      draw()
    } else kick()
    if (i !== idx) setIdx(i)
  })

  return () => {
    unsub()
    cancelAnimationFrame(raf)
    ro.disconnect()
    el.classList.remove('em-far')
    navs.forEach((N) => {
      N.host.removeEventListener('click', onClick)
      N.host.innerHTML = ''
    })
  }
}
