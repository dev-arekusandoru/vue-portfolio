// Stack matrix: technologies down the side, contracts across the top. A readout instrument, not a spreadsheet.
import { esc, reduce, fmt, range, dur, months, techKey, techName, techIndex } from '../lib/data.js'
import { icon } from '../lib/icons.js'

// every selector is written with § (= `.xv-matrix `) so the whole sheet stays scoped to this variant
export const css = `
.xv-matrix{--hue:var(--accent);--tiny:.7rem;position:relative;color:var(--fg);font-size:.82rem;line-height:1.6}
§button{background:none;border:0;cursor:pointer;text-align:left;color:inherit;font:inherit}
§.nd{display:inline-block;flex:none;width:6px;height:6px;rotate:45deg;background:var(--hue);box-shadow:0 0 8px var(--hue);transition:scale .5s var(--ease)}
§.live{--hue:var(--blue)}

/* readout bar */
§.bar{display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:8px 28px;margin-bottom:16px;font-size:var(--tiny);color:var(--muted)}
§.rd{display:flex;flex-wrap:wrap;align-items:center;gap:4px 16px;min-height:26px}
§.hl{color:var(--fg)}
§.clr{display:inline-flex;align-items:center;min-height:24px;color:var(--accent);border-bottom:1px solid rgb(255 140 43/.45);font-size:inherit}
§.clr[hidden]{display:none}
§.key{display:flex;flex-wrap:wrap;gap:4px 22px;align-items:center}
§.key span{display:inline-flex;align-items:center;gap:9px}

/* instrument */
§.tab{position:relative;padding:20px 14px 8px;border:1px solid var(--rule)}
§.sweep{position:absolute;left:0;right:0;top:0;height:1px;background:var(--accent);box-shadow:0 0 14px 1px rgb(255 140 43/.55),0 -16px 30px rgb(255 140 43/.1);opacity:0;pointer-events:none;z-index:3}
§table{width:100%;border-collapse:separate;border-spacing:0;table-layout:fixed}
§col.ct{width:clamp(140px,20%,215px)}
§col.cn{width:126px}
§th,§td{padding:0;font-weight:300;text-align:left}
§thead th{vertical-align:bottom}
§.corner{padding:0 10px 14px;font-size:var(--tiny);color:var(--muted);border-bottom:1px solid var(--rule)}
§.emp{vertical-align:top}
§.eh{position:relative;margin:0 6px;padding:12px 0 12px;border-top:1px solid var(--accent)}
§.eh::before,§.eh::after{content:"";position:absolute;top:0;width:1px;height:7px;background:var(--accent)}
§.eh::before{left:0}
§.eh::after{right:0}
§.eh-n{font:200 clamp(.95rem,1.7vw,1.3rem)/1.2 var(--display);letter-spacing:.04em;margin-bottom:6px;overflow-wrap:anywhere}
§.eh-m{display:flex;flex-wrap:wrap;gap:0 18px;font-size:var(--tiny);color:var(--muted)}
§.dsc{margin-top:8px;max-width:64ch;font-size:var(--tiny);color:var(--muted)}
§.dsc p{display:-webkit-box;-webkit-box-orient:vertical;-webkit-line-clamp:2;overflow:hidden}
§.dsc.open p{display:block;overflow:visible;-webkit-line-clamp:unset}
§.dsc button{display:inline-flex;align-items:center;min-height:24px;margin-top:2px;font-size:inherit;color:var(--accent);border-bottom:1px solid rgb(255 140 43/.45)}
§.dsc button[hidden]{display:none}

§.chh{padding:0 6px;border-bottom:1px solid var(--rule)}
§.ch{position:relative;display:block;width:100%;padding:12px 8px 16px}
§.ch::after{content:"";position:absolute;left:8px;right:8px;bottom:-1px;height:2px;background:var(--hue);box-shadow:0 0 10px var(--hue);transform:scaleX(0);transform-origin:left;transition:transform .6s var(--ease)}
§.ch:hover::after{transform:scaleX(.3)}
§.ch[aria-pressed=true]::after{transform:scaleX(1)}
§.ch-in{display:block;transition:opacity .45s var(--ease)}
§.ch.is-dim .ch-in{opacity:.42}
§.ch-co{display:block;font-size:.8rem;line-height:1.35;overflow-wrap:anywhere}
§.ch.live .ch-co,§.pn.live .pn-co{text-shadow:-1px 0 rgb(255 140 43/.45),1px 0 rgb(90 209 230/.45)}
§.ch-ti{display:block;font-size:var(--tiny);color:var(--muted);overflow-wrap:anywhere}
§.ch-when{display:block;margin-top:10px;font-size:var(--tiny);color:var(--muted)}
§.ch-dur{display:flex;flex-wrap:wrap;align-items:center;gap:0 12px;min-height:1.6em;font-size:var(--tiny);color:var(--muted)}

§tbody tr{cursor:pointer}
§tbody th,§tbody td{position:relative;height:36px;border-bottom:1px solid var(--rule)}
§tbody tr:last-child>*{border-bottom:0}
§tbody th::after,§tbody td::after{content:"";position:absolute;inset:0;background:var(--accent);opacity:0;pointer-events:none;transition:opacity .45s var(--ease)}
§tbody tr:hover>*::after{opacity:.035}
§tbody tr.is-tech>*::after{opacity:.07}
§.cell,§.tot{border-left:1px solid var(--rule)}
§.cell::before{content:"";position:absolute;inset:0;background:var(--hue);opacity:0;pointer-events:none;transition:opacity .5s var(--ease)}
§.cell.is-sel::before{opacity:.055}

§.tl{position:relative;display:flex;align-items:center;gap:12px;width:100%;min-height:36px;padding:0 10px}
§.tl::before{content:"";position:absolute;left:0;top:8px;bottom:8px;width:2px;background:var(--accent);box-shadow:0 0 8px var(--accent);transform:scaleY(0);transition:transform .5s var(--ease)}
§.tl[aria-pressed=true]::before{transform:scaleY(1)}
§.tli{display:grid;place-items:center;flex:none;width:30px;height:30px;color:var(--muted)}
§tr:hover .tli,§.tl[aria-pressed=true] .tli{color:var(--accent)}
§.tln{font-size:.78rem;line-height:1.3;overflow-wrap:anywhere}
§.tl,§.cx{transition:opacity .45s var(--ease)}
§.has-tech tbody tr:not(.is-tech) .tl,§.has-tech tbody tr:not(.is-tech) .cx{opacity:.28}
§tr.is-tech .nd{scale:1.6}

§.cx{container-type:inline-size;padding:0 12px}
§.cxi{--ov:84px;--p:max(1.6px,min(6px,calc((100cqw - var(--ov)) / var(--maxm))));display:flex;align-items:center;gap:9px;height:35px;color:var(--hue)}
@container (max-width:150px){§.cxi{--ov:30px}§.mo{display:none}}
§.trk{display:block;min-width:0;filter:drop-shadow(0 0 3px var(--hue))}
§.tk{display:block;height:12px;width:calc(var(--m) * var(--p));max-width:100%;background:repeating-linear-gradient(90deg,var(--hue) 0 max(1px,calc(var(--p) * .4)),transparent 0 var(--p))}
§.mo{font-size:.68rem;color:var(--muted);white-space:nowrap}
§.nil{display:block;width:7px;height:7px;margin-left:-1px;background:linear-gradient(var(--rule),var(--rule)) center/100% 1px no-repeat,linear-gradient(var(--rule),var(--rule)) center/1px 100% no-repeat}
§.tot{--hue:rgb(230 224 212/.72)}
§.tot .cxi{--ov:58px;--p:calc((100cqw - var(--ov)) / var(--maxt))}
§.tot .tk{height:3px;background:var(--hue)}

/* cascade: wait = armed, run = lit */
§.mx-wait .cx,§.mx-wait .tot .cx,§.mx-wait .tl,§.mx-wait .lr{opacity:0}
§.cell{--d:calc(var(--r,0ms) + var(--c,0) * 120ms + 140ms)}
§.mx-run .cell.on .nd{animation:mx-pop .6s var(--ease) var(--d) backwards}
§.mx-run .cell.on .tk{animation:mx-fill 1.1s var(--ease) calc(var(--d) + .08s) backwards}
§.mx-run .cell.on .mo{animation:mx-fade .7s var(--ease) calc(var(--d) + .4s) backwards}
§.mx-run .nil{animation:mx-fade .6s var(--ease) var(--d) backwards}
§.mx-run tbody .tl{animation:mx-fade .6s var(--ease) var(--r) backwards}
§.mx-run .tot .cx{animation:mx-fade .8s var(--ease) calc(var(--r) + .6s) backwards}
§.mx-run .lr{animation:mx-fade .7s var(--ease) var(--r) backwards}
§.cell.live.on .trk{animation:mx-flick 9s linear infinite}

/* detail panel */
§.pn{position:relative;margin-top:30px;border:1px solid var(--rule);scroll-margin-top:90px}
§.pn-in{position:relative;display:grid;gap:22px 56px;padding:clamp(20px,3.4vw,36px)}
§.pn-in.armed{clip-path:inset(0 0 100% 0)}
§.scan{position:absolute;left:0;right:0;top:0;height:1px;background:var(--hue);box-shadow:0 0 16px 1px var(--hue),0 -18px 34px rgb(255 255 255/.04);opacity:0;pointer-events:none;z-index:3}
§.pn-under{margin-bottom:10px;font-size:var(--tiny);color:var(--muted)}
§.pn-co{font:200 clamp(1.4rem,3.2vw,2.1rem)/1.15 var(--display);letter-spacing:.03em;overflow-wrap:anywhere}
§.pn.live .pn-co{animation:mx-flick 11s linear infinite}
§.pn-ti{margin-top:12px;font-size:.88rem}
§.pn-when{display:flex;flex-wrap:wrap;align-items:center;gap:2px 16px;margin-top:6px;font-size:var(--tiny);color:var(--muted)}
§.pn-hl{max-width:56ch;font-size:.95rem;line-height:1.65}
§.pn-k{margin:24px 0 10px;font-size:var(--tiny);font-weight:300;color:var(--muted)}
§.stack{display:grid;grid-template-columns:repeat(auto-fill,minmax(172px,1fr));border-top:1px solid var(--rule);border-left:1px solid var(--rule)}
§.stack li{border-right:1px solid var(--rule);border-bottom:1px solid var(--rule)}
§.tile{position:relative;display:flex;align-items:center;gap:10px;width:100%;min-height:46px;padding:8px 12px;--ti-size:20px}
§.tile .nd{width:4px;height:4px;box-shadow:0 0 6px var(--hue)}
§.tw{display:grid;place-items:center;flex:none;width:22px;height:22px;color:var(--muted);transition:color .4s var(--ease)}
§.pn.live .tw{color:var(--blue)}
§.tn{font-size:.76rem;line-height:1.3;overflow-wrap:break-word}
§button.tile:hover .tw,§.tile.is-tech .tw{color:var(--hue)}
§.tile.is-tech{box-shadow:inset 0 0 0 1px var(--hue)}
§.pn-in.go .tile .nd{animation:mx-pop .6s var(--ease) calc(.45s + var(--i) * .06s) backwards}
§.pn-in.go .tile .tw{animation:mx-fade .6s var(--ease) calc(.45s + var(--i) * .06s) backwards}
§.more{display:inline-flex;align-items:center;gap:12px;min-height:32px;margin-top:22px;padding:4px 0;font-size:var(--tiny);border-bottom:1px solid var(--hue)}
§.pl{position:relative;flex:none;width:11px;height:11px}
§.pl::before,§.pl::after{content:"";position:absolute;left:0;top:5px;width:11px;height:1px;background:var(--hue);transition:transform .5s var(--ease)}
§.pl::after{transform:rotate(90deg)}
§.more[aria-expanded=true] .pl::after{transform:rotate(0)}
§.pts{display:grid;gap:12px;max-width:68ch;margin-top:16px}
§.pts[hidden]{display:none}
§.pts li{position:relative;padding-left:22px;font-size:.8rem;line-height:1.75}
§.pts li::before{content:"";position:absolute;left:0;top:.95em;width:12px;height:1px;background:var(--hue)}
§.grp+.grp{margin-top:36px}
§.xv-compact .pn,§.xv-compact .eh{margin-top:0}
§.xv-compact .eh{margin:0}
§.xv-compact .pn{margin-top:16px}

/* mobile: transposed to a per-technology list, no horizontal scroll */
§.list,§.sel{display:none}
@media (min-width:860px){§.pn-in{grid-template-columns:minmax(0,.8fr) minmax(0,1.5fr)}}
@media (max-width:719px){
  §.tab,§.key{display:none}
  §.list,§.sel{display:block}
  §.list{border-top:1px solid var(--rule)}
  §.lr{border-bottom:1px solid var(--rule);padding-bottom:12px;transition:opacity .45s var(--ease)}
  §.has-tech .lr:not(.is-tech){opacity:.3}
  §.lr .tl{min-height:52px;padding:6px 10px 6px 12px}
  §.lr .tln{flex:1;min-width:0}
  §.dots{display:flex;gap:4px}
  §.dt{width:8px;height:8px;border:1px solid var(--rule)}
  §.dt.on{background:var(--hue);border-color:var(--hue)}
  §.lm{min-width:3.4em;text-align:right;font-size:.68rem;color:var(--muted)}
  §.chips{display:flex;flex-wrap:wrap;gap:6px;padding-left:64px}
  §.chip{display:inline-flex;align-items:center;gap:8px;padding:3px 9px;border:1px solid var(--rule);font-size:var(--tiny)}
  §.chip.live{border-color:rgb(90 209 230/.45)}
  §.chip-l{color:var(--blue)}
  §.sel{margin-top:34px}
  §.sel-k{margin-bottom:14px;font-size:var(--tiny);color:var(--muted)}
  §.sg+.sg{margin-top:22px}
  §.sel .eh{margin:0 0 4px}
  §.sel .ch{padding:12px 8px 14px 16px;border-bottom:1px solid var(--rule)}
  §.sel .ch::after{left:0;right:auto;top:8px;bottom:8px;width:2px;height:auto;transform:scaleY(0)}
  §.sel .ch[aria-pressed=true]::after,§.sel .ch:hover::after{transform:scaleY(1)}
  §.pn{margin-top:20px}
}

@keyframes mx-pop{from{opacity:0;scale:.2}to{opacity:1;scale:1}}
@keyframes mx-fade{from{opacity:0}to{opacity:1}}
@keyframes mx-fill{from{clip-path:inset(-8px 100% -8px 0);opacity:0}to{clip-path:inset(-8px -8px -8px 0);opacity:1}}
@keyframes mx-flick{0%,38%,41%,70%,73%,100%{opacity:1}39%{opacity:.7}40%{opacity:.92}71%{opacity:.8}72%{opacity:1}}
@media (prefers-reduced-motion:reduce){
  §*,§*::before,§*::after{animation:none!important;transition:none!important}
  §.pn-in.armed{clip-path:none}
}
`.replaceAll('§', '.xv-matrix ')

let uid = 0
const EASE = 'cubic-bezier(.22,.8,.2,1)'
const mm = (c) => months(c.start, c.end)
const skills = (c) => {
  const seen = new Set()
  return c.skills.map((s) => ({ key: techKey(s), name: techName(s) })).filter((t) => !seen.has(t.key) && seen.add(t.key))
}
const plural = (n, w) => `${n} ${w}${n === 1 ? '' : 's'}`

export function mount(el, { employers, compact }) {
  const id = ++uid
  const cols = employers.flatMap((e) => e.contracts)
  if (!cols.length) return () => {}
  const owner = new Map(), byId = new Map()
  employers.forEach((e) => e.contracts.forEach((c) => { owner.set(c.id, e); byId.set(c.id, c) }))
  const state = { sel: (cols.find((c) => c.current) || cols[0]).id, tech: null }
  const pid = `mxp${id}`
  let k = 0 // unique suffix for generated ids
  const anims = new Set()
  const canIO = typeof IntersectionObserver !== 'undefined'
  const armed = !reduce && canIO

  const tx = techIndex(cols)
  const maxM = Math.max(...cols.map(mm)), maxT = Math.max(...tx.map((t) => t.months), 1)
  const tmap = new Map(tx.map((t) => [t.key, t]))
  const step = Math.min(90, 1300 / Math.max(tx.length, 1))

  /* ---------- markup ---------- */
  const desc = (e, tag) => {
    if (!e.desc) return ''
    const did = `mxd${id}${tag}`
    return `<div class="dsc"><p id="${did}">${esc(e.desc)}</p><button type="button" data-act="desc" aria-expanded="false" aria-controls="${did}" hidden>Read more<span class="sr"> about ${esc(e.name)}</span></button></div>`
  }
  const empHead = (e, tag, meta) => `<div class="eh"><h3 class="eh-n">${esc(e.name)}</h3>${meta && e.kind === 'group' ? `<p class="eh-m"><span>${fmt(e.start)} – ${e.current ? 'Present' : fmt(e.end)}</span><span>${plural(e.contracts.length, 'contract')}</span></p>` : ''}${desc(e, tag)}</div>`

  const chBtn = (c, e) => {
    const grp = e.kind === 'group'
    return `<button type="button" class="ch${c.current ? ' live' : ''}" data-contract="${esc(c.id)}" aria-pressed="false" aria-controls="${pid}"><span class="ch-in">${grp ? '' : `<span class="sr">${esc(c.co)}, </span>`}<span class="ch-co">${esc(grp ? c.co : c.title)}</span>${grp ? `<span class="ch-ti">${esc(c.title)}</span>` : ''}<span class="ch-when">${range(c)}</span><span class="ch-dur"><span>${dur(c.start, c.end)}</span>${c.current ? '<span class="badge">Live</span>' : ''}</span></span></button>`
  }

  const tile = (t, i, interactive) => {
    const body = `<i class="nd" aria-hidden="true"></i><span class="tw" aria-hidden="true">${icon(t.name)}</span><span class="tn">${esc(t.name)}</span>`
    return `<li style="--i:${i}">${interactive ? `<button type="button" class="tile" data-tech="${esc(t.key)}" aria-pressed="false">${body}</button>` : `<div class="tile">${body}</div>`}</li>`
  }

  const panelInner = (c, e, interactive, pk) => `
    <div class="pn-id">
      ${!compact && e.kind === 'group' ? `<p class="pn-under">Under ${esc(e.name)}</p>` : ''}
      <h3 class="pn-co">${esc(c.co)}</h3>
      <p class="pn-ti">${esc(c.title)}</p>
      <p class="pn-when"><span>${range(c)}</span><span>${dur(c.start, c.end)}</span>${c.current ? '<span class="badge">Live</span>' : ''}</p>
    </div>
    <div class="pn-bd">
      <p class="pn-hl">${esc(c.headline)}</p>
      <h4 class="pn-k">Stack</h4>
      <ul class="stack">${skills(c).map((t, i) => tile(t, i, interactive)).join('')}</ul>
      ${c.pts.length ? `<button type="button" class="more" data-act="more" aria-expanded="false" aria-controls="${pk}"><span class="pl" aria-hidden="true"></span><span class="mt">Show details</span></button><ul class="pts" id="${pk}" hidden>${c.pts.map((p) => `<li>${esc(p)}</li>`).join('')}</ul>` : ''}
    </div>`

  const panelShell = (c, e, interactive, domId) => `<section class="pn brk${c.current ? ' live' : ''}"${domId ? ` id="${domId}"` : ''} aria-label="${esc(c.co)} details"><span class="scan" aria-hidden="true"></span><div class="pn-in${armed ? ' armed' : ' go'}">${panelInner(c, e, interactive, `mxk${id}-${++k}`)}</div></section>`

  let html
  if (compact) {
    html = `<div class="mx${armed ? ' mx-wait' : ''}">${employers.map((e, i) => `<div class="grp">${empHead(e, `c${i}`, false)}${e.contracts.map((c) => panelShell(c, e, false)).join('')}</div>`).join('')}</div>`
  } else {
    const empTh = employers.map((e, i) => `<th class="emp" scope="colgroup" colspan="${e.contracts.length}">${empHead(e, `t${i}`, true)}</th>`).join('')
    const conTh = employers.map((e) => e.contracts.map((c) => `<th class="chh" scope="col">${chBtn(c, e)}</th>`).join('')).join('')
    const rows = tx.map((t, i) => {
      const used = new Set(t.contracts.map((c) => c.id))
      const size = 16 + 12 * (t.months / maxT)
      const cells = cols.map((c, ci) => {
        const on = used.has(c.id), n = mm(c)
        return `<td class="cell${on ? ' on' : ''}${c.current ? ' live' : ''}" data-col="${esc(c.id)}" style="--c:${ci}">${on
          ? `<div class="cx"><div class="cxi"><i class="nd" aria-hidden="true"></i><span class="trk"><b class="tk" style="--m:${n}"></b></span><span class="mo">${n} mo</span></div></div><span class="sr">Used, ${plural(n, 'month')}</span>`
          : `<div class="cx"><div class="cxi"><span class="nil" aria-hidden="true"></span></div></div><span class="sr">Not used</span>`}</td>`
      }).join('')
      return `<tr data-row="${esc(t.key)}" style="--r:${Math.round(i * step)}ms"><th scope="row"><button type="button" class="tl" data-tech="${esc(t.key)}" aria-pressed="false"><span class="tli" aria-hidden="true" style="--ti-size:${size.toFixed(1)}px">${icon(t.name)}</span><span class="tln">${esc(t.name)}</span></button></th>${cells}<td class="tot"><div class="cx"><div class="cxi"><span class="trk"><b class="tk" style="--m:${t.months}"></b></span><span class="mo">${t.months} mo</span></div></div></td></tr>`
    }).join('')

    const list = tx.map((t, i) => {
      const used = new Set(t.contracts.map((c) => c.id))
      const size = 16 + 12 * (t.months / maxT)
      return `<li class="lr" data-row="${esc(t.key)}" style="--r:${Math.round(i * step)}ms"><button type="button" class="tl" data-tech="${esc(t.key)}" aria-pressed="false"><span class="tli" aria-hidden="true" style="--ti-size:${size.toFixed(1)}px">${icon(t.name)}</span><span class="tln">${esc(t.name)}</span><span class="dots" aria-hidden="true">${cols.map((c) => `<i class="dt${used.has(c.id) ? ' on' : ''}${c.current ? ' live' : ''}"></i>`).join('')}</span><span class="lm">${t.months} mo</span></button><ul class="chips" aria-label="Used in">${t.contracts.map((c) => `<li class="chip${c.current ? ' live' : ''}"><i class="nd" aria-hidden="true"></i>${esc(c.co)}${c.current ? '<span class="chip-l">Live</span>' : ''}</li>`).join('')}</ul></li>`
    }).join('')

    html = `<div class="mx${armed ? ' mx-wait' : ''}" style="--maxm:${maxM};--maxt:${maxT}">
      <h2 class="sr">Technologies by contract</h2>
      <div class="bar">
        <div class="rd"><p class="read" aria-live="polite"></p><button type="button" class="clr" data-act="clear" hidden>Clear selection</button></div>
        <p class="key"><span><i class="nd" aria-hidden="true"></i>Archive</span><span><i class="nd live" aria-hidden="true"></i>Live</span><span>One tick is one month</span></p>
      </div>
      <div class="tab brk"><span class="sweep" aria-hidden="true"></span>
        <table>
          <caption class="sr">Technologies used in each contract, most used first</caption>
          <colgroup><col class="ct">${cols.map(() => '<col>').join('')}<col class="cn"></colgroup>
          <thead><tr><th class="corner" scope="col" rowspan="2"><span>Technology</span></th>${empTh}<th class="corner" scope="col" rowspan="2"><span>Total time</span></th></tr><tr>${conTh}</tr></thead>
          <tbody>${rows}</tbody>
        </table>
      </div>
      <ul class="list" aria-label="Technologies, most used first">${list}</ul>
      <div class="sel"><p class="sel-k">Contracts: select one for details</p>${employers.map((e, i) => `<div class="sg">${empHead(e, `s${i}`, true)}<ul class="sl">${e.contracts.map((c) => `<li>${chBtn(c, e)}</li>`).join('')}</ul></div>`).join('')}</div>
      <p class="sr" aria-live="polite" data-status></p>
      ${panelShell(byId.get(state.sel), owner.get(state.sel), true, pid)}
    </div>`
  }
  el.innerHTML = html

  /* ---------- refs ---------- */
  const root = el.querySelector('.mx')
  const tab = root.querySelector('.tab'), sweep = root.querySelector('.sweep'), tbody = root.querySelector('tbody')
  const read = root.querySelector('.read'), clr = root.querySelector('.clr'), status = root.querySelector('[data-status]')
  const mainPn = compact ? null : root.querySelector(`#${pid}`)

  /* ---------- motion helpers ---------- */
  const play = (node, frames, opts) => {
    if (reduce || !node.animate) return null
    const a = node.animate(frames, opts)
    anims.add(a)
    a.onfinish = a.oncancel = () => anims.delete(a)
    return a
  }
  const wipe = (node) => play(node, [{ clipPath: 'inset(0 0 100% 0)', filter: 'blur(5px)', opacity: 0.3 }, { clipPath: 'inset(0 0 0% 0)', filter: 'blur(0px)', opacity: 1 }], { duration: 750, easing: EASE })

  // the memorable one: a scan line reconstructs the panel from the top down, blur resolving as it passes
  const reveal = (pn) => {
    const inner = pn.querySelector('.pn-in'), scan = pn.querySelector('.scan')
    inner.classList.remove('armed')
    inner.classList.add('go')
    if (reduce) return
    const h = inner.offsetHeight, d = 1100
    play(inner, [{ clipPath: 'inset(0 0 100% 0)', filter: 'blur(7px)', opacity: 0.4 }, { clipPath: 'inset(0 0 0% 0)', filter: 'blur(0px)', opacity: 1 }], { duration: d, easing: EASE, fill: 'backwards' })
    play(scan, [{ transform: 'translateY(0)', opacity: 1 }, { offset: 0.88, opacity: 1 }, { transform: `translateY(${h}px)`, opacity: 0 }], { duration: d, easing: EASE })
  }

  const runMatrix = () => {
    root.classList.remove('mx-wait')
    root.classList.add('mx-run')
    if (reduce || !tab || !tab.offsetParent) return
    const tb = tbody.getBoundingClientRect(), tr = tab.getBoundingClientRect()
    sweep.style.top = `${tb.top - tr.top}px`
    play(sweep, [{ transform: 'translateY(0)', opacity: 0 }, { offset: 0.06, opacity: 1 }, { offset: 0.92, opacity: 1 }, { transform: `translateY(${tb.height}px)`, opacity: 0 }], { duration: Math.max(600, tx.length * step), easing: 'linear' })
  }

  const observers = []
  if (armed) {
    const once = (nodes, threshold, fn) => {
      const io = new IntersectionObserver((es) => { if (es.some((x) => x.isIntersecting)) { io.disconnect(); fn() } }, { threshold })
      nodes.forEach((n) => io.observe(n))
      observers.push(io)
    }
    if (compact) {
      root.querySelectorAll('.pn').forEach((pn) => once([pn], 0.12, () => { root.classList.remove('mx-wait'); reveal(pn) }))
    } else {
      once([tab, root.querySelector('.list')], 0.1, runMatrix)
      once([mainPn], 0.12, () => reveal(mainPn))
    }
  }

  /* ---------- state ---------- */
  function apply() {
    const t = state.tech, users = t ? new Set(tmap.get(t).contracts.map((c) => c.id)) : null
    root.classList.toggle('has-tech', !!t)
    root.querySelectorAll('[data-contract]').forEach((b) => {
      b.setAttribute('aria-pressed', String(b.dataset.contract === state.sel))
      b.classList.toggle('is-dim', !!users && !users.has(b.dataset.contract))
    })
    root.querySelectorAll('td[data-col]').forEach((td) => td.classList.toggle('is-sel', td.dataset.col === state.sel))
    root.querySelectorAll('[data-row]').forEach((r) => r.classList.toggle('is-tech', r.dataset.row === t))
    root.querySelectorAll('button[data-tech]').forEach((b) => {
      const on = b.dataset.tech === t
      b.setAttribute('aria-pressed', String(on))
      b.closest('.tile')?.classList.toggle('is-tech', on)
    })
    if (read) {
      const x = t && tmap.get(t)
      read.innerHTML = x ? `<span class="hl">${esc(x.name)}</span> used in ${x.contracts.length} of ${cols.length} contracts, ${x.months} mo in total` : 'Select a technology to trace it across contracts.'
      clr.hidden = !x
    }
  }

  function renderPanel(animate) {
    const c = byId.get(state.sel), e = owner.get(c.id)
    mainPn.classList.toggle('live', c.current)
    mainPn.setAttribute('aria-label', `${c.co} details`)
    mainPn.querySelector('.pn-in').innerHTML = panelInner(c, e, true, `mxk${id}-${++k}`)
    apply()
    if (animate) { anims.forEach((a) => a.cancel()); reveal(mainPn) }
  }

  function select(cid, user) {
    if (cid === state.sel) return
    state.sel = cid
    renderPanel(true)
    const c = byId.get(cid)
    status.textContent = `Showing ${c.co}, ${c.title}, ${range(c)}, ${dur(c.start, c.end)}.`
    if (user && getComputedStyle(tab).display !== 'none' && mainPn.getBoundingClientRect().top > innerHeight * 0.7) {
      mainPn.scrollIntoView({ block: 'start', behavior: reduce ? 'auto' : 'smooth' })
    }
  }

  const toggleTech = (key) => { state.tech = state.tech === key ? null : key; apply() }

  function toggleMore(btn) {
    const pn = btn.closest('.pn'), pts = pn.querySelector('.pts'), open = btn.getAttribute('aria-expanded') !== 'true'
    btn.setAttribute('aria-expanded', String(open))
    btn.querySelector('.mt').textContent = open ? 'Hide details' : 'Show details'
    pts.hidden = !open
    if (open) wipe(pts)
  }

  function toggleDesc(btn) {
    const box = btn.closest('.dsc'), open = !box.classList.contains('open')
    box.classList.toggle('open', open)
    btn.setAttribute('aria-expanded', String(open))
    btn.firstChild.textContent = open ? 'Show less' : 'Read more'
  }

  /* ---------- events ---------- */
  const onClick = (e) => {
    const b = e.target.closest('button')
    if (b && root.contains(b)) {
      if (b.dataset.contract) return select(b.dataset.contract, true)
      if (b.dataset.tech) return toggleTech(b.dataset.tech)
      if (b.dataset.act === 'more') return toggleMore(b)
      if (b.dataset.act === 'desc') return toggleDesc(b)
      if (b.dataset.act === 'clear') { state.tech = null; return apply() }
      return
    }
    const row = e.target.closest('tr[data-row]')
    if (row && root.contains(row)) toggleTech(row.dataset.row) // pointer convenience; keyboard uses the row button
  }
  const onKey = (e) => { if (e.key === 'Escape' && state.tech) { state.tech = null; apply() } }
  el.addEventListener('click', onClick)
  el.addEventListener('keydown', onKey)

  // description clamp: only offer the control when the text really is clamped
  const measure = () => root.querySelectorAll('.dsc').forEach((d) => {
    const p = d.firstElementChild, b = d.lastElementChild
    if (!p.offsetParent) return
    b.hidden = !d.classList.contains('open') && p.scrollHeight <= p.clientHeight + 1
  })
  const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(measure) : null
  ro?.observe(root)
  document.fonts?.ready.then(measure)
  measure()

  apply()

  return () => {
    el.removeEventListener('click', onClick)
    el.removeEventListener('keydown', onKey)
    observers.forEach((o) => o.disconnect())
    ro?.disconnect()
    anims.forEach((a) => a.cancel())
  }
}
