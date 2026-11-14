// Rail "ruler": an instrument scale. Segment length is proportional to how long each contract lasted, ticks are calendar months,
// gaps between contracts collapse into a break mark, and a playhead sweeps the scale as you scroll (lighting the ticks it passes).
import { esc, reduce, range, dur, months } from '../lib/data.js'

export const id = 'ruler'

const S = '.xv-monolith.rail-ruler'
const MON = 2.63e9 // ms per month, same constant lib/data.js uses

/* desktop geometry (px) */
const SX = 74 // spine x
const LX = 98 // label x
const BRK = 24 // break row height
const HDGAP = 12 // space under an employer header
const MINH = 34 // minimum segment height
/* mobile geometry (px) */
const MINW = 26 // minimum segment width
const BRKW = 14 // break column width

export const css = `
${S}{--g:192px}

/* ---------- desktop: vertical scale in the gutter ---------- */
${S} .rl-d{--sx:${SX}px;--lx:${LX}px;position:sticky;top:max(112px,calc((100svh - var(--rh,560px) - 100px) / 2));font:300 .7rem/1.3 var(--mono);color:var(--muted)}
${S} .rl-ruler{position:relative;height:var(--rh,560px)}
${S} .rl-d button{font:inherit;color:inherit;background:none;border:0;padding:0;margin:0;text-align:left;cursor:pointer}

${S} .rl-d .rl-br{position:absolute;left:0;width:6px;border:1px solid rgb(255 140 43/.5);border-right:0;pointer-events:none}
${S} .rl-d .rl-br.cur{border-color:var(--accent)}
${S} .rl-d .rl-hd{position:absolute;left:14px;right:0;pointer-events:none}
${S} .rl-d .rl-hn{display:block;color:var(--muted);font-size:.78rem;line-height:1.25;text-wrap:balance;overflow-wrap:anywhere}
${S} .rl-d .rl-hs{display:block;color:var(--muted)}
${S} .rl-d .rl-hd.cur .rl-hn{color:var(--fg)}

${S} .rl-d .rl-seg{position:absolute;left:0;right:0;display:block}
${S} .rl-d .rl-seg::before{content:"";position:absolute;left:calc(var(--sx) - 1px);top:0;bottom:1px;width:2px;background:rgb(255 140 43/.5)}
${S} .rl-d .rl-seg[aria-current]::before{background:var(--accent)}
${S} .rl-d .rl-seg.live::before{background:rgb(90 209 230/.6)}
${S} .rl-d .rl-seg.live[aria-current]::before{background:var(--blue)}
${S} .rl-d .rl-seg::after{content:"";position:absolute;inset:1px 0 1px 12px;background:rgb(255 140 43/.07);opacity:0;transition:opacity .3s var(--ease)}
${S} .rl-d .rl-seg.live::after{background:rgb(90 209 230/.07)}
${S} .rl-d .rl-seg:hover::after,${S} .rl-d .rl-seg:focus-visible::after{opacity:1}
${S} .rl-d .rl-seg:focus-visible{outline:2px solid var(--accent);outline-offset:-3px}
${S} .rl-d .rl-lab{position:absolute;left:var(--lx);right:0;top:0;padding-top:5px;pointer-events:none}
${S} .rl-d .rl-co{display:-webkit-box;-webkit-box-orient:vertical;-webkit-line-clamp:2;overflow:hidden;color:var(--muted);transition:color .3s var(--ease)}
${S} .rl-d .rl-du{display:block;color:var(--muted)}
${S} .rl-d .rl-seg.rl-tight .rl-co{-webkit-line-clamp:1}
${S} .rl-d .rl-seg.rl-tight .rl-du{display:none}
${S} .rl-d .rl-seg[aria-current] .rl-co,${S} .rl-d .rl-seg:hover .rl-co,${S} .rl-d .rl-seg:focus-visible .rl-co{color:var(--fg)}
${S} .rl-d .rl-seg.live .rl-du{color:var(--blue)}

${S} .rl-tk{position:absolute;inset:0;pointer-events:none}
${S} .rl-d .rl-t{position:absolute;left:var(--sx);width:5px;height:1px;background:var(--accent);opacity:.34;transform-origin:0 50%;transition:transform .35s var(--ease),opacity .35s var(--ease),filter .35s var(--ease)}
${S} .rl-d .rl-tj{width:9px;opacity:.55}
${S} .rl-d .rl-tb{width:15px;opacity:.75}
${S} .rl-d .rl-t.lv{background:var(--blue)}
${S} .rl-d .rl-t.on{opacity:1;transform:scaleX(1.7)}
${S} .rl-d .rl-tb.on{transform:scaleX(1.25)}
${S} .rl-d .rl-t.hot{transform:scaleX(2.6);filter:drop-shadow(0 0 3px var(--accent))}
${S} .rl-d .rl-tb.hot{transform:scaleX(1.4)}
${S} .rl-d .rl-t.lv.hot{filter:drop-shadow(0 0 3px var(--blue))}
${S} .rl-d .rl-dt{position:absolute;right:calc(100% - var(--sx) + 9px);transform:translateY(-50%);white-space:nowrap;color:var(--muted)}
${S} .rl-d .rl-bk{position:absolute;left:0;right:0;pointer-events:none}
${S} .rl-d .rl-bk i{position:absolute;left:var(--sx);top:50%;transform:translate(-50%,-50%);font-style:normal;color:var(--accent);letter-spacing:-.05em}
${S} .rl-d .rl-bk em{position:absolute;left:var(--lx);top:50%;transform:translateY(-50%);font-style:normal;white-space:nowrap}
${S} .rl-ld{position:absolute;width:7px;height:7px;margin:-3px 0 0 -3px;border-radius:50%;background:var(--blue);box-shadow:0 0 10px var(--blue);animation:pulse 2.4s ease-in-out infinite}
${S} .rl-d .rl-ld{left:var(--sx)}

${S} .rl-ph{--ph:var(--accent);--phg:rgb(255 140 43/.55);position:absolute;left:0;right:0;top:0;height:0;pointer-events:none;will-change:transform}
${S} .rl-ph.live{--ph:var(--blue);--phg:rgb(90 209 230/.55)}
${S} .rl-d .rl-pl{position:absolute;left:calc(var(--sx) - 8px);width:calc(var(--lx) - var(--sx) + 4px);top:0;height:1px;background:var(--ph);box-shadow:0 0 10px 1px var(--phg)}
${S} .rl-d .rl-pl::before{content:"";position:absolute;left:4px;top:-3px;width:7px;height:7px;border-radius:50%;background:var(--ph);box-shadow:0 0 12px 2px var(--phg)}
${S} .rl-d .rl-tag{position:absolute;right:calc(100% - var(--sx) + 8px);top:-9px;height:18px;padding:0 6px;font-style:normal;line-height:16px;white-space:nowrap;color:var(--fg);background:var(--bg);border:1px solid var(--ph);box-shadow:0 0 12px var(--phg)}
${S} .rl-d .rl-tag::after{content:"";position:absolute;right:-5px;top:50%;width:8px;height:8px;margin-top:-4px;background:var(--bg);border:1px solid var(--ph);border-left:0;border-bottom:0;transform:rotate(45deg)}

${S} .rl-read{margin-top:18px;padding-top:10px;border-top:1px solid var(--rule);height:76px;pointer-events:none}
${S} .rl-read p{margin:0;min-height:1.3em;overflow:hidden;white-space:nowrap;text-overflow:ellipsis}
${S} .rl-read .r2{color:var(--fg);font-size:.8rem;line-height:1.4}
${S} .rl-read .r4{margin-top:2px}
${S} .rl-read .r4.lv{color:var(--blue)}
${S} .rl-read .r4.lv::before{content:"";display:inline-block;width:6px;height:6px;border-radius:50%;background:var(--blue);box-shadow:0 0 8px var(--blue);margin-right:7px;animation:pulse 2.4s ease-in-out infinite}

/* ---------- mobile: the same scale laid on its side in the bottom bar ---------- */
${S} .rl-m{margin-inline:-20px;padding:4px 20px 4px;background:rgb(8 10 12/.97);border-top:1px solid var(--rule);font:300 .7rem/1.2 var(--mono);color:var(--muted)}
${S} .rl-m button{font:inherit;color:inherit;background:none;border:0;padding:0;margin:0;cursor:pointer}
${S} .rl-mr{position:relative;height:37px}
${S} .rl-m .rl-br{position:absolute;top:7px;height:6px;border:1px solid rgb(255 140 43/.5);border-top:0;pointer-events:none}
${S} .rl-m .rl-br.lab{top:0;height:13px}
${S} .rl-m .rl-br.cur{border-color:var(--accent)}
${S} .rl-m .rl-bn{position:absolute;left:6px;top:0;line-height:11px;white-space:nowrap;visibility:hidden;color:var(--muted)}
${S} .rl-m .rl-br.lab .rl-bn{visibility:visible}
${S} .rl-m .rl-br.cur .rl-bn{color:var(--fg)}
${S} .rl-m .rl-seg{position:absolute;top:3px;height:44px;z-index:1}
${S} .rl-m .rl-seg::before{content:"";position:absolute;left:0;right:1px;top:28px;height:2px;background:rgb(255 140 43/.5)}
${S} .rl-m .rl-seg[aria-current]::before{background:var(--accent)}
${S} .rl-m .rl-seg.live::before{background:rgb(90 209 230/.6)}
${S} .rl-m .rl-seg.live[aria-current]::before{background:var(--blue)}
${S} .rl-m .rl-seg::after{content:"";position:absolute;inset:10px 0 8px;background:rgb(255 140 43/.1);opacity:0;transition:opacity .3s var(--ease)}
${S} .rl-m .rl-seg.live::after{background:rgb(90 209 230/.1)}
${S} .rl-m .rl-seg:hover::after,${S} .rl-m .rl-seg:focus-visible::after{opacity:1}
${S} .rl-m .rl-seg:focus-visible{outline:2px solid var(--accent);outline-offset:-2px}
${S} .rl-m .rl-t{position:absolute;bottom:6px;width:1px;height:5px;background:var(--accent);opacity:.34;transform-origin:50% 100%;transition:transform .35s var(--ease),opacity .35s var(--ease)}
${S} .rl-m .rl-tj{height:8px;opacity:.55}
${S} .rl-m .rl-tb{height:15px;opacity:.75}
${S} .rl-m .rl-t.lv{background:var(--blue)}
${S} .rl-m .rl-t.on{opacity:1;transform:scaleY(1.5)}
${S} .rl-m .rl-tb.on{transform:scaleY(1.12)}
${S} .rl-m .rl-t.hot{transform:scaleY(1.9);filter:drop-shadow(0 0 3px var(--accent))}
${S} .rl-m .rl-tb.hot{transform:scaleY(1.2)}
${S} .rl-m .rl-t.lv.hot{filter:drop-shadow(0 0 3px var(--blue))}
${S} .rl-m .rl-bk{position:absolute;top:19px;height:13px;text-align:center;line-height:13px;color:var(--accent);letter-spacing:-.05em;pointer-events:none}
${S} .rl-m .rl-ld{top:31px}
${S} .rl-m .rl-ph{top:-4px;bottom:0;left:0;width:1px;height:auto;right:auto;background:var(--ph);box-shadow:0 0 8px 1px var(--phg)}
${S} .rl-m .rl-ph::before{content:"";position:absolute;top:-1px;left:-3.5px;border-left:3.5px solid transparent;border-right:3.5px solid transparent;border-top:5px solid var(--ph)}
${S} .rl-mread{display:flex;gap:8px;align-items:baseline;margin-top:2px;height:15px;line-height:15px;white-space:nowrap;pointer-events:none}
${S} .rl-mn{min-width:0;flex:0 1 auto;overflow:hidden;text-overflow:ellipsis;color:var(--fg)}
${S} .rl-mm{flex:none;color:var(--muted)}
${S} .rl-mm.lv{color:var(--blue)}
${S} .rl-mm.lv::before{content:"";display:inline-block;width:6px;height:6px;border-radius:50%;background:var(--blue);box-shadow:0 0 8px var(--blue);margin-right:6px;animation:pulse 2.4s ease-in-out infinite}
${S} .rl-mc{flex:none;margin-left:auto;color:var(--muted)}

@media (prefers-reduced-motion:reduce){
  ${S} .rl-t,${S} .rl-seg::after,${S} .rl-co{transition:none}
  ${S} .rl-ld,${S} .rl-read .r4.lv::before,${S} .rl-mm.lv::before{animation:none}
  ${S} .rl-ph{will-change:auto}
}
`

/* ---------- helpers ---------- */
const clamp = (v, a, b) => Math.min(b, Math.max(a, v))
const short = (d) => `${d.toLocaleDateString('en-US', { month: 'short', timeZone: 'UTC' })} ’${String(d.getUTCFullYear()).slice(2)}`

/** Calendar month starts strictly inside a contract, as fractions u in (0,1) from its end (top/left) to its start. */
function monthTicks(c, size, minGap) {
  const S0 = +c.start, E = +c.end, span = E - S0
  if (!(span > 0)) return []
  const all = []
  let y = c.end.getUTCFullYear(), m = c.end.getUTCMonth()
  for (let guard = 0; guard < 2400; guard++) {
    const t = Date.UTC(y, m, 1)
    if (t <= S0) break
    if (t < E) all.push({ u: (E - t) / span, jan: m === 0 })
    if (--m < 0) { m = 11; y-- }
  }
  const step = Math.max(1, Math.ceil(minGap / (size / (all.length + 1))))
  return all.filter((t, i) => t.jan || i % step === 0)
}

/** Lay rows along one axis: `fixed` rows keep their size, `w` rows share the rest proportionally, none smaller than `min`. Sets r.p / r.size. */
function fill(total, rows, min) {
  const fl = rows.filter((r) => r.w)
  let left = Math.max(0, total - rows.reduce((a, r) => a + (r.fixed || 0), 0))
  let free = fl
  for (let guard = 0; guard <= fl.length; guard++) {
    const W = free.reduce((a, r) => a + r.w, 0)
    const under = free.filter((r) => (left * r.w) / W < min)
    if (!under.length) break
    under.forEach((r) => { r.s = min; left -= min })
    free = free.filter((r) => !under.includes(r))
  }
  const W = free.reduce((a, r) => a + r.w, 0)
  free.forEach((r) => { r.s = (left * r.w) / W })
  let p = 0
  rows.forEach((r) => { r.p = p; r.size = r.fixed ?? r.s; p += r.size })
  return p
}

const lowerBound = (arr, v) => { let lo = 0, hi = arr.length; while (lo < hi) { const mid = (lo + hi) >> 1; if (arr[mid] <= v) lo = mid + 1; else hi = mid } return lo }

export function mount(ctx) {
  const { gut, bar, flat, n, goTo, subscribe } = ctx

  /* employers as runs of consecutive frames */
  const emps = []
  flat.forEach((f, k) => {
    let g = emps[emps.length - 1]
    if (!g || g.e !== f.e) emps.push((g = { e: f.e, first: k, last: k }))
    g.last = k
  })
  const empOf = flat.map((f) => emps.findIndex((g) => g.e === f.e))
  const gapBefore = (k) => (k > 0 ? (flat[k - 1].c.start - flat[k].c.end) / MON : 0)
  const gapped = (k) => gapBefore(k) >= 2
  const name = ({ e, c, ci }) => `${c.co}, ${c.title}, ${range(c)}, ${dur(c.start, c.end)}${c.current ? ', current' : ''}${e.kind === 'group' ? `. ${e.name}, contract ${ci + 1} of ${e.contracts.length}` : ''}`
  const segBtn = (f, k, inner = '') => `<button type="button" class="rl-seg${f.c.current ? ' live' : ''}" data-k="${k}" aria-label="${esc(name(f))}">${inner}</button>`

  /* ================= desktop DOM ================= */
  gut.innerHTML = `<div class="rl-d"><nav aria-label="Experience timeline"><div class="rl-ruler">
    ${emps.map((g, j) => `<div class="rl-br" data-j="${j}" aria-hidden="true"></div>${g.e.kind === 'group' ? `<div class="rl-hd" data-j="${j}" aria-hidden="true"><span class="rl-hn">${esc(g.e.name)}</span><span class="rl-hs">employer · ${g.e.contracts.length} contracts</span></div>` : ''}`).join('')}
    <div class="rl-tk" aria-hidden="true"></div>
    ${flat.map((f, k) => segBtn(f, k, `<span class="rl-lab"><span class="rl-co">${esc(f.c.co)}</span><span class="rl-du">${esc(dur(f.c.start, f.c.end))}</span></span>`)).join('')}
    <div class="rl-ph" aria-hidden="true"><i class="rl-pl"></i><i class="rl-tag"></i></div>
  </div></nav>
  <div class="rl-read" aria-hidden="true"><p class="r1"></p><p class="r2"></p><p class="r3"></p><p class="r4"></p></div></div>`

  const dRoot = gut.querySelector('.rl-d')
  const dTk = gut.querySelector('.rl-tk')
  const dSegs = [...gut.querySelectorAll('.rl-seg')]
  const dBrs = [...gut.querySelectorAll('.rl-br')]
  const dHds = new Map([...gut.querySelectorAll('.rl-hd')].map((h) => [+h.dataset.j, h]))
  const dPh = gut.querySelector('.rl-ph')
  const dTag = gut.querySelector('.rl-tag')
  const dRead = gut.querySelector('.rl-read')
  const [r1, r2, r3, r4] = dRead.children

  /* ================= mobile DOM ================= */
  bar.innerHTML = `<div class="rl-m"><nav aria-label="Experience timeline"><div class="rl-mr">
    ${emps.map((g, j) => `<div class="rl-br" data-j="${j}" aria-hidden="true">${g.e.kind === 'group' ? `<span class="rl-bn">${esc(g.e.name)}</span>` : ''}</div>`).join('')}
    <div class="rl-tk" aria-hidden="true"></div>
    ${flat.map((f, k) => segBtn(f, k)).join('')}
    <div class="rl-ph" aria-hidden="true"></div>
  </div></nav>
  <div class="rl-mread" aria-hidden="true"><span class="rl-mn"></span><span class="rl-mm"></span><span class="rl-mc"></span></div></div>`

  const mRuler = bar.querySelector('.rl-mr')
  const mTk = bar.querySelector('.rl-tk')
  const mSegs = [...bar.querySelectorAll('.rl-seg')]
  const mBrs = [...bar.querySelectorAll('.rl-br')]
  const mPh = bar.querySelector('.rl-ph')
  const mRead = bar.querySelector('.rl-mread')
  const [mn, mm, mc] = mRead.children

  /* ================= layout (only on mount / resize / font load) ================= */
  const D = { ok: false, top: [], h: [], start: [], pos: [], els: [], lit: 0, hot: -1 }
  const M = { ok: false, left: [], w: [], start: [], pos: [], els: [], lit: 0, hot: -1 }

  function layoutD() {
    D.ok = gut.clientWidth > 0
    if (!D.ok) return
    const hdH = new Map([...dHds].map(([j, h]) => [j, Math.ceil(h.offsetHeight) + HDGAP]))
    const rows = []
    flat.forEach(({ e, c, ci }, k) => {
      if (gapped(k)) rows.push({ t: 'brk', fixed: BRK, k })
      if (ci === 0 && e.kind === 'group') { const pad = k > 0 && !gapped(k) ? 14 : 0; rows.push({ t: 'hd', fixed: hdH.get(empOf[k]) + pad, pad, j: empOf[k] }) }
      rows.push({ t: 'seg', w: months(c.start, c.end), k })
    })
    const fixed = rows.reduce((a, r) => a + (r.fixed || 0), 0)
    const ih = innerHeight
    const Hmax = Math.max(240, ih - 112 - 100 - 24)
    const totalMo = rows.reduce((a, r) => a + (r.w || 0), 0)
    const need = Math.min(fixed + n * MINH, Hmax)
    const H = Math.round(Math.max(Math.min(0.72 * ih, 560, Hmax, fixed + totalMo * 20), need))
    fill(H, rows, Math.min(MINH, (H - fixed) / n))
    dRoot.style.setProperty('--rh', `${H}px`)

    rows.forEach((r) => { if (r.t === 'seg') { D.top[r.k] = r.p; D.h[r.k] = r.size } })
    D.start = [...D.top, H]
    const hdRow = new Map(rows.filter((r) => r.t === 'hd').map((r) => [r.j, r]))

    flat.forEach((f, k) => {
      const b = dSegs[k]
      b.style.top = `${D.top[k]}px`
      b.style.height = `${D.h[k]}px`
      b.classList.toggle('rl-tight', D.h[k] < 46)
    })
    emps.forEach((g, j) => {
      const y0 = hdRow.has(j) ? hdRow.get(j).p + hdRow.get(j).pad : D.top[g.first]
      const y1 = D.top[g.last] + D.h[g.last]
      dBrs[j].style.top = `${y0 + 1}px`
      dBrs[j].style.height = `${Math.max(2, y1 - y0 - 2)}px`
      if (dHds.has(j)) dHds.get(j).style.top = `${y0}px`
    })

    const items = []
    let html = ''
    const contigAfter = (k) => k < n - 1 && Math.abs(D.top[k + 1] - (D.top[k] + D.h[k])) < 0.5
    flat.forEach(({ c }, k) => {
      const top = D.top[k], h = D.h[k], lv = c.current
      items.push({ p: top, kind: 'b', lv })
      if (!contigAfter(k)) items.push({ p: top + h, kind: 'b', lv })
      monthTicks(c, h, 3.6).forEach((t) => items.push({ p: top + t.u * h, kind: t.jan ? 'j' : 'm', lv }))
      if (k === 0 || !contigAfter(k - 1)) html += `<span class="rl-dt" style="top:${top}px">${c.current ? 'Present' : short(c.end)}</span>`
      html += `<span class="rl-dt" style="top:${top + h}px">${short(c.start)}</span>`
    })
    items.sort((a, b) => a.p - b.p)
    html += items.map((t) => `<i class="rl-t rl-t${t.kind}${t.lv ? ' lv' : ''}" style="top:${t.p.toFixed(1)}px"></i>`).join('')
    rows.filter((r) => r.t === 'brk').forEach((r) => { html += `<span class="rl-bk" style="top:${r.p}px;height:${r.size}px"><i>//</i><em>${Math.round(gapBefore(r.k))} mo gap</em></span>` })
    const li = flat.findIndex((f) => f.c.current)
    if (li >= 0) html += `<i class="rl-ld" style="top:${D.top[li]}px"></i>`
    dTk.innerHTML = html
    D.els = [...dTk.querySelectorAll('.rl-t')]
    D.pos = items.map((t) => t.p)
    D.lit = 0
    D.hot = -1
    D.y = D.key = D.live = undefined
  }

  function layoutM() {
    M.ok = bar.clientWidth > 0 && mRuler.clientWidth > 0
    if (!M.ok) return
    const W = mRuler.clientWidth
    const rows = []
    flat.forEach(({ c }, k) => {
      if (gapped(k)) rows.push({ t: 'brk', fixed: BRKW, k })
      rows.push({ t: 'seg', w: months(c.start, c.end), k })
    })
    const fixed = rows.reduce((a, r) => a + (r.fixed || 0), 0)
    fill(W, rows, Math.min(MINW, (W - fixed) / n))
    rows.forEach((r) => { if (r.t === 'seg') { M.left[r.k] = r.p; M.w[r.k] = r.size } })
    M.start = [...M.left, W]

    flat.forEach((f, k) => {
      mSegs[k].style.left = `${M.left[k]}px`
      mSegs[k].style.width = `${M.w[k]}px`
    })
    emps.forEach((g, j) => {
      const x0 = M.left[g.first], x1 = M.left[g.last] + M.w[g.last]
      mBrs[j].style.left = `${x0 + 1}px`
      mBrs[j].style.width = `${Math.max(2, x1 - x0 - 2)}px`
    })
    mBrs.forEach((b) => b.classList.remove('lab'))
    const fits = mBrs.map((b) => { const t = b.firstElementChild; return !!t && t.offsetWidth + 12 <= b.offsetWidth })
    mBrs.forEach((b, j) => b.classList.toggle('lab', fits[j]))

    const items = []
    let html = ''
    const contigAfter = (k) => k < n - 1 && Math.abs(M.left[k + 1] - (M.left[k] + M.w[k])) < 0.5
    flat.forEach(({ c }, k) => {
      const x = M.left[k], w = M.w[k], lv = c.current
      items.push({ p: x, kind: 'b', lv })
      if (!contigAfter(k)) items.push({ p: x + w, kind: 'b', lv })
      monthTicks(c, w, 3).forEach((t) => items.push({ p: x + t.u * w, kind: t.jan ? 'j' : 'm', lv }))
    })
    items.sort((a, b) => a.p - b.p)
    html += items.map((t) => `<i class="rl-t rl-t${t.kind}${t.lv ? ' lv' : ''}" style="left:${Math.min(W - 1, t.p).toFixed(1)}px"></i>`).join('')
    rows.filter((r) => r.t === 'brk').forEach((r) => { html += `<span class="rl-bk" style="left:${r.p}px;width:${r.size}px">//</span>` })
    const li = flat.findIndex((f) => f.c.current)
    if (li >= 0) html += `<i class="rl-ld" style="left:${M.left[li]}px"></i>`
    mTk.innerHTML = html
    M.els = [...mTk.querySelectorAll('.rl-t')]
    M.pos = items.map((t) => t.p)
    M.lit = 0
    M.hot = -1
    M.x = undefined
  }

  /* ================= per-frame state ================= */
  let st = null
  let lastIdx = -1

  function light(S2, y) {
    const L = lowerBound(S2.pos, y + 0.6)
    if (L === S2.lit) return
    if (S2.hot >= 0) S2.els[S2.hot]?.classList.remove('hot')
    if (L > S2.lit) for (let i = S2.lit; i < L; i++) S2.els[i].classList.add('on')
    else for (let i = L; i < S2.lit; i++) S2.els[i].classList.remove('on', 'hot')
    S2.lit = L
    S2.hot = L - 1
    if (S2.hot >= 0) S2.els[S2.hot].classList.add('hot')
  }

  function applyPos(q) {
    const k = clamp(Math.floor(q + 1e-6), 0, n - 1)
    const f = k >= n - 1 ? 0 : clamp(q - k, 0, 1)
    const c = flat[k].c
    if (D.ok) {
      const y = D.start[k] + f * (D.start[k + 1] - D.start[k])
      if (y !== D.y) {
        D.y = y
        dPh.style.transform = `translate3d(0,${y.toFixed(2)}px,0)`
        const frac = clamp((y - D.top[k]) / D.h[k], 0, 1)
        const dt = new Date(+c.end - frac * (+c.end - +c.start))
        const present = c.current && frac < 0.004
        const key = present ? -1 : dt.getUTCFullYear() * 12 + dt.getUTCMonth()
        if (key !== D.key) { D.key = key; dTag.textContent = present ? 'Present' : short(dt) }
        if (c.current !== D.live) { D.live = c.current; dPh.classList.toggle('live', c.current) }
        light(D, y)
      }
    }
    if (M.ok) {
      const x = M.start[k] + f * (M.start[k + 1] - M.start[k])
      if (x !== M.x) {
        M.x = x
        mPh.style.transform = `translate3d(${x.toFixed(2)}px,0,0)`
        mPh.classList.toggle('live', c.current)
        light(M, x)
      }
    }
  }

  /* one line, richest version that fits: name · dates · duration · i/n, shedding detail as the bar narrows */
  function fitReadout(idx) {
    const { c } = flat[idx]
    const d = dur(c.start, c.end)
    const rng = `${short(c.start)} – ${c.current ? 'Present' : short(c.end)}`
    const crng = `${short(c.start)}–${c.current ? 'now' : short(c.end)}`
    const cnt = `${idx + 1}/${n}`
    const tiers = [[`${rng} · ${d}`, cnt], [`${rng} · ${d}`, ''], [`${crng} · ${d}`, cnt], [`${crng} · ${d}`, ''], [c.current ? `${d} · now` : d, cnt], [c.current ? `${d} · now` : d, '']]
    mn.textContent = c.co
    mm.classList.toggle('lv', c.current)
    for (const [t, k] of tiers) {
      mm.textContent = t
      mc.textContent = k
      if (!M.ok || mn.scrollWidth <= mn.clientWidth + 0.5) break
    }
  }

  function applyIdx(idx) {
    if (idx === lastIdx) return
    const prev = lastIdx
    lastIdx = idx
    const { e, c } = flat[idx]
    const j = empOf[idx]
    ;[dSegs, mSegs].forEach((list) => {
      if (prev >= 0) list[prev].removeAttribute('aria-current')
      list[idx].setAttribute('aria-current', 'true')
    })
    ;[dBrs, mBrs].forEach((list) => list.forEach((b, i) => b.classList.toggle('cur', i === j)))
    dHds.forEach((h, i) => h.classList.toggle('cur', i === j))

    r1.textContent = e.kind === 'group' ? `employer ${e.name}` : ''
    r2.textContent = c.co
    r3.textContent = range(c)
    r4.textContent = `${dur(c.start, c.end)}${c.current ? ' · current' : ''}`
    r4.classList.toggle('lv', c.current)

    fitReadout(idx)

    if (prev >= 0 && !reduce) {
      const kf = [{ opacity: 0.15, transform: 'translateY(4px)' }, { opacity: 1, transform: 'none' }]
      const o = { duration: 420, easing: 'cubic-bezier(.22,.8,.2,1)' }
      if (D.ok) dRead.animate(kf, o)
      if (M.ok) mRead.animate(kf, o)
    }
  }

  const apply = () => { if (!st) return; applyPos(st.q); applyIdx(st.idx) }

  /* ================= wiring ================= */
  const onClick = (ev) => {
    const b = ev.target.closest?.('.rl-seg')
    if (b) goTo(+b.dataset.k)
  }
  gut.addEventListener('click', onClick)
  bar.addEventListener('click', onClick)

  const relayout = () => { layoutD(); layoutM(); if (lastIdx >= 0) fitReadout(lastIdx); apply() }
  let raf = 0
  const queue = () => { if (!raf) raf = requestAnimationFrame(() => { raf = 0; relayout() }) }
  addEventListener('resize', queue)
  let gone = false
  document.fonts?.ready.then(() => { if (!gone) queue() })

  layoutD()
  layoutM()
  const unsub = subscribe((s) => { st = s; apply() })

  return () => {
    gone = true
    unsub()
    removeEventListener('resize', queue)
    cancelAnimationFrame(raf)
    gut.removeEventListener('click', onClick)
    bar.removeEventListener('click', onClick)
    gut.innerHTML = ''
    bar.innerHTML = ''
  }
}
