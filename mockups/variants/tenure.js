// Tenure strip: a thin proportional career instrument (sticky navigator + scrollspy) above compact, uniform contract cards.
import { esc, reduce, fmt, range, dur, months, techKey, techName, contracts as allContracts } from '../lib/data.js'
import { icon } from '../lib/icons.js'

let uidN = 0
const MO = 2.63e9
const wt = (c) => Math.max(1, months(c.start, c.end))
const HINT = 'Select a tool to trace it'

export const css = `
.xv-tenure{--o:255 140 43;--b:90 209 230;--segmin:62px;--sh:36px;position:relative}
.xv-tenure :is(.card,.grp-head,.tk,.more-btn,.rm){scroll-margin-top:calc(var(--stick,0px) + 14px)}

/* ---------- sticky strip ---------- */
.xv-tenure .bar{position:sticky;top:0;z-index:20;padding:10px 0 4px;margin-bottom:clamp(26px,4vw,40px)}
.xv-tenure .bar::before{content:"";position:absolute;z-index:-1;top:0;bottom:0;left:calc(50% - 50vw);right:calc(50% - 50vw);background:rgb(8 10 12/.88);-webkit-backdrop-filter:blur(10px);backdrop-filter:blur(10px);border-bottom:1px solid var(--rule)}
.xv-tenure .strip{position:relative}
.xv-tenure .track{display:flex;align-items:flex-end;width:100%}
.xv-tenure .emp{display:flex;flex-direction:column;flex:var(--w) 1 0;min-width:calc(var(--n)*var(--segmin) + var(--x))}
.xv-tenure .segs{display:flex;align-items:flex-end}
.xv-tenure .seg{position:relative;flex:var(--w) 1 0;min-width:var(--segmin)}
.xv-tenure .gap,.xv-tenure .join,.xv-tenure .now{flex:none;align-self:flex-start;margin-top:24px;height:var(--sh);position:relative}
.xv-tenure .join{width:3px}
.xv-tenure .gap{width:16px}
.xv-tenure .gap::before,.xv-tenure .gap::after{content:"";position:absolute;top:50%;left:50%;width:1px;height:20px;background:var(--muted);opacity:.8;transform:translate(-5px,-50%) rotate(22deg)}
.xv-tenure .gap::after{transform:translate(4px,-50%) rotate(22deg)}
.xv-tenure .now{width:28px}
.xv-tenure .now::before{content:"";position:absolute;left:0;right:0;top:50%;border-top:1px dashed rgb(var(--b)/.7);transform-origin:left;-webkit-mask:linear-gradient(90deg,#000 30%,transparent);mask:linear-gradient(90deg,#000 30%,transparent);transition:transform .8s var(--ease) .9s}
.xv-tenure .now::after{content:"";position:absolute;left:2px;top:50%;width:5px;height:5px;margin-top:-2.5px;border-radius:50%;background:var(--blue);box-shadow:0 0 10px var(--blue);animation:xt-pulse 2.4s ease-in-out infinite}

.xv-tenure .bk,.xv-tenure .bk-sp{display:block;height:24px;width:100%}
.xv-tenure .bk{position:relative;background:none;border:0;padding:0 0 7px;color:var(--muted);font:inherit;font-size:.64rem;line-height:13px;text-align:left;cursor:pointer;transition:color .3s var(--ease)}
.xv-tenure .bk .t{display:block;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;padding-left:1px;transition:opacity .6s var(--ease) 1s}
.xv-tenure .bk::before{content:"";position:absolute;left:0;right:0;bottom:2px;height:5px;border:1px solid rgb(var(--o)/.55);border-bottom:0;transform-origin:left;transition:transform .8s var(--ease) .7s,border-color .3s var(--ease)}
.xv-tenure .bk:hover,.xv-tenure .bk:focus-visible{color:var(--fg)}
.xv-tenure .bk:hover::before,.xv-tenure .bk:focus-visible::before,.xv-tenure .bk.is-on::before{border-color:var(--accent)}
.xv-tenure .bk.is-on{color:var(--accent)}

.xv-tenure .seg-btn{display:block;position:relative;width:100%;height:var(--sh);padding:0;border:0;background:none;color:var(--muted);font:inherit;font-size:.68rem;text-align:left;cursor:pointer;transition:color .3s var(--ease),opacity .4s var(--ease)}
.xv-tenure .box{position:absolute;inset:0;border:1px solid rgb(var(--o)/.38);background:rgb(var(--o)/.05);transform-origin:left;transition:transform .9s var(--ease) calc(var(--i,0)*.12s),border-color .4s var(--ease),background-color .4s var(--ease),box-shadow .4s var(--ease)}
.xv-tenure .nm{position:relative;display:block;width:0;min-width:100%;padding:0 8px;line-height:calc(var(--sh) - 2px);overflow:hidden;white-space:nowrap;transition:opacity .6s var(--ease) calc(var(--i,0)*.12s + .5s)}
.xv-tenure .seg-btn:hover .box{border-color:rgb(var(--o)/.75);background:rgb(var(--o)/.1)}
.xv-tenure .seg-btn:hover,.xv-tenure .seg-btn:focus-visible{color:var(--fg)}
.xv-tenure .seg-btn[aria-current=true]{color:var(--fg)}
.xv-tenure .seg-btn[aria-current=true] .box{border-color:var(--accent);background:rgb(var(--o)/.16)}
.xv-tenure .seg.live .box{border-color:rgb(var(--b)/.55);background:rgb(var(--b)/.07);box-shadow:0 0 18px rgb(var(--b)/.16)}
.xv-tenure .seg.live .nm{color:var(--blue);text-shadow:-1px 0 rgb(var(--o)/.5),1px 0 rgb(var(--b)/.5);animation:xt-flick 7s linear infinite}
.xv-tenure .seg.live .seg-btn:hover .box,.xv-tenure .seg.live .seg-btn[aria-current=true] .box{border-color:var(--blue);background:rgb(var(--b)/.14)}
.xv-tenure .seg.live .box::after{content:"";position:absolute;top:-1px;right:-1px;bottom:-1px;width:2px;background:var(--blue);box-shadow:0 0 12px 1px var(--blue);animation:xt-edge 2.4s ease-in-out infinite}
.xv-tenure .tight .nm{visibility:hidden}
.xv-tenure.tracing .seg:not(.hit) .seg-btn{opacity:.4}
.xv-tenure.tracing .seg.hit .box{border-color:var(--accent)}
.xv-tenure.tracing .seg.live.hit .box{border-color:var(--blue)}

.xv-tenure .ticks{position:relative;display:block;height:20px;margin-top:5px;font-size:.62rem;line-height:16px;color:var(--muted);white-space:nowrap;transition:opacity .6s var(--ease) 1.1s}
.xv-tenure .tk-t{position:absolute;top:0;padding-left:5px}
.xv-tenure .tk-t::before{content:"";position:absolute;left:0;top:-4px;width:1px;height:6px;background:var(--muted)}
.xv-tenure .tk-t.end{left:auto;right:0;padding:0 5px 0 0}
.xv-tenure .tk-t.end::before{left:auto;right:0}
.xv-tenure .tk-t.now-t{color:var(--blue)}
.xv-tenure .tk-t.now-t::before{background:var(--blue)}

.xv-tenure .light{position:absolute;left:0;top:0;width:1px;height:2px;transform-origin:0 0;pointer-events:none;transition:transform .9s var(--ease),opacity .6s var(--ease) 1.2s}
.xv-tenure .light.snap{transition:none}
.xv-tenure .light i{position:absolute;inset:0;transition:opacity .5s var(--ease)}
.xv-tenure .light .lo{background:var(--accent)}
.xv-tenure .light .lb{background:var(--blue);opacity:0}
.xv-tenure .light i::before{content:"";position:absolute;left:0;right:0;top:-7px;height:16px;background:linear-gradient(transparent,rgb(var(--o)/.4) 50%,transparent)}
.xv-tenure .light .lb::before{background:linear-gradient(transparent,rgb(var(--b)/.4) 50%,transparent)}
.xv-tenure .light.is-live .lb{opacity:1}
.xv-tenure .light.is-live .lo{opacity:0}

/* strip draws itself in */
.xv-tenure.anim:not(.drawn) .box{transform:scaleX(0)}
.xv-tenure.anim:not(.drawn) .bk::before,.xv-tenure.anim:not(.drawn) .now::before{transform:scaleX(0)}
.xv-tenure.anim:not(.drawn) :is(.nm,.ticks,.bk .t,.gap,.light){opacity:0}
.xv-tenure.anim:not(.drawn) .now::after{opacity:0}

/* ---------- employer groups ---------- */
.xv-tenure .emps{display:grid;gap:clamp(36px,5vw,56px)}
.xv-tenure .grp-head{display:grid;gap:8px;padding:0 0 20px}
.xv-tenure .grp-head h2{font:300 clamp(1.25rem,3.2vw,1.7rem)/1.15 var(--display);letter-spacing:.06em;overflow-wrap:anywhere}
.xv-tenure .grp-meta{font-size:.76rem;color:var(--muted)}
.xv-tenure .desc{max-width:62ch;font-size:.76rem;line-height:1.75;color:var(--muted);display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
.xv-tenure .desc.full{display:block}
.xv-tenure .rm{justify-self:start;min-height:32px;padding:4px 0;border:0;background:none;color:var(--accent);font:inherit;font-size:.74rem;cursor:pointer;text-decoration:underline;text-decoration-thickness:1px;text-underline-offset:5px}
.xv-tenure .rm[hidden]{display:none}
.xv-tenure .grp-list{display:grid;gap:14px;margin-left:8px;padding-left:clamp(14px,3vw,24px);border-left:1px solid rgb(var(--o)/.42)}
.xv-tenure .grp-list>li{position:relative;min-width:0}
.xv-tenure .grp-list>li::before{content:"";position:absolute;left:calc(-1*clamp(14px,3vw,24px));top:34px;width:clamp(14px,3vw,24px);height:1px;background:rgb(var(--o)/.42)}

/* ---------- cards ---------- */
.xv-tenure .card{position:relative;border:1px solid var(--rule);transition:border-color .6s var(--ease),background-color .6s var(--ease)}
.xv-tenure .card:hover{border-color:rgb(var(--o)/.3)}
.xv-tenure .card.is-on{border-color:rgb(var(--o)/.5);background:rgb(var(--o)/.025)}
.xv-tenure .card.live.is-on{border-color:rgb(var(--b)/.5);background:rgb(var(--b)/.025)}
.xv-tenure .card::before,.xv-tenure .card::after{content:"";position:absolute;width:16px;height:16px;border:1px solid var(--accent);opacity:0;pointer-events:none;transition:transform .6s var(--ease),opacity .6s var(--ease)}
.xv-tenure .card::before{top:-1px;left:-1px;border-right:0;border-bottom:0;transform:translate(5px,5px);}
.xv-tenure .card::after{right:-1px;bottom:-1px;border-left:0;border-top:0;transform:translate(-5px,-5px)}
.xv-tenure .card.live::before,.xv-tenure .card.live::after{border-color:var(--blue)}
.xv-tenure .card.is-on::before,.xv-tenure .card.is-on::after{opacity:1;transform:none}
.xv-tenure .card:focus{outline:none}
.xv-tenure .card:focus-visible{outline:2px solid var(--accent);outline-offset:4px}
.xv-tenure .card-in{display:grid;grid-template-columns:minmax(8.5rem,11rem) minmax(0,1fr);gap:8px 28px;padding:22px 24px}
.xv-tenure .meta{display:flex;flex-direction:column;gap:2px;align-self:start;padding-top:.3rem}
.xv-tenure .dates{font-size:.78rem;line-height:1.5}
.xv-tenure .dur{font-size:.74rem;color:var(--muted)}
.xv-tenure .live-tag{margin-top:6px}
.xv-tenure .main{min-width:0}
.xv-tenure .ch{font:300 clamp(1.02rem,2.4vw,1.2rem)/1.25 var(--display);letter-spacing:.05em;overflow-wrap:anywhere}
.xv-tenure .card.live .ch{text-shadow:-1px 0 rgb(var(--o)/.5),1px 0 rgb(var(--b)/.5);animation:xt-flick 7s linear infinite}
.xv-tenure .role{margin-top:4px;font-size:.8rem;color:var(--muted)}
.xv-tenure .head{margin-top:14px;max-width:62ch;font-size:.86rem;line-height:1.65}
.xv-tenure .tail{display:flex;flex-wrap:wrap;align-items:flex-end;justify-content:space-between;gap:4px 16px;margin-top:18px}
.xv-tenure .tools{min-width:0;flex:1 1 15rem}
.xv-tenure .tk-row{display:flex;flex-wrap:wrap;gap:6px}
.xv-tenure .tk{--ti-size:19px;display:grid;place-items:center;width:36px;height:36px;padding:0;border:1px solid var(--rule);background:none;color:var(--muted);cursor:pointer;transition:border-color .3s var(--ease),color .3s var(--ease),opacity .3s var(--ease),background-color .3s var(--ease)}
.xv-tenure .card.live .tk{color:var(--blue)}
.xv-tenure .tk:hover,.xv-tenure .tk:focus-visible,.xv-tenure .tk.hit{border-color:var(--accent);color:var(--fg)}
.xv-tenure .tk[aria-pressed=true]{background:rgb(var(--o)/.12)}
.xv-tenure.tracing .tk:not(.hit){opacity:.35}
.xv-tenure .cap{min-height:1.6em;margin-top:8px;font-size:.72rem;line-height:1.6;color:var(--muted);transition:color .3s var(--ease)}
.xv-tenure .cap.on{color:var(--fg)}
.xv-tenure .more-btn{display:inline-flex;align-items:center;gap:10px;min-height:44px;padding:0 2px;border:0;background:none;color:var(--accent);font:inherit;font-size:.78rem;cursor:pointer}
.xv-tenure .pm{position:relative;width:11px;height:11px}
.xv-tenure .pm::before,.xv-tenure .pm::after{content:"";position:absolute;left:0;right:0;top:5px;height:1px;background:currentColor;transition:transform .45s var(--ease)}
.xv-tenure .pm::after{transform:rotate(90deg)}
.xv-tenure .card.open .pm::after{transform:rotate(0)}
.xv-tenure .dtl{display:grid;grid-template-rows:0fr;visibility:hidden;transition:grid-template-rows .55s var(--ease),visibility 0s .55s}
.xv-tenure .card.open .dtl{grid-template-rows:1fr;visibility:visible;transition-delay:0s}
.xv-tenure .dtl-in{min-height:0;overflow:hidden}
.xv-tenure .pts{display:grid;gap:10px;padding-top:14px;margin-top:6px;border-top:1px solid var(--rule);max-width:66ch}
.xv-tenure .pts li{position:relative;padding-left:18px;font-size:.8rem;line-height:1.7}
.xv-tenure .pts li::before{content:"";position:absolute;left:0;top:.85em;width:9px;height:1px;background:var(--accent)}
.xv-tenure .stk{margin:14px 0 4px;max-width:66ch;font-size:.74rem;line-height:1.7;color:var(--muted)}
.xv-tenure .stk span{color:var(--fg)}

/* reveal: scan line reconstructs the card */
.xv-tenure .sweep{position:absolute;inset:0;overflow:hidden;pointer-events:none}
.xv-tenure .sweep i{position:absolute;inset:0;border-bottom:1px solid var(--accent);box-shadow:0 10px 20px -6px rgb(var(--o)/.55);opacity:0;transform:translateY(-100%)}
.xv-tenure .card.live .sweep i{border-color:var(--blue);box-shadow:0 10px 20px -6px rgb(var(--b)/.55)}
.xv-tenure .card.scan .sweep i{animation:xt-sweep 1.1s var(--ease) both}
.xv-tenure.anim .card-in{transition:clip-path 1.1s var(--ease),filter 1.1s var(--ease),opacity .7s var(--ease)}
.xv-tenure.anim .card:not(.in) .card-in{clip-path:inset(0 -8px 100% -8px);filter:blur(6px);opacity:0}
.xv-tenure.anim .card.in .card-in{clip-path:inset(0 -8px -8px -8px)}

.xv-tenure.xv-compact{max-width:880px}
.xv-tenure.xv-compact .list{display:grid;gap:14px}

@keyframes xt-sweep{0%{opacity:1;transform:translateY(-100%)}85%{opacity:1}100%{opacity:0;transform:translateY(0)}}
@keyframes xt-flick{0%,91%,100%{opacity:1}92%{opacity:.78}94%{opacity:1}96%{opacity:.88}98%{opacity:1}}
@keyframes xt-edge{50%{opacity:.35}}
@keyframes xt-pulse{50%{opacity:.3}}

@media (max-width:720px){
  .xv-tenure .card-in{grid-template-columns:minmax(0,1fr);padding:18px 16px}
  .xv-tenure .meta{flex-direction:row;flex-wrap:wrap;align-items:baseline;gap:2px 14px;padding-top:0}
  .xv-tenure .live-tag{margin-top:0}
}
@media (max-width:560px){
  .xv-tenure{--sh:44px}
  .xv-tenure .tk-t .m{display:none}
  .xv-tenure .seg-btn{font-size:.62rem}
  .xv-tenure .nm{padding:0 6px}
}
@media (max-width:440px){
  .xv-tenure .bk .k{display:none}
  .xv-tenure .tk-row{gap:5px}
}
@media (pointer:coarse){
  .xv-tenure{--sh:44px}
  .xv-tenure .tk{width:44px;height:44px}
  .xv-tenure .rm{min-height:44px}
  .xv-tenure .bk,.xv-tenure .bk-sp{height:28px}
  .xv-tenure .gap,.xv-tenure .join,.xv-tenure .now{margin-top:28px}
}
@media (max-height:480px){.xv-tenure .bar{position:static}}
@media (prefers-reduced-motion:reduce){
  .xv-tenure .light{transition:none}
  .xv-tenure .card.live .ch,.xv-tenure .seg.live .nm{animation:none}
}
`

const tickHTML = (c) => {
  const s = +c.start, e = +c.end, span = Math.max(1, e - s)
  const mk = (pos, label, cls = '') => {
    const m = label.match(/^(\w+) (\d{4})$/)
    const inner = m ? `<span class="m">${m[1]} </span>${m[2]}` : label
    return `<span class="tk-t ${cls}" data-p="${pos.toFixed(3)}" style="left:${(pos * 100).toFixed(2)}%">${inner}</span>`
  }
  let out = mk(0, fmt(c.start))
  if (months(c.start, c.end) >= 14) {
    for (let y = c.start.getUTCFullYear() + 1; y <= c.end.getUTCFullYear(); y++) {
      const p = (Date.UTC(y, 0, 1) - s) / span
      if (p > 0.16 && p < 0.84) out += mk(p, String(y), 'mid')
    }
  }
  if (c.current) out += `<span class="tk-t end now-t">Now</span>`
  return out
}

export function mount(el, { employers, compact }) {
  const uid = `xt${++uidN}`
  const all = employers.flatMap((e) => e.contracts) // cards, newest first
  const kOf = (c) => all.indexOf(c)
  const ac = new AbortController()
  const cleanups = []
  let goto = () => {}, firstOfGroup = () => 0
  const timers = new Set()
  const later = (fn, ms) => { const t = setTimeout(() => { timers.delete(t); fn() }, ms); timers.add(t); return t }

  /* ---------- markup ---------- */
  const tools = (c) => {
    const seen = new Set()
    return c.skills.filter((s) => { const k = techKey(s); if (seen.has(k)) return false; seen.add(k); return true })
  }
  const tkBtn = (s) => `<li><button type="button" class="tk" data-tech="${esc(techKey(s))}" aria-pressed="false" aria-label="${esc(techName(s))}">${icon(s).replace('role="img"', 'aria-hidden="true"')}</button></li>`

  const cardHTML = (c, h) => {
    const k = kOf(c), sk = tools(c)
    return `<article class="card${c.current ? ' live' : ''}" data-k="${k}" tabindex="-1" aria-labelledby="${uid}-h${k}">
  <span class="sweep" aria-hidden="true"><i></i></span>
  <div class="card-in">
    <div class="meta">
      <p class="dates">${esc(range(c))}</p>
      <p class="dur">${esc(dur(c.start, c.end))}</p>
      ${c.current ? '<p class="live-tag"><span class="badge">Live</span></p>' : ''}
    </div>
    <div class="main">
      <h${h} class="ch" id="${uid}-h${k}">${esc(c.co)}</h${h}>
      <p class="role">${esc(c.title)}</p>
      <p class="head">${esc(c.headline)}</p>
      <div class="tail">
        <div class="tools">
          <ul class="tk-row" aria-label="Technologies">${sk.map(tkBtn).join('')}</ul>
          <p class="cap" aria-hidden="true">${HINT}</p>
        </div>
        <button type="button" class="more-btn" aria-expanded="false" aria-controls="${uid}-m${k}"><span>Details</span><i class="pm" aria-hidden="true"></i></button>
      </div>
      <div class="dtl" id="${uid}-m${k}"><div class="dtl-in">
        <ul class="pts">${c.pts.map((p) => `<li>${esc(p)}</li>`).join('')}</ul>
        <p class="stk"><span>Stack</span> ${sk.map((s) => esc(techName(s))).join(', ')}</p>
      </div></div>
    </div>
  </div>
</article>`
  }

  const asc = [...employers].sort((a, b) => a.start - b.start)
  const ascContracts = asc.flatMap((e) => [...e.contracts].sort((a, b) => a.start - b.start))
  const liveEnd = ascContracts[ascContracts.length - 1]?.current

  const joiner = (prev, next) => {
    const m = (next.start - prev.end) / MO
    return m >= 1.5
      ? { html: `<li class="gap" aria-hidden="true" title="${Math.round(m)} months between roles"></li>`, w: 16 }
      : { html: '<li class="join" aria-hidden="true"></li>', w: 3 }
  }
  const segHTML = (c, i) => {
    const k = kOf(c)
    const name = c.co.split(/\s+/)[0]
    const label = `${c.co}, ${c.title}, ${range(c)}, ${dur(c.start, c.end)}${c.current ? ', current' : ''}`
    return `<li class="seg${c.current ? ' live' : ''}" style="--w:${wt(c)};--i:${i}" data-k="${k}">
  <button type="button" class="seg-btn" data-k="${k}" aria-label="${esc(label)}"><span class="box"></span><span class="nm">${esc(name)}</span></button>
  <span class="ticks" aria-hidden="true">${tickHTML(c)}</span></li>`
  }
  const stripHTML = () => {
    let out = '', prev = null, i = 0
    asc.forEach((e) => {
      const cs = [...e.contracts].sort((a, b) => a.start - b.start)
      if (prev) out += joiner(prev, cs[0]).html
      let inner = '', x = 0, p = null
      cs.forEach((c) => {
        if (p) { const j = joiner(p, c); inner += j.html; x += j.w }
        inner += segHTML(c, i++)
        p = c
      })
      prev = cs[cs.length - 1]
      const w = cs.reduce((a, c) => a + wt(c), 0)
      const g = e.kind === 'group'
      out += `<li class="emp" style="--w:${w};--n:${cs.length};--x:${x}px" ${g ? `data-g="${esc(e.id)}"` : ''}>
  ${g ? `<button type="button" class="bk" data-g="${esc(e.id)}" aria-label="${esc(`${e.name}, subcontractor, ${cs.length} contract${cs.length > 1 ? 's' : ''}. Jump to employer`)}"><span class="t"><span class="n">${esc(e.name)}</span><span class="k">, subcontractor</span></span></button>` : '<span class="bk-sp" aria-hidden="true"></span>'}
  <ol class="segs">${inner}</ol>
</li>`
    })
    if (liveEnd) out += '<li class="now" aria-hidden="true"></li>'
    return `<div class="bar"><nav class="strip" aria-label="Career timeline. Select a role to jump to it."><ol class="track">${out}</ol><span class="light" aria-hidden="true"><i class="lo"></i><i class="lb"></i></span></nav></div>`
  }

  const gDesc = (e) => {
    const id = `${uid}-d${esc(e.id)}`
    return `<header class="grp-head" id="${uid}-g${esc(e.id)}" data-g="${esc(e.id)}" tabindex="-1">
  <h2>${esc(e.name)}</h2>
  <p class="grp-meta">Subcontractor, ${e.contracts.length} contract${e.contracts.length > 1 ? 's' : ''}, ${esc(fmt(e.start))} – ${e.current ? 'Present' : esc(fmt(e.end))}</p>
  ${e.desc ? `<p class="desc" id="${id}">${esc(e.desc)}</p><button type="button" class="rm" aria-expanded="false" aria-controls="${id}">Read more</button>` : ''}
</header>`
  }
  const listHTML = () => {
    if (compact) return `<div class="list">${all.map((c) => cardHTML(c, 3)).join('')}</div>`
    return `<ol class="emps">${employers.map((e) => e.kind === 'group'
      ? `<li><section class="grp" aria-labelledby="${uid}-g${esc(e.id)}-t">${gDesc(e).replace('<h2>', `<h2 id="${uid}-g${esc(e.id)}-t">`)}<ol class="grp-list">${e.contracts.map((c) => `<li>${cardHTML(c, 3)}</li>`).join('')}</ol></section></li>`
      : `<li>${cardHTML(e.contracts[0], 2)}</li>`).join('')}</ol>`
  }

  el.innerHTML = (compact ? '' : stripHTML()) + listHTML()

  /* ---------- refs ---------- */
  const q = (s, r = el) => r.querySelector(s)
  const qa = (s, r = el) => [...r.querySelectorAll(s)]
  const cards = all.map((_, k) => q(`.card[data-k="${k}"]`))
  const segBtns = all.map((_, k) => q(`.seg-btn[data-k="${k}"]`))
  const segs = all.map((_, k) => q(`.seg[data-k="${k}"]`))
  const bar = q('.bar'), strip = q('.strip'), track = q('.track'), light = q('.light')
  const animate = !reduce
  if (animate) el.classList.add('anim')

  /* ---------- disclosure + desc ---------- */
  const tools$ = (c) => new Set(tools(c).map(techKey))
  const toolSets = all.map(tools$)

  el.addEventListener('click', (e) => {
    const t = e.target.closest('button')
    if (!t || !el.contains(t)) return
    if (t.classList.contains('more-btn')) {
      const card = t.closest('.card')
      const open = t.getAttribute('aria-expanded') !== 'true'
      t.setAttribute('aria-expanded', open)
      card.classList.toggle('open', open)
    } else if (t.classList.contains('rm')) {
      const d = document.getElementById(t.getAttribute('aria-controls'))
      const full = !d.classList.contains('full')
      d.classList.toggle('full', full)
      t.setAttribute('aria-expanded', full)
      t.textContent = full ? 'Show less' : 'Read more'
    } else if (t.classList.contains('seg-btn')) {
      goto(+t.dataset.k, false)
    } else if (t.classList.contains('bk')) {
      goto(firstOfGroup(t.dataset.g), true)
    } else if (t.classList.contains('tk')) {
      pin = pin === t.dataset.tech ? null : t.dataset.tech
      trace()
    }
  }, { signal: ac.signal })

  const descs = qa('.desc')
  const fitDesc = () => descs.forEach((d) => {
    const b = d.nextElementSibling
    if (b?.classList.contains('rm') && !d.classList.contains('full')) b.hidden = d.scrollHeight <= d.clientHeight + 1
  })

  /* ---------- tech trace (hover / focus-visible / pinned) ---------- */
  let hover = null, focus = null, pin = null
  const defaultCap = (cap) => { cap.textContent = HINT; cap.classList.remove('on') }
  function trace() {
    const key = hover || focus || pin
    el.classList.toggle('tracing', !!key)
    qa('.tk').forEach((b) => { b.classList.toggle('hit', !!key && b.dataset.tech === key); b.setAttribute('aria-pressed', !!pin && b.dataset.tech === pin) })
    segs.forEach((s, k) => s.classList.toggle('hit', !!key && toolSets[k].has(key)))
    cards.forEach((card, k) => {
      const cap = q('.cap', card)
      if (!key || !toolSets[k].has(key)) return defaultCap(cap)
      const btn = q(`.tk[data-tech="${CSS.escape(key)}"]`, card)
      const name = btn.getAttribute('aria-label')
      const others = allContracts.filter((c) => c.id !== all[k].id && c.skills.some((s) => techKey(s) === key))
      const total = allContracts.length
      cap.textContent = !others.length ? `${name}, only in this role`
        : others.length === total - 1 && total > 2 ? `${name}, used in all ${total} roles`
        : `${name}, also in ${others.map((c) => c.co).join(', ')}`
      cap.classList.add('on')
    })
  }
  el.addEventListener('pointerover', (e) => { const b = e.target.closest?.('.tk'); if (b && el.contains(b) && e.pointerType === 'mouse') { hover = b.dataset.tech; trace() } }, { signal: ac.signal })
  el.addEventListener('pointerout', (e) => { const b = e.target.closest?.('.tk'); if (b && !b.contains(e.relatedTarget) && hover) { hover = null; trace() } }, { signal: ac.signal })
  el.addEventListener('focusin', (e) => { const b = e.target.closest?.('.tk'); if (b && b.matches(':focus-visible')) { focus = b.dataset.tech; trace() } }, { signal: ac.signal })
  el.addEventListener('focusout', (e) => { if (e.target.closest?.('.tk') && focus) { focus = null; trace() } }, { signal: ac.signal })
  el.addEventListener('keydown', (e) => { if (e.key === 'Escape' && (pin || hover || focus)) { pin = null; hover = null; trace() } }, { signal: ac.signal })

  if (compact) {
    cards.forEach((c) => c.classList.add('is-on'))
  } else {
    /* ---------- strip: layout fit, light, active state ---------- */
    let active = -1, forced = false
    const groupOf = (k) => employers.find((e) => e.contracts.includes(all[k]))
    firstOfGroup = (gid) => kOf(employers.find((e) => String(e.id) === String(gid)).contracts[0])

    const moveLight = (snap) => {
      const b = segBtns[active]
      if (!b) return
      const sr = strip.getBoundingClientRect(), br = b.getBoundingClientRect()
      if (snap) light.classList.add('snap')
      light.style.top = `${br.bottom - sr.top - 1}px`
      light.style.transform = `translateX(${br.left - sr.left}px) scaleX(${br.width})`
      light.classList.toggle('is-live', all[active].current)
      if (snap) { void light.offsetWidth; light.classList.remove('snap') }
    }
    const setActive = (k, snap) => {
      if (k === active && !snap) return
      active = k
      cards.forEach((c, i) => c.classList.toggle('is-on', i === k))
      segBtns.forEach((b, i) => { if (i === k) b.setAttribute('aria-current', 'true'); else b.removeAttribute('aria-current') })
      const g = groupOf(k)
      qa('.bk').forEach((b) => b.classList.toggle('is-on', g?.kind === 'group' && String(g.id) === b.dataset.g))
      moveLight(snap)
    }

    // shrink segment minimum when many contracts would overflow the strip
    const nSeg = all.length
    const fit = () => {
      const avail = track.clientWidth - (liveEnd ? 28 : 0) - (asc.length - 1) * 16 - (nSeg - asc.length) * 3
      const m = Math.max(26, Math.min(62, Math.floor(avail / nSeg)))
      el.style.setProperty('--segmin', `${m}px`)
      strip.classList.toggle('tight', m < 46)
      qa('.tk-t.mid').forEach((t) => { const w = t.parentElement.offsetWidth, p = parseFloat(t.dataset.p); t.hidden = p * w < 64 || (1 - p) * w < 64 })
    }

    /* ---------- scrollspy ---------- */
    const vis = new Set()
    let spyIO
    const spy = () => {
      if (forced) return
      let pick = -1, best = -Infinity
      const bt = Math.round(bar.offsetHeight) + 16, bb = innerHeight * 0.45
      cards.forEach((c, i) => {
        if (!vis.has(c)) return
        const r = c.getBoundingClientRect(), o = Math.min(r.bottom, bb) - Math.max(r.top, bt)
        if (o > best) { best = o; pick = i }
      })
      const atEnd = scrollY > 0 && innerHeight + scrollY >= document.documentElement.scrollHeight - 6
      if (atEnd) { const last = cards.length - 1; if (cards[last].getBoundingClientRect().top < innerHeight) pick = last }
      if (pick >= 0) setActive(pick)
    }
    const observe = () => {
      spyIO?.disconnect(); vis.clear()
      const top = Math.round(bar.offsetHeight) + 16
      spyIO = new IntersectionObserver((es) => { es.forEach((e) => (e.isIntersecting ? vis.add(e.target) : vis.delete(e.target))); spy() }, { rootMargin: `-${top}px 0px -55% 0px` })
      cards.forEach((c) => spyIO.observe(c))
    }
    let lastH = 0
    const measure = () => {
      const h = Math.round(bar.offsetHeight)
      el.style.setProperty('--stick', `${getComputedStyle(bar).position === 'sticky' ? h : 0}px`)
      fit()
      moveLight(true)
      if (h !== lastH) { lastH = h; observe() }
    }
    const ro = new ResizeObserver(measure)
    ro.observe(bar)
    ro.observe(el)

    let raf = 0
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(() => { raf = 0; spy() }) }
    const release = (e) => {
      if (e.type === 'keydown' && !['ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', 'Home', 'End', ' '].includes(e.key)) return
      if (forced) { forced = false; spy() }
    }
    addEventListener('scroll', onScroll, { passive: true, signal: ac.signal })
    addEventListener('wheel', release, { passive: true, signal: ac.signal })
    addEventListener('touchmove', release, { passive: true, signal: ac.signal })
    addEventListener('keydown', release, { signal: ac.signal })

    goto = (k, group) => {
      forced = true
      setActive(k)
      const target = group ? q(`.grp-head[data-g="${CSS.escape(groupOf(k).id)}"]`) : cards[k]
      target.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' })
      target.focus({ preventScroll: true })
      const card = cards[k]
      card.classList.remove('scan'); void card.offsetWidth
      if (animate) card.classList.add('scan')
    }
    cleanups.push(() => { ro.disconnect(); spyIO?.disconnect(); cancelAnimationFrame(raf) })

    measure()
    setActive(0, true)
    if (animate) {
      const drawIO = new IntersectionObserver((es) => {
        if (!es.some((e) => e.isIntersecting)) return
        drawIO.disconnect()
        requestAnimationFrame(() => requestAnimationFrame(() => el.classList.add('drawn')))
      })
      drawIO.observe(bar)
      cleanups.push(() => drawIO.disconnect())
    }
  }

  /* ---------- card reveal (scan-line reconstruction) ---------- */
  let revealIO
  const reveal = () => {
    if (!animate) { cards.forEach((c) => c.classList.add('in')); return }
    revealIO = new IntersectionObserver((es) => es.forEach((e) => {
      if (!e.isIntersecting) return
      e.target.classList.add('in', 'scan')
      revealIO.unobserve(e.target)
    }), { threshold: 0.12, rootMargin: '0px 0px -4% 0px' })
    cards.forEach((c) => revealIO.observe(c))
  }
  if (descs.length) { fitDesc(); const dro = new ResizeObserver(fitDesc); dro.observe(el); cleanups.push(() => dro.disconnect()) }
  later(reveal, animate ? 650 : 0)
  cards.forEach((c) => c.addEventListener('animationend', (e) => { if (e.target.closest('.sweep')) c.classList.remove('scan') }, { signal: ac.signal }))

  return () => {
    ac.abort()
    cleanups.forEach((fn) => fn())
    revealIO?.disconnect()
    timers.forEach(clearTimeout)
  }
}
