// Tech filter: "neural map". Every technology is a node, techs used together in a project are joined by a line.
// Edges + travelling signals are drawn on one <canvas> (crisp at devicePixelRatio, aria-hidden); the nodes are real
// <button>s laid over it (aria-pressed, roving tabindex with arrow keys). Desktop only (hidden under 900px).
// Techs used by several projects form the central cluster (seeded force layout); single-use techs sit on an outer halo ring.
import { icon } from '../icons'
import { esc, techKey, type Project } from '../data'
import './graph.css'
import type { FilterCtx } from './types'

const LBL_H = 15
const FG = '230,224,212'
const OR = [255, 140, 43]
const CY = [90, 209, 230]
const PK = '255,79,163'
const CYS = '90,209,230'
const RING_R = 8
const PAD = 10
const mix = (a: number[], b: number[], t: number) =>
  `${Math.round(a[0] + (b[0] - a[0]) * t)},${Math.round(a[1] + (b[1] - a[1]) * t)},${Math.round(a[2] + (b[2] - a[2]) * t)}`

const mulberry32 = (a: number) => () => {
  a = (a + 0x6d2b79f5) | 0
  let t = Math.imul(a ^ (a >>> 15), 1 | a)
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296
}

interface GNode {
  i: number
  key: string
  name: string
  count: number
  x: number
  y: number
  vx: number
  vy: number
  r: number
  r0: number
  ring: boolean
  fix: boolean
  pi: number
  always: boolean
  ew: number
  mw: number
  dx: number
  dy: number
  ph: number
  ph2: number
  w: number
  el: HTMLButtonElement
  lb: HTMLElement
}
interface GEdge {
  a: number
  b: number
  w: number
  nw: number
  base: number
  hot: number
  tb: number
  th: number
  cm: number
  tcm: number
  src: number
  ph: number
  id: number
}
type Rect = [number, number, number, number]

export function mount(ctx: FilterCtx): () => void {
  const { host, techs } = ctx
  const mq = matchMedia('(prefers-reduced-motion: reduce)')
  let reduce = mq.matches

  /* ---- model ---- */
  const N: GNode[] = techs.map((t, i) => ({
    i,
    key: t.key,
    name: t.name,
    count: t.count,
    x: 0,
    y: 0,
    vx: 0,
    vy: 0,
    r: 10,
    r0: 10,
    ring: t.count === 1,
    fix: false,
    pi: t.count === 1 ? ctx.projects.indexOf(t.projects[0]) : 0,
    always: false,
    ew: 0,
    mw: 0,
    dx: 0,
    dy: 0,
    ph: 0,
    ph2: 0,
    w: 0,
    el: null as unknown as HTMLButtonElement,
    lb: null as unknown as HTMLElement,
  }))
  const idx = new Map(N.map((n) => [n.key, n.i]))
  const C = N.filter((n) => !n.ring) // cluster: used by 2+ projects
  const R = N.filter((n) => n.ring).sort((a, b) => a.pi - b.pi || a.name.localeCompare(b.name)) // halo: single-use, ordered by project
  const adj = new Map<string, Map<string, number>>() // key -> Map(other key -> shared)
  const E: GEdge[] = []
  for (const n of N) {
    const co = ctx.coUse(n.key)
    adj.set(n.key, co)
    for (const [k, w] of co) {
      const j = idx.get(k)!
      if (j > n.i)
        E.push({
          a: n.i,
          b: j,
          w,
          nw: 0,
          base: 0,
          hot: 0,
          tb: 0,
          th: 0,
          cm: 0,
          tcm: 0,
          src: -1,
          ph: 0,
          id: E.length,
        })
    }
  }
  const maxW = Math.max(1, ...E.map((e) => e.w))
  const rnd0 = mulberry32(7331)
  for (const e of E) {
    e.nw = maxW > 1 ? (e.w - 1) / (maxW - 1) : 0
    e.ph = rnd0()
  }
  for (const n of N) {
    n.ph = rnd0() * 6.283
    n.ph2 = rnd0() * 6.283
    n.w = 0.16 + rnd0() * 0.2
  }

  /* ---- DOM ---- */
  host.innerHTML = `
<section class="g-panel" aria-label="Technology graph">
  <canvas class="g-cv" aria-hidden="true"></canvas>
  <div class="g-nodes" role="group" aria-label="Technologies. Use arrow keys to move between them, Enter to filter.">
    ${[...N]
      .reverse()
      .map(
        (n) =>
          `<button type="button" class="g-n"${n.ring ? ' data-ring' : ''} data-k="${esc(n.key)}" aria-pressed="false" tabindex="-1"><span class="g-ring" aria-hidden="true">${icon(n.key)}</span><span class="g-lb" aria-hidden="true">${esc(n.name)}</span></button>`,
      )
      .join('')}
  </div>
</section>
<p class="g-legend"><span>Node size = projects · line = used together</span><span>${N.length} technologies · ${E.length} links</span></p>`
  const panel = host.querySelector<HTMLElement>('.g-panel')!
  const cv = host.querySelector<HTMLCanvasElement>('.g-cv')!
  const g = cv.getContext('2d')!
  const nodesEl = host.querySelector<HTMLElement>('.g-nodes')!
  for (const n of N) {
    n.el = nodesEl.querySelector<HTMLButtonElement>(`[data-k="${CSS.escape(n.key)}"]`)!
    n.lb = n.el.querySelector<HTMLElement>('.g-lb')!
  }
  let cur = N[0]
  cur.el.tabIndex = 0

  /* ---- state ---- */
  let sel = new Set(ctx.selected())
  let vis: Project[] = ctx.visible()
  let hov: string | null = null
  let foc: string | null = null
  let W = 0
  let H = 0
  let dpr = 1
  let laid = false
  let AX = 0 // cluster ellipse (locus of node centres)
  let AY = 0
  let dead = false
  const TOP = 10

  /* ---- layout: seeded force simulation ---- */
  const estW = (name: string) => Math.ceil(name.length * 7.4 + 11)
  const lw = (n: GNode) => n.mw || n.ew

  function relax(gap: number, passes: number) {
    const m = gap * 0.5
    for (let p = 0; p < passes; p++) {
      for (let i = 0; i < N.length; i++) {
        const a = N[i]
        for (let j = i + 1; j < N.length; j++) {
          const b = N[j]
          if (a.fix && b.fix) continue
          let dx = b.x - a.x
          let dy = b.y - a.y
          let d = Math.hypot(dx, dy)
          const min = a.r + b.r + gap
          if (d < min) {
            if (d < 0.01) {
              dx = 1
              dy = 0
              d = 1
            }
            const f = (min - d) / d
            if (a.fix) {
              b.x += dx * f
              b.y += dy * f
            } else if (b.fix) {
              a.x -= dx * f
              a.y -= dy * f
            } else {
              a.x -= dx * f * 0.5
              a.y -= dy * f * 0.5
              b.x += dx * f * 0.5
              b.y += dy * f * 0.5
            }
          }
          if (a.always && !b.fix) circleRect(b, a, m)
          if (b.always && !a.fix) circleRect(a, b, m)
          if (a.always && b.always) rectRect(a, b, m)
        }
      }
      for (const n of C) bound(n)
    }
  }
  const rect = (n: GNode): Rect => {
    const w = n.ew
    return [n.x - w / 2, n.y + n.r + 3, n.x + w / 2, n.y + n.r + 3 + LBL_H]
  }
  function circleRect(c: GNode, o: GNode, m: number) {
    const [x0, y0, x1, y1] = rect(o)
    const px = Math.max(x0, Math.min(c.x, x1))
    const py = Math.max(y0, Math.min(c.y, y1))
    let dx = c.x - px
    let dy = c.y - py
    let d = Math.hypot(dx, dy)
    const min = c.r + m
    if (d >= min) return
    if (d < 0.01) {
      dx = 0
      dy = c.y < (y0 + y1) / 2 ? -1 : 1
      d = 1
    }
    const f = (min - d) / d
    c.x += dx * f
    c.y += dy * f
  }
  function rectRect(a: GNode, b: GNode, m: number) {
    const A = rect(a)
    const B = rect(b)
    const ox = Math.min(A[2], B[2]) - Math.max(A[0], B[0]) + m
    const oy = Math.min(A[3], B[3]) - Math.max(A[1], B[1]) + m
    if (ox <= 0 || oy <= 0) return
    if (oy < ox) {
      const s = (a.y + a.r < b.y + b.r ? -1 : 1) * oy * 0.5
      a.y += s
      b.y -= s
    } else {
      const s = (a.x < b.x ? -1 : 1) * ox * 0.5
      a.x += s
      b.x -= s
    }
  }
  // keep cluster nodes inside the central ellipse
  function bound(n: GNode) {
    const dx = n.x - W / 2
    const dy = n.y - H / 2
    const k = Math.hypot(dx / AX, dy / AY)
    if (k > 1) {
      n.x = W / 2 + dx / k
      n.y = H / 2 + dy / k
    }
  }

  // halo ring: equal arc-length spacing on an ellipse, starting at 12 o'clock, clockwise
  function placeRing(Rx: number, Ry: number) {
    const STEPS = 1440
    const pts: [number, number][] = [[0, 0]]
    let total = 0
    for (let i = 1; i <= STEPS; i++) {
      const t0 = -Math.PI / 2 + ((i - 1) / STEPS) * 6.283185
      const t1 = -Math.PI / 2 + (i / STEPS) * 6.283185
      total += Math.hypot(Rx * (Math.cos(t1) - Math.cos(t0)), Ry * (Math.sin(t1) - Math.sin(t0)))
      pts.push([total, t1])
    }
    let j = 0
    R.forEach((n, k) => {
      const s = ((k + 0.5) / R.length) * total
      while (j < STEPS && pts[j + 1][0] < s) j++
      const th = pts[j + 1][1]
      n.x = W / 2 + Rx * Math.cos(th)
      n.y = H / 2 + Ry * Math.sin(th)
      n.fix = true
      n.r = RING_R
      n.vx = n.vy = 0
    })
  }

  function layout() {
    const gap = 8
    AY = H * 0.35 - 14
    AX = W * 0.34
    const Ry = H / 2 - PAD - RING_R
    const Rx = Math.min(W / 2 - PAD - RING_R - 6, AX * 1.4)
    const maxC = Math.max(3, N[0].count)
    let need = 0
    for (const t of C) {
      t.r0 = 13 + 14 * Math.sqrt(Math.max(0, (t.count - 2) / (maxC - 2)))
      need += Math.PI * (t.r0 + gap / 2) ** 2
    }
    for (const t of N) {
      t.always = !t.ring && t.i < TOP
      t.ew = estW(t.name)
      if (t.always) need += (t.ew + gap) * (LBL_H + gap)
    }
    const sc0 = Math.min(1, Math.sqrt((0.5 * Math.PI * AX * AY) / need))
    placeRing(Rx, Ry)
    // Retry with slightly smaller nodes until no always-on label covers another node.
    for (let att = 0; att < 6; att++) {
      const rnd = mulberry32(20241)
      for (const t of C) {
        t.r = t.r0 * sc0 * 0.92 ** att
        t.vx = t.vy = 0
      }
      // seeded start: golden-angle spiral inside the cluster ellipse
      C.forEach((t, i) => {
        const ang = i * 2.39996 + rnd() * 0.4
        const rad = Math.sqrt((i + 0.5) / C.length)
        t.x = W / 2 + Math.cos(ang) * rad * AX * 0.9
        t.y = H / 2 + Math.sin(ang) * rad * AY * 0.9
      })
      const TICKS = 300
      const decay = 1 - Math.pow(0.002, 1 / TICKS)
      const K = (0.0075 * (4 * AX * AY)) / C.length
      const n = C.length
      let alpha = 1
      for (let t = 0; t < TICKS; t++) {
        alpha *= 1 - decay
        for (let i = 0; i < n; i++) {
          const a = C[i]
          for (let j = i + 1; j < n; j++) {
            const b = C[j]
            const dx = b.x - a.x
            const dy = b.y - a.y
            const d2 = dx * dx + dy * dy + 0.5
            if (d2 > 90000) continue
            const f = ((K * (1 + (a.r + b.r) / 14)) / d2) * alpha
            a.vx -= dx * f
            a.vy -= dy * f
            b.vx += dx * f
            b.vy += dy * f
          }
        }
        for (const e of E) {
          const a = N[e.a]
          const b = N[e.b]
          if (a.ring || b.ring) continue
          const dx = b.x + b.vx - a.x - a.vx
          const dy = b.y + b.vy - a.y - a.vy
          const d = Math.hypot(dx, dy) || 1
          const L = a.r + b.r + 18 + 34 * (1 - e.nw)
          const f = ((d - L) / d) * (0.07 + 0.12 * e.nw) * alpha
          a.vx += dx * f
          a.vy += dy * f
          b.vx -= dx * f
          b.vy -= dy * f
        }
        for (const t of C) {
          const hub = 0.5 + 0.9 * (t.count / maxC)
          t.vx += (W / 2 - t.x) * 0.03 * hub * alpha
          t.vy += (H / 2 - t.y) * 0.09 * hub * alpha
          t.vx *= 0.6
          t.vy *= 0.6
          t.x += t.vx
          t.y += t.vy
        }
        relax(gap, 1)
      }
      // stretch the settled cluster to fill the ellipse, then resolve overlaps
      let x0 = Infinity
      let x1 = -Infinity
      let y0 = Infinity
      let y1 = -Infinity
      for (const t of C) {
        x0 = Math.min(x0, t.x)
        x1 = Math.max(x1, t.x)
        y0 = Math.min(y0, t.y)
        y1 = Math.max(y1, t.y)
      }
      const ox = W / 2 - (x0 + x1) / 2
      const oy = H / 2 - (y0 + y1) / 2
      for (const t of C) {
        t.x += ox
        t.y += oy
      }
      let mx = 1
      let my = 1
      for (const t of C) {
        mx = Math.max(mx, Math.abs(t.x - W / 2))
        my = Math.max(my, Math.abs(t.y - H / 2))
      }
      const sx = Math.min(2.4, AX / mx)
      const sy = Math.min(2.4, AY / my)
      for (const t of C) {
        t.x = W / 2 + (t.x - W / 2) * sx
        t.y = H / 2 + (t.y - H / 2) * sy
      }
      relax(gap, 800)
      for (const t of N) {
        t.x = Math.round(t.x * 2) / 2
        t.y = Math.round(t.y * 2) / 2
      }
      placeFixed()
      if (worstPen() <= 1.2) break
    }
    // DOM sizing
    for (const t of N) {
      const d2 = Math.round(t.r * 2)
      t.el.style.setProperty('--rd', d2 + 'px')
      t.el.style.setProperty('--d', Math.max(d2, 28) + 'px')
      t.el.style.setProperty('--is', Math.max(9, Math.round(t.r * 1.08)) + 'px')
    }
    laid = true
    placeLabels()
    syncNodes(0)
  }

  /* ---- labels ---- */
  // Greedy: try below, above, right, left; keep the side with the least overlap against placed labels and other nodes.
  function pick(n: GNode, placed: Rect[]): [number, number] {
    const w = lw(n)
    const r = n.r
    const cands: [number, number][] = [
      [-w / 2, r + 3],
      [-w / 2, -r - 3 - LBL_H],
      [r + 4, -LBL_H / 2],
      [-r - 4 - w, -LBL_H / 2],
    ]
    let best = cands[0]
    let bs = Infinity
    for (const [ox, oy] of cands) {
      const x0 = n.x + ox
      const y0 = n.y + oy
      const x1 = x0 + w
      const y1 = y0 + LBL_H
      let s = 0
      s +=
        Math.max(0, -x0) * LBL_H +
        Math.max(0, x1 - W) * LBL_H +
        Math.max(0, -y0) * w +
        Math.max(0, y1 - H) * w
      for (const q of placed)
        s +=
          Math.max(0, Math.min(x1, q[2]) - Math.max(x0, q[0])) *
          Math.max(0, Math.min(y1, q[3]) - Math.max(y0, q[1]))
      for (const o of N) {
        if (o === n) continue
        const px = Math.max(x0, Math.min(o.x, x1))
        const py = Math.max(y0, Math.min(o.y, y1))
        const d = Math.hypot(o.x - px, o.y - py)
        if (d < o.r + 2) s += (o.r + 2 - d) * 14
      }
      if (s < bs) {
        bs = s
        best = [ox, oy]
      }
    }
    placed.push([n.x + best[0], n.y + best[1], n.x + best[0] + w, n.y + best[1] + LBL_H])
    return best
  }
  let fixed = new Map<GNode, [number, number]>() // always-on labels: stable between hovers
  function placeFixed() {
    fixed = new Map()
    const placed: Rect[] = []
    for (const n of N) if (n.always) fixed.set(n, pick(n, placed))
  }
  function worstPen() {
    let worst = 0
    for (const [n, o] of fixed) {
      const x0 = n.x + o[0]
      const y0 = n.y + o[1]
      const x1 = x0 + n.ew
      const y1 = y0 + LBL_H
      for (const c of N) {
        if (c === n) continue
        const d = Math.hypot(
          c.x - Math.max(x0, Math.min(c.x, x1)),
          c.y - Math.max(y0, Math.min(c.y, y1)),
        )
        worst = Math.max(worst, c.r - d)
      }
    }
    return worst
  }
  function placeLabels() {
    if (!laid) return
    const pv = hov ?? foc
    const off = new Map(fixed)
    const placed: Rect[] = [...fixed].map(([n, o]) => [
      n.x + o[0],
      n.y + o[1],
      n.x + o[0] + lw(n),
      n.y + o[1] + LBL_H,
    ])
    const dyn = N.filter((n) => !n.always && (sel.has(n.key) || n.key === pv)).sort(
      (a, b) => Number(b.key === pv) - Number(a.key === pv) || b.count - a.count,
    )
    for (const n of dyn) off.set(n, pick(n, placed))
    for (const n of N) {
      const o = off.get(n)
      n.el.toggleAttribute('data-lb', !!o)
      if (o) n.lb.style.transform = `translate(${o[0]}px,${o[1]}px)`
    }
  }
  const measure = () => {
    for (const n of N) n.mw = n.lb.offsetWidth
  }

  /* ---- state -> targets ---- */
  function retarget() {
    const pv = hov ?? foc
    const F = new Set(sel)
    if (pv) F.add(pv)
    let lit: Set<string> | null = null
    if (F.size) {
      const L = new Set<string>()
      lit = L
      if (sel.size) {
        sel.forEach((k) => L.add(k))
        for (const p of vis) for (const s of p.stack) L.add(techKey(s))
      }
      if (pv && !L.has(pv)) {
        L.add(pv)
        adj.get(pv)?.forEach((_, k) => L.add(k))
      }
    }
    for (const n of N) {
      const s = !lit
        ? ''
        : sel.has(n.key)
          ? 'sel'
          : n.key === pv
            ? 'pv'
            : lit.has(n.key)
              ? 'lit'
              : 'dim'
      if (s) n.el.dataset.s = s
      else delete n.el.dataset.s
      n.el.setAttribute('aria-pressed', String(sel.has(n.key)))
      const c = `${n.name}, ${n.count} project${n.count === 1 ? '' : 's'}`
      n.el.setAttribute('aria-label', s === 'dim' ? `${c}, no match with the current selection` : c)
    }
    for (const e of E) {
      const a = N[e.a]
      const b = N[e.b]
      if (!lit) {
        e.tb = (0.08 + 0.3 * e.nw) * (a.ring || b.ring ? 0.7 : 1)
        e.th = 0
        continue
      }
      if (!lit.has(a.key) || !lit.has(b.key)) {
        e.tb = 0.02
        e.th = 0
        continue
      }
      const fa = F.has(a.key)
      const fb = F.has(b.key)
      if (fa || fb) {
        e.tb = 0
        e.th = (0.4 + 0.5 * e.nw) * (sel.size ? 1 : 0.88)
        e.src = fa ? e.a : e.b
        e.tcm = sel.has(a.key) || sel.has(b.key) ? 0 : 1
      } else {
        e.tb = 0.05 + 0.12 * e.nw
        e.th = 0
      }
    }
    placeLabels()
    if (reduce) {
      for (const e of E) {
        e.base = e.tb
        e.hot = e.th
        e.cm = e.tcm
        if (!e.th) e.src = -1
      }
      syncNodes(0)
      draw(0)
    }
  }

  /* ---- render ---- */
  function syncNodes(t: number) {
    const amp = reduce ? 0 : 1.6
    for (const n of N) {
      n.dx = amp * Math.sin(t * n.w * 0.001 + n.ph)
      n.dy = amp * Math.cos(t * n.w * 0.0008 + n.ph2)
      n.el.style.transform = `translate3d(${(n.x + n.dx).toFixed(2)}px,${(n.y + n.dy).toFixed(2)}px,0)`
    }
  }
  function draw(t: number) {
    if (!laid) return
    g.setTransform(dpr, 0, 0, dpr, 0, 0)
    g.clearRect(0, 0, W, H)
    g.lineCap = 'round'
    for (const e of E) {
      if (e.base < 0.004 && e.hot < 0.004) continue
      const a = N[e.a]
      const b = N[e.b]
      const ax = a.x + a.dx
      const ay = a.y + a.dy
      const bx = b.x + b.dx
      const by = b.y + b.dy
      const lw0 = 0.5 + 0.8 * e.nw
      if (e.base >= 0.004) {
        g.strokeStyle = `rgba(${FG},${e.base.toFixed(3)})`
        g.lineWidth = lw0
        g.beginPath()
        g.moveTo(ax, ay)
        g.lineTo(bx, by)
        g.stroke()
      }
      if (e.hot >= 0.004) {
        const c = mix(OR, CY, e.cm)
        g.strokeStyle = `rgba(${c},${(e.hot * 0.18).toFixed(3)})`
        g.lineWidth = lw0 + 4
        g.beginPath()
        g.moveTo(ax, ay)
        g.lineTo(bx, by)
        g.stroke()
        g.strokeStyle = `rgba(${c},${e.hot.toFixed(3)})`
        g.lineWidth = lw0 + 0.5
        g.beginPath()
        g.moveTo(ax, ay)
        g.lineTo(bx, by)
        g.stroke()
      }
    }
    if (reduce) return
    // signals: dots travelling from the focused node to its neighbours
    for (const e of E) {
      if (e.src < 0 || e.hot < 0.03) continue
      const A = N[e.src]
      const B = N[e.src === e.a ? e.b : e.a]
      const ax = A.x + A.dx
      const ay = A.y + A.dy
      const bx = B.x + B.dx
      const by = B.y + B.dy
      const len = Math.hypot(bx - ax, by - ay)
      const dur = 3.4 + len / 50
      const nd = e.w >= 3 ? 2 : 1
      for (let k = 0; k < nd; k++) {
        const ph = (t / 1000 / dur + e.ph + k / nd) % 1
        const al = Math.sin(Math.PI * ph) * Math.min(1, e.hot * 1.8)
        const x = ax + (bx - ax) * ph
        const y = ay + (by - ay) * ph
        const t0 = Math.max(0, ph - 0.1)
        const tx = ax + (bx - ax) * t0
        const ty = ay + (by - ay) * t0
        const col = (e.id + k) & 1 ? PK : CYS // alternating pink / cyan
        const gr = g.createLinearGradient(tx, ty, x, y)
        gr.addColorStop(0, `rgba(${col},0)`)
        gr.addColorStop(1, `rgba(${col},${(al * 0.8).toFixed(3)})`)
        g.strokeStyle = gr
        g.lineWidth = 1.5
        g.beginPath()
        g.moveTo(tx, ty)
        g.lineTo(x, y)
        g.stroke()
        g.fillStyle = `rgba(${col},${(al * 0.2).toFixed(3)})`
        g.beginPath()
        g.arc(x, y, 4, 0, 6.283)
        g.fill()
        g.fillStyle = `rgba(255,244,240,${al.toFixed(3)})`
        g.beginPath()
        g.arc(x, y, 1.6, 0, 6.283)
        g.fill()
      }
    }
  }

  /* ---- loop ---- */
  let raf = 0
  let last = 0
  let inView = false
  const frame = (ts: number) => {
    raf = requestAnimationFrame(frame)
    if (ts - last < 30) return
    const dt = last ? Math.min(0.1, (ts - last) / 1000) : 0.03
    last = ts
    const k = 1 - Math.exp(-dt * 8)
    for (const e of E) {
      e.base += (e.tb - e.base) * k
      e.hot += (e.th - e.hot) * k
      e.cm += (e.tcm - e.cm) * k
      if (e.th === 0 && e.hot < 0.01) {
        e.hot = 0
        e.src = -1
      }
    }
    syncNodes(ts)
    draw(ts)
  }
  const sync = () => {
    const go = !reduce && inView && !document.hidden && laid && panel.clientWidth > 0
    if (go && !raf) {
      last = 0
      raf = requestAnimationFrame(frame)
    } else if (!go && raf) {
      cancelAnimationFrame(raf)
      raf = 0
    }
  }
  const onMotion = () => {
    reduce = mq.matches
    retarget()
    syncNodes(reduce ? 0 : performance.now())
    sync()
    if (reduce) draw(0)
  }

  /* ---- sizing (also handles display:none <-> visible when the window crosses 900px) ---- */
  let rt = 0
  const resize = () => {
    const w = Math.round(panel.clientWidth)
    const h = Math.round(panel.clientHeight)
    if (w < 80 || h < 80) {
      inView = false
      sync()
      return
    }
    const nd = Math.min(3, window.devicePixelRatio || 1)
    if (!laid || w !== W || h !== H || nd !== dpr) {
      W = w
      H = h
      dpr = nd
      cv.width = Math.round(W * dpr)
      cv.height = Math.round(H * dpr)
      layout()
      retarget()
    }
    inView = true
    sync()
    draw(0)
  }
  const ro = new ResizeObserver(() => {
    cancelAnimationFrame(rt)
    rt = requestAnimationFrame(resize)
  })
  ro.observe(panel)
  const io = new IntersectionObserver((en) => {
    inView = en[en.length - 1].isIntersecting
    sync()
  })
  io.observe(panel)
  const onVis = () => sync()
  document.addEventListener('visibilitychange', onVis)
  mq.addEventListener('change', onMotion)
  void document.fonts?.ready.then(() => {
    if (dead) return
    measure()
    placeFixed()
    placeLabels()
  })

  /* ---- interaction ---- */
  const nodeOf = (el: EventTarget | null): GNode | null => {
    const b = (el as Element | null)?.closest?.<HTMLElement>('.g-n')
    return b ? N[idx.get(b.dataset.k!)!] : null
  }
  const setHov = (n: GNode | null) => {
    const k = n ? n.key : null
    if (k === hov) return
    hov = k
    retarget()
  }
  nodesEl.addEventListener('pointerover', (ev) => {
    if (ev.pointerType === 'mouse') setHov(nodeOf(ev.target))
  })
  nodesEl.addEventListener('pointerleave', (ev) => {
    if (ev.pointerType === 'mouse') setHov(null)
  })
  nodesEl.addEventListener('focusin', (ev) => {
    const n = nodeOf(ev.target)
    if (!n) return
    cur.el.tabIndex = -1
    cur = n
    cur.el.tabIndex = 0
    if ((ev.target as Element).matches(':focus-visible')) {
      foc = n.key
      retarget()
    }
  })
  nodesEl.addEventListener('focusout', () => {
    if (foc) {
      foc = null
      retarget()
    }
  })
  nodesEl.addEventListener('click', (ev) => {
    const n = nodeOf(ev.target)
    if (n) ctx.toggle(n.key)
  })
  nodesEl.addEventListener('keydown', (ev) => {
    const n = nodeOf(ev.target)
    if (!n) return
    let next: GNode | null = null
    if (ev.key === 'Home') next = N[0]
    else if (ev.key === 'End') next = N[N.length - 1]
    else {
      const v = (
        { ArrowRight: [1, 0], ArrowLeft: [-1, 0], ArrowDown: [0, 1], ArrowUp: [0, -1] } as Record<
          string,
          number[]
        >
      )[ev.key]
      if (!v) return
      let bs = Infinity
      for (const o of N) {
        if (o === n) continue
        const dx = o.x - n.x
        const dy = o.y - n.y
        const along = dx * v[0] + dy * v[1]
        const perp = Math.abs(dx * v[1] - dy * v[0])
        if (along <= 1 || perp > along * 1.8) continue
        const s = along + perp * 2
        if (s < bs) {
          bs = s
          next = o
        }
      }
    }
    ev.preventDefault()
    next?.el.focus()
  })

  const unsub = ctx.subscribe((s, v) => {
    sel = new Set(s)
    vis = v
    retarget()
  })

  return () => {
    dead = true
    unsub()
    ro.disconnect()
    io.disconnect()
    cancelAnimationFrame(rt)
    cancelAnimationFrame(raf)
    raf = 0
    document.removeEventListener('visibilitychange', onVis)
    mq.removeEventListener('change', onMotion)
    host.replaceChildren()
  }
}
