// Interlinked: a tech graph. Contracts are nodes on the left, technologies are nodes on a shared rail on the right,
// and every contract is wired to every technology it used. Shared technologies are the junctions where lines converge.
import { esc, reduce, fmt, range, dur, techIndex, techKey } from '../lib/data.js'
import { icon } from '../lib/icons.js'

let uid = 0
const NS = 'http://www.w3.org/2000/svg'
const plural = (n, one, many) => `${n} ${n === 1 ? one : many || one + 's'}`
const span = (m) => {
  const y = Math.floor(m / 12), r = m % 12
  return [y && `${y} yr`, r && `${r} mo`].filter(Boolean).join(' ') || '1 mo'
}
const keysOf = (c) => [...new Set(c.skills.map(techKey))]

export const css = `
.xv-interlinked{--il-hub:62px;--il-sp:26px;--ti-size:20px;position:relative}
.xv-interlinked .il{position:relative;display:grid;gap:16px}
.xv-interlinked .il-emps{display:grid;gap:clamp(24px,3.4vw,40px)}
.xv-interlinked .il-emps>li{position:relative}

/* readout */
.xv-interlinked .il-rd{position:sticky;top:10px;z-index:6;min-height:3.6rem;padding:10px 16px;background:rgb(8 10 12/.95);border:1px solid var(--rule);border-left-color:var(--rule);display:flex;flex-wrap:wrap;align-items:center;gap:2px 22px;font-size:.78rem;line-height:1.55;color:var(--muted);transition:border-color .5s var(--ease)}
.xv-interlinked .il-rd.on{border-left-color:var(--accent)}
.xv-interlinked .il-rn{display:inline-flex;align-items:center;gap:10px;color:var(--accent)}
.xv-interlinked .il-rn .ti{--ti-size:18px}
.xv-interlinked .il-rv{color:var(--fg)}
.xv-interlinked .il-rd.on .il-rv{animation:il-in .5s var(--ease) backwards}

/* stage */
.xv-interlinked .il-st{position:relative}
.xv-interlinked .il-ln{display:none}
.xv-interlinked .il-rail{display:none}

/* contract node */
.xv-interlinked .il-cn{position:relative;padding:20px 22px 12px;border:1px solid var(--rule);background:rgb(230 224 212/.016);transition:border-color .5s var(--ease),background-color .5s var(--ease),opacity .5s var(--ease)}
.xv-interlinked .il-cn::before,.xv-interlinked .il-cn::after{content:"";position:absolute;width:10px;height:10px;border:1px solid var(--accent);pointer-events:none;transition:width .55s var(--ease),height .55s var(--ease)}
.xv-interlinked .il-cn::before{top:-1px;left:-1px;border-right:0;border-bottom:0}
.xv-interlinked .il-cn::after{bottom:-1px;right:-1px;border-left:0;border-top:0}
.xv-interlinked .il-cn.lit{border-color:rgb(255 140 43/.55);background:rgb(255 140 43/.045)}
.xv-interlinked .il-cn.lit::before,.xv-interlinked .il-cn.lit::after{width:22px;height:22px}
.xv-interlinked .il-cn.dim{opacity:.62}
.xv-interlinked .il-cn.dim.is-open{opacity:.9}
.xv-interlinked .il-hub{position:absolute;right:-4px;top:calc(var(--il-hub) - 3.5px);width:7px;height:7px;border-radius:50%;background:var(--bg);border:1px solid var(--accent);transition:background-color .4s var(--ease),box-shadow .4s var(--ease)}
.xv-interlinked .il-cn.lit .il-hub{background:var(--accent);box-shadow:0 0 10px rgb(255 140 43/.8)}
.xv-interlinked .il-cn.is-cur .il-hub{border-color:var(--blue)}
.xv-interlinked .il-cn.is-cur.lit .il-hub{background:var(--accent);border-color:var(--accent)}
.xv-interlinked .il-row{display:flex;flex-wrap:wrap;align-items:center;gap:2px 16px;font-size:.76rem;color:var(--muted);margin-bottom:6px}
.xv-interlinked .il-du{color:var(--fg)}
.xv-interlinked .il-co{font:200 clamp(1.1rem,2vw,1.35rem)/1.2 var(--display);letter-spacing:.06em;overflow-wrap:break-word}
.xv-interlinked .il-cn.is-solo .il-co{font-size:clamp(1.3rem,2.4vw,1.75rem)}
.xv-interlinked .il-cn.is-cur .il-co{text-shadow:-1px 0 rgb(255 140 43/.5),1px 0 rgb(90 209 230/.5);animation:il-flick 9s linear infinite}
.xv-interlinked .il-ti{margin-top:4px;font-size:.84rem;color:var(--muted)}
.xv-interlinked .il-hl{margin-top:12px;font-size:.86rem;line-height:1.65;max-width:56ch}
.xv-interlinked .il-sh{margin-top:12px;display:grid;gap:2px;font-size:.74rem;line-height:1.6;color:var(--muted)}
.xv-interlinked .il-sv{color:var(--fg)}

/* chips: the per-contract tech list used on small screens and the compact card */
.xv-interlinked .il-chips{display:none;flex-wrap:wrap;gap:8px;margin-top:14px}
.xv-interlinked .il-chip{display:inline-flex;align-items:center;gap:8px;min-height:36px;padding:6px 11px 6px 9px;border:1px solid var(--rule);background:none;color:var(--muted);font-size:.74rem;line-height:1.2;text-align:left;transition:border-color .35s var(--ease),color .35s var(--ease),opacity .35s var(--ease),background-color .35s var(--ease)}
.xv-interlinked button.il-chip{cursor:pointer}
.xv-interlinked .il-chip.is-sh{border-color:rgb(230 224 212/.34)}
.xv-interlinked .il-chip .il-cn-n{color:var(--fg)}
.xv-interlinked .il-chip.lit{border-color:var(--accent);color:var(--accent);background:rgb(255 140 43/.07)}
.xv-interlinked .il-chip.dim{opacity:.5}
.xv-interlinked .il-chip .ti{--ti-size:18px}
.xv-interlinked .il-chip.lit .il-cn-n{color:var(--fg)}
.xv-interlinked .il-compact-chips .il-chip{min-height:34px}
.xv-interlinked.xv-compact .il-chips{display:flex}

/* details disclosure */
.xv-interlinked .il-dx{display:inline-flex;align-items:center;gap:10px;margin-top:6px;padding:8px 0;min-height:40px;border:0;background:none;color:var(--accent);font-size:.78rem;cursor:pointer}
.xv-interlinked .il-dxi{position:relative;flex:none;width:11px;height:11px}
.xv-interlinked .il-dxi::before,.xv-interlinked .il-dxi::after{content:"";position:absolute;background:currentColor;transition:transform .45s var(--ease)}
.xv-interlinked .il-dxi::before{left:0;right:0;top:5px;height:1px}
.xv-interlinked .il-dxi::after{top:0;bottom:0;left:5px;width:1px}
.xv-interlinked .il-dx[aria-expanded=true] .il-dxi::after{transform:scaleY(0)}
.xv-interlinked .il-dp{display:grid;grid-template-rows:0fr;transition:grid-template-rows .55s var(--ease)}
.xv-interlinked .il-dp.open{grid-template-rows:1fr}
.xv-interlinked .il-dp>div{overflow:hidden;min-height:0;opacity:0;filter:blur(4px);transition:opacity .5s var(--ease),filter .5s var(--ease)}
.xv-interlinked .il-dp.open>div{opacity:1;filter:none}
.xv-interlinked .il-pts{display:grid;gap:12px;margin:6px 0 10px;padding-top:16px;border-top:1px solid var(--rule)}
.xv-interlinked .il-pts li{position:relative;padding-left:20px;font-size:.84rem;line-height:1.7;max-width:64ch}
.xv-interlinked .il-pts li::before{content:"";position:absolute;left:0;top:.85em;width:10px;height:1px;background:var(--accent)}

/* employer frame (group) */
.xv-interlinked .il-gf{position:relative;padding:28px 26px 26px;border:1px solid var(--rule)}
.xv-interlinked .il-gh{display:grid;gap:8px;justify-items:start;margin-bottom:24px;max-width:62ch}
.xv-interlinked .il-gn{font:200 clamp(1.5rem,3.2vw,2.3rem)/1.1 var(--display);letter-spacing:.08em;overflow-wrap:break-word;max-width:100%}
.xv-interlinked .il-gm{display:flex;flex-wrap:wrap;gap:0 18px;font-size:.76rem;color:var(--muted)}
.xv-interlinked .il-gd{font-size:.8rem;line-height:1.7;color:var(--muted);display:-webkit-box;-webkit-box-orient:vertical;-webkit-line-clamp:2;overflow:hidden}
.xv-interlinked .il-gd.open{display:block;-webkit-line-clamp:unset;overflow:visible}
.xv-interlinked .il-gx{padding:6px 0;min-height:32px;border:0;background:none;color:var(--accent);font-size:.76rem;cursor:pointer}
.xv-interlinked .il-gx[hidden]{display:none}
.xv-interlinked .il-cl{display:grid;gap:16px;padding-left:var(--il-sp)}
.xv-interlinked .il-cl>li{position:relative}
.xv-interlinked .il-cl>li::before{content:"";position:absolute;left:calc(var(--il-sp) * -1);top:-16px;bottom:-16px;width:1px;background:rgb(255 140 43/.45)}
.xv-interlinked .il-cl>li:first-child::before{top:-24px}
.xv-interlinked .il-cl>li:last-child::before{bottom:auto;height:calc(var(--il-hub) + 16px)}
.xv-interlinked .il-cl>li:first-child:last-child::before{height:calc(var(--il-hub) + 24px)}
.xv-interlinked .il-cl>li::after{content:"";position:absolute;left:calc(var(--il-sp) * -1);top:var(--il-hub);width:var(--il-sp);height:1px;background:rgb(255 140 43/.45)}

/* rail */
.xv-interlinked .il-rh{font:300 .76rem/1 var(--mono);color:var(--muted);margin-bottom:18px;letter-spacing:.02em}
.xv-interlinked .il-rl{flex:1;display:flex;flex-direction:column;justify-content:space-between;gap:12px}
.xv-interlinked .il-tn{display:flex;align-items:center;gap:14px;width:100%;padding:0;border:0;background:none;text-align:left;cursor:pointer;color:var(--muted);transition:opacity .4s var(--ease)}
.xv-interlinked .il-tb{position:relative;flex:none;display:grid;place-items:center;width:40px;height:40px;border:1px solid var(--rule);background:var(--bg);color:var(--muted);transition:border-color .4s var(--ease),color .4s var(--ease),background-color .4s var(--ease)}
.xv-interlinked .il-tb::before{content:"";position:absolute;left:-4px;top:50%;width:7px;height:7px;margin-top:-3.5px;border-radius:50%;background:var(--bg);border:1px solid rgb(230 224 212/.4);transition:background-color .4s var(--ease),border-color .4s var(--ease),box-shadow .4s var(--ease)}
.xv-interlinked .il-tn.is-sh .il-tb{border-color:rgb(230 224 212/.36)}
.xv-interlinked .il-tl{display:grid;gap:0;min-width:0}
.xv-interlinked .il-tnm{font-size:.8rem;line-height:1.35;color:var(--fg);overflow-wrap:anywhere}
.xv-interlinked .il-tm{font-size:.72rem;line-height:1.35;color:var(--muted)}
.xv-interlinked .il-tn:hover .il-tb,.xv-interlinked .il-tn.lit .il-tb{border-color:var(--accent);color:var(--accent)}
.xv-interlinked .il-tn.lit .il-tb::before{background:var(--accent);border-color:var(--accent);box-shadow:0 0 8px rgb(255 140 43/.8)}
.xv-interlinked .il-tn[aria-pressed=true] .il-tb{background:rgb(255 140 43/.12)}
.xv-interlinked .il-tn.dim{opacity:.5}

/* lines */
.xv-interlinked .il-ln path{fill:none}
.xv-interlinked .il-b{stroke:rgb(230 224 212/.14);stroke-width:1;stroke-dasharray:1 1;stroke-dashoffset:1;transition:stroke-dashoffset 1.3s var(--ease) calc(.45s + var(--i) * 45ms),opacity .45s var(--ease),stroke .45s var(--ease)}
.xv-interlinked .il-b.is-sh{stroke:rgb(230 224 212/.3)}
.xv-interlinked .il.in .il-b{stroke-dashoffset:0}
.xv-interlinked .il.is-act .il-b{opacity:.4}
.xv-interlinked .il.is-act .il-b.sel{opacity:1}
.xv-interlinked .il-hs{filter:drop-shadow(0 0 3px rgb(255 140 43/.75))}
.xv-interlinked .il-h{stroke:var(--accent);stroke-width:1.25;stroke-dasharray:1 1;stroke-dashoffset:1;transition:stroke-dashoffset .5s var(--ease)}
.xv-interlinked .il-h.on{stroke-dashoffset:0;transition:stroke-dashoffset 1s var(--ease) calc(var(--cj) * 90ms)}

/* reconstruct on arrival */
.xv-interlinked .il:not(.in) .il-cn,.xv-interlinked .il:not(.in) .il-gh,.xv-interlinked .il:not(.in) .il-tn,.xv-interlinked .il:not(.in) .il-rd{opacity:0}
.xv-interlinked .il.in .il-cn{animation:il-res 1s var(--ease) backwards;animation-delay:calc(var(--n) * .14s)}
.xv-interlinked .il.in .il-gh,.xv-interlinked .il.in .il-rd{animation:il-fade .8s var(--ease) backwards}
.xv-interlinked .il.in .il-tn{animation:il-fade .8s var(--ease) backwards;animation-delay:calc(.35s + var(--i) * 45ms)}
@keyframes il-res{from{opacity:0;filter:blur(6px);clip-path:inset(0 0 100% 0)}to{opacity:1;filter:blur(0);clip-path:inset(-12px -12px -12px -12px)}}
@keyframes il-fade{from{opacity:0;filter:blur(4px)}to{opacity:1;filter:blur(0)}}
@keyframes il-in{from{opacity:0}to{opacity:1}}
@keyframes il-flick{0%,86%,100%{opacity:1}88%{opacity:.8}90%{opacity:1}93%{opacity:.88}95%{opacity:1}}

/* wide: graph */
@media (min-width:820px){
  .xv-interlinked .il-st{display:grid;grid-template-columns:minmax(0,1fr) minmax(210px,250px);column-gap:clamp(96px,13vw,170px);align-items:stretch}
  .xv-interlinked .il-ln{display:block;position:absolute;inset:0;width:100%;height:100%;overflow:visible;pointer-events:none;z-index:0}
  .xv-interlinked .il-emps{position:relative;z-index:1}
  .xv-interlinked .il-rail{display:flex;flex-direction:column;position:relative;z-index:1}
  .xv-interlinked:not(.xv-compact) .il-chips{display:none}
}
/* narrow: stacked cards, links live in the chips and the text */
@media (max-width:819.98px){
  .xv-interlinked .il-chips{display:flex}
  .xv-interlinked .il-hub{display:none}
  .xv-interlinked{--il-sp:14px}
  .xv-interlinked .il-gf{padding:22px 14px 14px}
  .xv-interlinked .il-cn{padding:16px 16px 8px}
  .xv-interlinked .il-rd{min-height:5.8rem}
}
.xv-interlinked.xv-compact .il-hub{display:none}
.xv-interlinked.xv-compact .il-emps{gap:16px;max-width:760px}

@media (prefers-reduced-motion:reduce){
  .xv-interlinked *,.xv-interlinked *::before,.xv-interlinked *::after{animation:none!important;transition:none!important}
  .xv-interlinked .il-b{stroke-dashoffset:0}
  .xv-interlinked .il:not(.in) .il-cn,.xv-interlinked .il:not(.in) .il-gh,.xv-interlinked .il:not(.in) .il-tn,.xv-interlinked .il:not(.in) .il-rd{opacity:1}
}
`

export function mount(el, { employers, compact }) {
  const id = ++uid
  const all = employers.flatMap((e) => e.contracts)
  const T = new Map(techIndex(all).map((t) => [t.key, t]))
  const cKeys = new Map(all.map((c) => [c.id, keysOf(c)]))
  const cIndex = new Map(all.map((c, i) => [c.id, i]))
  const isShared = (k) => T.get(k).contracts.length > 1
  const coNames = (k, except) => T.get(k).contracts.filter((c) => c !== except).map((c) => c.co)
  let dp = 0

  /* rail order: barycentre of the contracts that used it, so wires cross as little as possible */
  const order = [...T.keys()].sort((a, b) => {
    const bary = (k) => T.get(k).contracts.reduce((s, c) => s + cIndex.get(c.id), 0) / T.get(k).contracts.length
    const pos = (k) => cKeys.get(T.get(k).contracts[0].id).indexOf(k)
    return bary(a) - bary(b) || (isShared(b) - isShared(a)) || pos(a) - pos(b)
  })

  const label = (k, c) => {
    const t = T.get(k), o = coNames(k, c)
    return `${t.name}, ${o.length ? `also used at ${o.join(', ')}` : 'only used here'}`
  }
  const chips = (c) => {
    if (compact) return `<ul class="il-chips" aria-label="Technologies">${cKeys.get(c.id).map((k) => `<li class="il-chip"><span aria-hidden="true">${icon(T.get(k).name)}</span><span class="il-cn-n">${esc(T.get(k).name)}</span></li>`).join('')}</ul>`
    return `<ul class="il-chips" aria-label="Technologies, select one to trace it across contracts">${cKeys.get(c.id).map((k) => `<li><button type="button" class="il-chip${isShared(k) ? ' is-sh' : ''}" data-k="${esc(k)}" aria-pressed="false" aria-label="${esc(label(k, c))}"><span aria-hidden="true">${icon(T.get(k).name)}</span><span class="il-cn-n">${esc(T.get(k).name)}</span></button></li>`).join('')}</ul>`
  }
  const shares = (c) => all.filter((o) => o !== c)
    .map((o) => ({ o, ks: cKeys.get(c.id).filter((k) => cKeys.get(o.id).includes(k)) })).filter((x) => x.ks.length)

  const card = (c, { h = 4, solo = false, n = 0 } = {}) => {
    const pid = `il${id}-p${dp++}`
    const sh = compact ? [] : shares(c)
    return `<article class="il-cn${c.current ? ' is-cur' : ''}${solo ? ' is-solo' : ''}" data-card="${esc(c.id)}" style="--n:${n}">
      <i class="il-hub" aria-hidden="true"></i>
      <div class="il-row"><span>${esc(range(c))}</span><span class="il-du">${esc(dur(c.start, c.end))}</span>${c.current ? '<span class="badge">Live</span>' : ''}</div>
      <h${h} class="il-co">${esc(c.co)}</h${h}>
      <p class="il-ti">${esc(c.title)}</p>
      <p class="il-hl">${esc(c.headline)}</p>
      ${chips(c)}
      ${sh.length ? `<ul class="il-sh" aria-label="Technologies shared with other contracts">${sh.map(({ o, ks }) => `<li>Shared with ${esc(o.co)}: <span class="il-sv">${ks.map((k) => esc(T.get(k).name)).join(', ')}</span></li>`).join('')}</ul>` : ''}
      <button type="button" class="il-dx" data-dx aria-expanded="false" aria-controls="${pid}"><span class="il-dxi" aria-hidden="true"></span><span data-dxt>Details</span><span class="sr"> for ${esc(c.co)}, ${esc(c.title)}</span></button>
      <div class="il-dp" id="${pid}" inert><div><ul class="il-pts">${c.pts.map((p) => `<li>${esc(p)}</li>`).join('')}</ul></div></div>
    </article>`
  }

  let n = 0
  const employer = (e) => {
    if (compact) return e.contracts.map((c) => `<li>${card(c, { h: 3, solo: true, n: n++ })}</li>`).join('')
    if (e.kind !== 'group') return `<li>${card(e.contracts[0], { h: 3, solo: true, n: n++ })}</li>`
    const did = `il${id}-g${dp++}`
    return `<li><div class="il-gf brk">
      <header class="il-gh">
        <h3 class="il-gn">${esc(e.name)}</h3>
        <p class="il-gm"><span>${esc(fmt(e.start))} – ${e.current ? 'Present' : esc(fmt(e.end))}</span><span>${plural(e.contracts.length, 'contract')}</span></p>
        ${e.desc ? `<p class="il-gd" id="${did}">${esc(e.desc)}</p><button type="button" class="il-gx" data-gx aria-expanded="false" aria-controls="${did}" hidden>Read more<span class="sr"> about ${esc(e.name)}</span></button>` : ''}
      </header>
      <ul class="il-cl" aria-label="Contracts at ${esc(e.name)}">${e.contracts.map((c) => `<li>${card(c, { h: 4, n: n++ })}</li>`).join('')}</ul>
    </div></li>`
  }

  const rail = compact ? '' : `<div class="il-rail"><h3 class="il-rh">Technologies</h3><ul class="il-rl">${order.map((k, i) => {
    const t = T.get(k), nc = t.contracts.length
    const full = `${t.name}, ${plural(nc, 'contract')}, ${span(t.months)}, used at ${t.contracts.map((c) => c.co).join(', ')}`
    return `<li><button type="button" class="il-tn${nc > 1 ? ' is-sh' : ''}" data-k="${esc(k)}" aria-pressed="false" aria-label="${esc(full)}" style="--i:${i}"><span class="il-tb" aria-hidden="true">${icon(t.name)}</span><span class="il-tl"><span class="il-tnm">${esc(t.name)}</span>${nc > 1 ? `<span class="il-tm">${nc} contracts</span>` : ''}</span></button></li>`
  }).join('')}</ul></div>`

  el.innerHTML = `<div class="il">
    ${compact ? '' : '<h2 class="sr">Experience graph</h2><div class="il-rd" data-rd></div>'}
    <div class="il-st">
      ${compact ? '' : '<svg class="il-ln" aria-hidden="true" focusable="false"><g class="il-bs"></g><g class="il-hs"></g></svg>'}
      <ul class="il-emps">${employers.map(employer).join('')}</ul>
      ${rail}
    </div>
    <p class="sr" role="status" aria-live="polite" data-live></p>
  </div>`

  const root = el.querySelector('.il'), st = el.querySelector('.il-st')
  const live = el.querySelector('[data-live]'), rd = el.querySelector('[data-rd]')
  const wide = matchMedia('(min-width:820px)')
  const cleanups = []
  const on = (t, ev, fn, o) => { t.addEventListener(ev, fn, o); cleanups.push(() => t.removeEventListener(ev, fn, o)) }

  /* disclosures */
  on(el, 'click', (e) => {
    const dx = e.target.closest('[data-dx]')
    if (dx && el.contains(dx)) {
      const open = dx.getAttribute('aria-expanded') !== 'true', p = dx.nextElementSibling
      dx.setAttribute('aria-expanded', open)
      dx.querySelector('[data-dxt]').textContent = open ? 'Hide details' : 'Details'
      p.classList.toggle('open', open); p.inert = !open
      dx.closest('.il-cn').classList.toggle('is-open', open)
      return
    }
    const gx = e.target.closest('[data-gx]')
    if (gx && el.contains(gx)) {
      const open = gx.getAttribute('aria-expanded') !== 'true', p = el.querySelector(`#${gx.getAttribute('aria-controls')}`)
      gx.setAttribute('aria-expanded', open)
      gx.firstChild.textContent = open ? 'Show less' : 'Read more'
      p.classList.toggle('open', open)
    }
  })
  const clampCheck = () => el.querySelectorAll('[data-gx]').forEach((b) => {
    const p = el.querySelector(`#${b.getAttribute('aria-controls')}`)
    b.hidden = b.getAttribute('aria-expanded') !== 'true' && p.scrollHeight <= p.clientHeight + 1
  })

  /* graph */
  const links = []
  const cards = new Map([...el.querySelectorAll('[data-card]')].map((a) => [a.dataset.card, a]))
  const btns = [...el.querySelectorAll('[data-k]')]
  let pin = null, hov = null
  if (!compact) {
    const bs = el.querySelector('.il-bs'), hs = el.querySelector('.il-hs')
    const nodes = new Map([...el.querySelectorAll('.il-rail [data-k]')].map((b) => [b.dataset.k, b.querySelector('.il-tb')]))
    let i = 0
    all.forEach((c, ci) => cKeys.get(c.id).forEach((k) => {
      const mk = (cls, parent) => {
        const p = document.createElementNS(NS, 'path')
        p.setAttribute('class', cls); p.setAttribute('pathLength', '1')
        p.style.setProperty('--i', i); p.style.setProperty('--cj', ci)
        parent.append(p); return p
      }
      links.push({ k, c: c.id, hub: cards.get(c.id).querySelector('.il-hub'), node: nodes.get(k), b: mk(`il-b${isShared(k) ? ' is-sh' : ''}`, bs), h: mk('il-h', hs) })
      i++
    }))
  }

  function layout() {
    if (compact || !wide.matches) return
    const s = st.getBoundingClientRect()
    if (!s.width) return
    const r = (v) => Math.round(v * 10) / 10
    for (const L of links) {
      const h = L.hub.getBoundingClientRect(), nr = L.node.getBoundingClientRect()
      const x0 = r(h.left + h.width / 2 - s.left), y0 = r(h.top + h.height / 2 - s.top)
      const x1 = r(nr.left - s.left), y1 = r(nr.top + nr.height / 2 - s.top)
      const m = r((x0 + x1) / 2)
      L.b.setAttribute('d', `M${x0} ${y0}C${m} ${y0} ${m} ${y1} ${x1} ${y1}`)
      L.h.setAttribute('d', `M${x1} ${y1}C${m} ${y1} ${m} ${y0} ${x0} ${y0}`)
    }
  }

  const defaultRd = 'Select a technology to follow it from contract to contract.'
  function readout(a) {
    if (!rd) return
    rd.classList.toggle('on', !!a)
    if (!a) { rd.textContent = defaultRd; return }
    if (a.t === 'k') {
      const t = T.get(a.id)
      rd.innerHTML = `<span class="il-rn">${icon(t.name)}${esc(t.name)}</span><span class="il-rv">${plural(t.contracts.length, 'contract')}, ${span(t.months)}</span><span>Used at ${esc(t.contracts.map((c) => c.co).join(', '))}${pin && pin.id === a.id ? '. Selected.' : ''}</span>`
    } else {
      const c = all.find((x) => x.id === a.id), ks = cKeys.get(c.id), sh = ks.filter(isShared)
      rd.innerHTML = `<span class="il-rn">${esc(c.co)}</span><span class="il-rv">${plural(ks.length, 'technology', 'technologies')}</span>${sh.length ? `<span>Shared with other contracts: ${esc(sh.map((k) => T.get(k).name).join(', '))}</span>` : '<span>Nothing shared with other contracts.</span>'}`
    }
  }

  function apply() {
    const a = hov || pin
    const kset = a ? new Set(a.t === 'k' ? [a.id] : cKeys.get(a.id)) : null
    const cset = a ? new Set(a.t === 'k' ? T.get(a.id).contracts.map((c) => c.id) : [a.id]) : null
    root.classList.toggle('is-act', !!a)
    for (const b of btns) {
      const lit = !!kset?.has(b.dataset.k)
      b.classList.toggle('lit', lit); b.classList.toggle('dim', !!a && !lit)
      b.setAttribute('aria-pressed', !!pin && pin.id === b.dataset.k)
    }
    for (const [cid, a2] of cards) {
      const lit = !!cset?.has(cid)
      a2.classList.toggle('lit', lit)
      a2.classList.toggle('dim', !!a && a.t === 'k' && !lit)
    }
    for (const L of links) {
      const hit = !!a && (a.t === 'k' ? L.k === a.id : L.c === a.id)
      L.b.classList.toggle('sel', hit); L.h.classList.toggle('on', hit)
    }
    readout(a)
  }
  const setHov = (h) => { if (hov?.t === h?.t && hov?.id === h?.id) return; hov = h; apply() }

  if (!compact) {
    const pick = (t) => {
      const b = t.closest?.('[data-k]'), c = t.closest?.('[data-card]')
      return b ? { t: 'k', id: b.dataset.k } : c ? { t: 'c', id: c.dataset.card } : null
    }
    on(root, 'pointerover', (e) => { if (e.pointerType === 'mouse') setHov(pick(e.target)) })
    on(root, 'pointerleave', () => setHov(null))
    on(root, 'focusin', (e) => { if (e.target.matches(':focus-visible')) setHov(pick(e.target)) })
    on(root, 'focusout', () => setHov(null))
    on(root, 'click', (e) => {
      const b = e.target.closest('[data-k]')
      if (!b) return
      pin = pin && pin.id === b.dataset.k ? null : { t: 'k', id: b.dataset.k }
      const t = pin && T.get(pin.id)
      live.textContent = t ? `${t.name} selected: ${plural(t.contracts.length, 'contract')}, ${span(t.months)}. Used at ${t.contracts.map((c) => c.co).join(', ')}.` : 'Selection cleared.'
      apply()
    })
    on(root, 'keydown', (e) => {
      if (e.key !== 'Escape' || !(pin || hov)) return
      pin = null; hov = null; live.textContent = 'Selection cleared.'; apply()
    })
  }

  /* arrival + relayout */
  let raf = 0
  const relayout = () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(() => { layout(); clampCheck() }) }
  const ro = new ResizeObserver(() => { layout(); clampCheck() })
  ro.observe(st)
  on(wide, 'change', relayout)
  document.fonts?.ready.then(relayout)
  let io
  const arrive = () => { root.classList.add('in'); layout(); clampCheck() }
  if (reduce) arrive()
  else {
    io = new IntersectionObserver((es) => { if (es.some((x) => x.isIntersecting)) { arrive(); io.disconnect() } }, { threshold: 0 })
    io.observe(root)
  }
  apply()
  layout(); clampCheck()

  return () => {
    cancelAnimationFrame(raf)
    ro.disconnect(); io?.disconnect()
    cleanups.forEach((fn) => fn())
  }
}
