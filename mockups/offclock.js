import { esc } from './lib/data.js'

// Off the clock: staggered glass cards. Each card has a small CSS illustration (chosen by the record's `art`) and an optional stat.
// Hover/focus adds the holographic wash and chromatic text split.
export const id = 'shards'

export const css = `
.oc-shards { --pink: #ff4fa3; --cyan: #5ad1e6; }
.oc-shards .sh-grid { list-style: none; margin: 0; padding: 0 0 3.5rem; display: grid; grid-template-columns: repeat(6, minmax(0, 1fr)); gap: 3.6rem 1.25rem; }
.oc-shards .sh-card { grid-column: span 2; position: relative; isolation: isolate; min-width: 0; display: flex; flex-direction: column; gap: .8rem; padding: 1.3rem 1.3rem 1.4rem; min-height: 15rem;
  background: rgb(255 255 255 / .03); -webkit-backdrop-filter: blur(6px); backdrop-filter: blur(6px); border: 1px solid var(--rule);
  transition: transform .6s var(--ease), opacity .7s var(--ease); }
.oc-shards .sh-card:nth-child(1) { grid-column: 1 / span 4; translate: 0 0; }
.oc-shards .sh-card:nth-child(2) { grid-column: 5 / span 2; translate: 0 2.6rem; }
.oc-shards .sh-card:nth-child(3) { grid-column: 1 / span 2; translate: 0 .8rem; }
.oc-shards .sh-card:nth-child(4) { grid-column: 3 / span 2; translate: 0 3rem; }
.oc-shards .sh-card:nth-child(5) { grid-column: 5 / span 2; translate: 0 .4rem; }
.oc-shards .sh-card:nth-child(1) { transition-delay: 0s; }
.oc-shards.is-armed .sh-card { opacity: 0; transform: translateY(22px); }
.oc-shards.is-armed .sh-card.is-in { opacity: 1; transform: none; transition-delay: calc(var(--i) * 110ms); }
.oc-shards .sh-card.is-in:hover, .oc-shards .sh-card.is-in:focus-within, .oc-shards:not(.is-armed) .sh-card:hover, .oc-shards:not(.is-armed) .sh-card:focus-within { transform: translateY(-4px); transition-delay: 0s; }
.oc-shards .sh-edge { position: absolute; inset: -1px; z-index: 1; pointer-events: none; opacity: .55; transition: opacity .5s var(--ease);
  background: radial-gradient(60% 55% at 0 0, rgb(255 79 163 / .22), transparent 70%), radial-gradient(60% 55% at 100% 100%, rgb(90 209 230 / .2), transparent 70%);
  -webkit-mask: linear-gradient(#000 0 0) content-box exclude, linear-gradient(#000 0 0); mask: linear-gradient(#000 0 0) content-box exclude, linear-gradient(#000 0 0); padding: 1px; }
/* holographic wash + accent hairline, as on the active instrument cell */
.oc-shards .sh-wash { position: absolute; inset: 0; z-index: -1; pointer-events: none; opacity: 0; transition: opacity .5s var(--ease);
  background: linear-gradient(165deg, rgb(255 79 163 / .16), transparent 45%), linear-gradient(15deg, rgb(90 209 230 / .16), transparent 40%);
  box-shadow: inset 0 1px 0 rgb(255 140 43 / .7); }
.oc-shards .sh-card:hover .sh-edge, .oc-shards .sh-card:focus-within .sh-edge { opacity: 1; }
.oc-shards .sh-card:hover .sh-wash, .oc-shards .sh-card:focus-within .sh-wash { opacity: 1; }
.oc-shards .sh-val { transition: text-shadow .5s var(--ease); }
.oc-shards .sh-card:hover .sh-val, .oc-shards .sh-card:focus-within .sh-val { text-shadow: -1px 0 rgb(255 79 163 / .4), 1px 0 rgb(90 209 230 / .4); }
.oc-shards .sh-tag { font: 400 .62rem/1 var(--mono); letter-spacing: .14em; color: var(--muted); text-transform: uppercase; }
.oc-shards .sh-art { position: relative; height: 4.2rem; flex: none; display: flex; align-items: center; }
.oc-shards .sh-title { margin: 0; font: 300 clamp(1.15rem, 1rem + .6vw, 1.5rem)/1.2 var(--display); color: var(--fg); overflow-wrap: anywhere; }
.oc-shards .sh-line { margin: 0; font: 400 .78rem/1.6 var(--mono); color: var(--muted); max-width: 38ch; }
.oc-shards .sh-stat { margin-top: auto; padding-top: .7rem; display: flex; align-items: baseline; flex-wrap: wrap; gap: .2rem .6rem; border-top: 1px solid var(--rule); }
.oc-shards .sh-val { font: 200 1.6rem/1 var(--display); color: var(--accent); }
.oc-shards .sh-lbl { font: 400 .62rem/1.4 var(--mono); letter-spacing: .1em; text-transform: uppercase; color: var(--muted); }
.oc-shards .sh-live { display: inline-block; width: .42rem; height: .42rem; border-radius: 50%; background: var(--blue); box-shadow: 0 0 .6rem var(--blue); align-self: center; animation: sh-pulse 2.4s ease-in-out infinite; }
@keyframes sh-pulse { 50% { opacity: .35; } }
.oc-shards .sh-line + .sh-stat { margin-top: auto; }

/* language: stacked phrase fragments */
.oc-shards .a-lang { height: 5.4rem; flex-direction: column; align-items: flex-start; justify-content: center; font-family: var(--display); font-weight: 200; color: var(--fg); line-height: 1.1; gap: .2rem; overflow: hidden; white-space: nowrap; max-width: 100%; }
.oc-shards .a-lang span:nth-child(1) { font-size: 1.9rem; }
.oc-shards .a-lang span:nth-child(2) { font-size: 1.1rem; opacity: .6; margin-left: 1.2rem; transition: transform .6s var(--ease); }
.oc-shards .a-lang span:nth-child(3) { font-size: .75rem; opacity: .5; margin-left: 2.6rem; color: var(--accent); transition: transform .6s var(--ease) .05s; }
.oc-shards .sh-card:hover .a-lang span:nth-child(2) { transform: translateX(.5rem); }
.oc-shards .sh-card:hover .a-lang span:nth-child(3) { transform: translateX(1rem); }
/* f1: sector bars */
.oc-shards .a-f1 { flex-direction: column; justify-content: center; align-items: stretch; gap: .45rem; }
.oc-shards .a-f1 i { display: block; height: 4px; background: rgb(255 255 255 / .08); position: relative; overflow: hidden; }
.oc-shards .a-f1 i::after { content: ''; position: absolute; inset: 0 auto 0 0; width: var(--w); background: var(--accent); opacity: .8; transition: width .8s var(--ease); }
.oc-shards .a-f1 i:nth-child(2)::after { background: var(--pink); opacity: .65; }
.oc-shards .a-f1 i:nth-child(3)::after { background: var(--cyan); opacity: .65; }
.oc-shards .sh-card:hover .a-f1 i:nth-child(1)::after { width: 92%; }
.oc-shards .sh-card:hover .a-f1 i:nth-child(2)::after { width: 48%; }
.oc-shards .sh-card:hover .a-f1 i:nth-child(3)::after { width: 81%; }
/* vinyl: concentric record */
.oc-shards .a-vinyl { height: 5rem; }
.oc-shards .a-vinyl i { display: block; width: 4.6rem; height: 4.6rem; border-radius: 50%;
  background: radial-gradient(circle, var(--accent) 0 12%, #0b0d10 13% 17%, transparent 18%), repeating-radial-gradient(circle, rgb(255 255 255 / .16) 0 1px, transparent 1px 4px), conic-gradient(from 20deg, transparent, rgb(255 79 163 / .18) 12%, transparent 25%, rgb(90 209 230 / .16) 62%, transparent 75%);
  border: 1px solid var(--rule); }
.oc-shards .sh-card:hover .a-vinyl i, .oc-shards .sh-card:focus-within .a-vinyl i { animation: sh-spin 9s linear infinite; }
@keyframes sh-spin { to { transform: rotate(360deg); } }
/* print: layered lines */
.oc-shards .a-print { flex-direction: column-reverse; justify-content: flex-start; align-items: flex-start; gap: 3px; }
.oc-shards .a-print i { display: block; height: 3px; width: var(--w); background: var(--accent); opacity: .7; transition: opacity .4s var(--ease), transform .5s var(--ease); transition-delay: calc(var(--n) * 50ms); }
.oc-shards .a-print i:nth-child(n+6) { opacity: 0; transform: translateY(6px); }
.oc-shards .sh-card:hover .a-print i:nth-child(n+6), .oc-shards .sh-card:focus-within .a-print i:nth-child(n+6) { opacity: .45; transform: none; }
/* tech: node grid */
.oc-shards .a-tech { display: grid; grid-template-columns: repeat(8, .5rem); grid-auto-rows: .5rem; gap: .55rem; align-content: center; width: max-content; max-width: 100%; position: relative; }
.oc-shards .a-tech i { width: 3px; height: 3px; border-radius: 50%; background: var(--muted); opacity: .45; justify-self: center; align-self: center; }
.oc-shards .a-tech i.n { width: 6px; height: 6px; background: var(--accent); opacity: .85; box-shadow: 0 0 .5rem rgb(255 140 43 / .6); transition: transform .5s var(--ease); }
.oc-shards .a-tech svg { position: absolute; inset: 0; width: 100%; height: 100%; overflow: visible; }
.oc-shards .a-tech line { stroke: var(--accent); stroke-opacity: .35; stroke-width: 1; stroke-dasharray: 60; stroke-dashoffset: 0; transition: stroke-dashoffset .8s var(--ease), stroke-opacity .5s var(--ease); }
.oc-shards .sh-card:hover .a-tech line { stroke-opacity: .75; }
.oc-shards .sh-card:hover .a-tech i.n { transform: scale(1.4); }

@media (max-width: 899px) {
  .oc-shards .sh-grid { grid-template-columns: minmax(0, 1fr); gap: 1rem; padding-bottom: 1rem; }
  .oc-shards .sh-card, .oc-shards .sh-card:nth-child(n) { grid-column: 1; translate: 0 0; min-height: 0; }
  .oc-shards .sh-card:nth-child(odd) { margin-right: 1.5rem; }
  .oc-shards .sh-card:nth-child(even) { margin-left: 1.5rem; }
}
@media (prefers-reduced-motion: reduce) {
  .oc-shards .sh-card, .oc-shards .sh-card * { transition: none !important; animation: none !important; }
  .oc-shards.is-armed .sh-card { opacity: 1; transform: none; }
}
`

const art = (it) => {
  switch (it.art) {
    case 'language': {
      const p = it.phrase || ''
      const w = p.replace(/[.!?]+$/, '').split(/\s+/)
      return `<div class="sh-art a-lang" aria-hidden="true"><span>${esc(p)}</span><span>${esc(w[w.length - 1] || p)}</span><span>${esc((w[0] || p).toLowerCase())}…</span></div>`
    }
    case 'f1':
      return '<div class="sh-art a-f1" aria-hidden="true"><i style="--w:72%"></i><i style="--w:38%"></i><i style="--w:56%"></i></div>'
    case 'vinyl':
      return '<div class="sh-art a-vinyl" aria-hidden="true"><i></i></div>'
    case 'print': {
      const ws = [92, 88, 90, 84, 86, 80, 82, 76]
      return `<div class="sh-art a-print" aria-hidden="true">${ws.map((w, n) => `<i style="--w:${w}%;--n:${n}"></i>`).join('')}</div>`
    }
    case 'tech': {
      const nodes = [[1, 0], [3, 0], [2, 1], [5, 1], [4, 2]]
      const cols = 8, rows = 3, step = 1.05 * 16
      const cells = Array.from({ length: cols * rows }, (_, k) => nodes.some(([c, r]) => r * cols + c === k) ? '<i class="n"></i>' : '<i></i>').join('')
      const pt = ([c, r]) => [c * step + 4, r * step + 4]
      const links = [[0, 2], [1, 2], [2, 3], [3, 4]].map(([a, b]) => { const [x1, y1] = pt(nodes[a]); const [x2, y2] = pt(nodes[b]); return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}"/>` }).join('')
      return `<div class="sh-art a-tech" aria-hidden="true">${cells}<svg aria-hidden="true">${links}</svg></div>`
    }
    default: return ''
  }
}

export function mount(host, { items }) {
  const card = (it, i) => {
    const s = it.stat
    const stat = s ? `<div class="sh-stat">${s.live ? '<span class="sh-live" aria-hidden="true"></span>' : ''}<span class="sh-val">${esc(s.value)}</span><span class="sh-lbl">${esc(s.label)}</span></div>` : ''
    return `<li class="sh-card" style="--i:${i}"><span class="sh-wash" aria-hidden="true"></span><span class="sh-edge" aria-hidden="true"></span><span class="sh-tag">${String(i + 1).padStart(2, '0')} / ${String(items.length).padStart(2, '0')}</span>${art(it)}<h3 class="sh-title">${esc(it.title)}</h3><p class="sh-line">${esc(it.line)}</p>${stat}</li>`
  }
  host.innerHTML = `<ul class="sh-grid">${items.map(card).join('')}</ul>`

  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches
  if (reduced || !('IntersectionObserver' in window)) return
  const cards = [...host.querySelectorAll('.sh-card')]
  host.classList.add('is-armed')
  const io = new IntersectionObserver((entries) => {
    for (const e of entries) {
      if (!e.isIntersecting) continue
      e.target.classList.add('is-in')
      io.unobserve(e.target)
    }
  }, { threshold: 0.15 })
  cards.forEach((c) => io.observe(c))
  return () => { io.disconnect(); host.classList.remove('is-armed') }
}
