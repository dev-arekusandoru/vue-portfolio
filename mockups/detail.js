// Project detail dialog, drafting-table treatment: faint grid, cover plate and figure captions, a title block for the at-a-glance facts,
// and a boot build-up when it opens.
import { esc, techName } from './lib/data.js'
import { icon } from './lib/icons.js'

const PINK = '#ff4fa3', CYAN = '#5ad1e6'
const OR = '255 140 43'
const mon = (d) => d.toLocaleDateString('en-US', { month: 'short', year: 'numeric', timeZone: 'UTC' })
export const period = (p) => `${mon(p.start)} – ${p.current ? 'Present' : p.end ? mon(p.end) : mon(p.start)}`
const link = (u, t) => `<a class="pj-lk" href="${esc(u)}" target="_blank" rel="noopener noreferrer">${t}<span aria-hidden="true"> ↗</span></a>`
export const links = (p) => [p.demo_url && link(/^https?:/.test(p.demo_url) ? p.demo_url : `https://${p.demo_url}`, 'Demo'), p.code_url && link(p.code_url, 'Code')].filter(Boolean).join('')
export const status = (p) => `<span class="pj-st ${p.status}">${p.status === 'active' ? 'Active' : 'Shipped'}</span>`


export const css = `
@property --ga{syntax:'<number>';inherits:true;initial-value:1}
.pj-dlg{--pp:clamp(20px,4vw,40px)}

/* shell: the dialog does not scroll; .pj-sc does, so the close button and nav stay put */
.pj-dlg{position:fixed;inset:0;width:min(860px,100% - 24px);max-width:none;max-height:min(92dvh,900px);margin:auto;padding:0;border:1px solid var(--rule);background:var(--bg);color:var(--fg);font:300 .92rem/1.7 var(--mono);overflow:hidden;opacity:0;transform:translateY(14px) scale(.985);transition:opacity .45s var(--ease),transform .6s var(--ease),overlay .6s allow-discrete,display .6s allow-discrete}
.pj-dlg[open]{display:flex;flex-direction:column;opacity:1;transform:none}
@starting-style{.pj-dlg[open]{opacity:0;transform:translateY(14px) scale(.985)}}
.pj-dlg::backdrop{background:rgb(3 4 5/.78);backdrop-filter:blur(3px);opacity:0;transition:opacity .45s var(--ease),overlay .6s allow-discrete,display .6s allow-discrete}
.pj-dlg[open]::backdrop{opacity:1}
@starting-style{.pj-dlg[open]::backdrop{opacity:0}}
.pj-dlg *{min-width:0}
.pj-sc{position:relative;flex:1 1 auto;min-height:0;overflow-x:hidden;overflow-y:auto;overscroll-behavior:contain;scrollbar-width:thin;scrollbar-color:var(--rule) transparent}
.pj-dx{position:absolute;z-index:8;top:14px;right:14px;width:40px;height:40px;border:1px solid var(--rule);background:rgb(8 10 12/.72);backdrop-filter:blur(6px);cursor:pointer;transition:border-color .3s var(--ease)}
.pj-dx:hover{border-color:var(--pa,var(--accent))}
.pj-dx::before,.pj-dx::after{content:"";position:absolute;left:12px;top:19px;width:14px;height:1px;background:var(--fg);transform:rotate(45deg)}
.pj-dx::after{transform:rotate(-45deg)}

/* header */
.pj-dh{position:relative;isolation:isolate;overflow:hidden;padding:clamp(56px,7vw,64px) var(--pp) 34px;background:radial-gradient(circle at 25% 30%,var(--a1),transparent 60%),radial-gradient(circle at 85% 95%,var(--a3),transparent 52%),linear-gradient(160deg,var(--a2),#050607)}
.pj-dh::before{content:"";position:absolute;inset:0;z-index:-1;mix-blend-mode:screen;opacity:.55;background:radial-gradient(circle at 20% 20%,${PINK},transparent 50%),radial-gradient(circle at 90% 80%,${CYAN},transparent 50%)}
.pj-dh::after{content:"";position:absolute;inset:0;background:linear-gradient(transparent 40%,var(--bg));z-index:-1}
.pj-dh .pj-k{font-size:.72rem;color:var(--fg);display:flex;gap:4px 14px;flex-wrap:wrap;align-items:center}
.pj-dh h2{display:grid;font:200 clamp(1.8rem,5vw,3.2rem)/1.1 var(--display);letter-spacing:.06em;margin:14px 0 12px;overflow-wrap:anywhere}
.pj-dh h2>*{grid-area:1/1}
.bp-gh{visibility:hidden}
.pj-dh p{max-width:56ch;font-size:.9rem;overflow-wrap:anywhere}
.pj-cv{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;z-index:-2;opacity:.5;-webkit-mask:linear-gradient(#000 30%,transparent);mask:linear-gradient(#000 30%,transparent)}

/* title block: the at-a-glance facts, set like an engineering drawing's title block */
.bp-tbk{position:relative;z-index:2;display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:1px;margin:-14px var(--pp) 20px;background:rgb(${OR}/.38);border:1px solid rgb(${OR}/.55);font-size:.78rem;line-height:1.35}
.bp-tbk>div{background:rgb(7 9 11/.94);padding:9px 13px 10px;min-width:0}
.bp-tbk .s2{grid-column:span 2}
.bp-tbk .s3{grid-column:1/-1}
.bp-tbk dt{font-size:.58rem;letter-spacing:.16em;text-transform:uppercase;color:rgb(${OR}/.9);margin-bottom:3px}
.bp-tbk dd{margin:0;overflow-wrap:anywhere}
.bp-tbk .ttl dd{font:300 1.02rem/1.25 var(--display);letter-spacing:.05em}
.bp-tbk .res dd b{font:300 1.35rem/1.1 var(--display);letter-spacing:.04em;color:var(--pa,var(--accent));margin-right:10px}
.bp-tbk .res dd span{color:var(--muted)}

/* body */
.pj-pts{display:grid;gap:12px;font-size:.84rem;overflow-wrap:anywhere}
.pj-pts li{display:grid;grid-template-columns:1.6rem minmax(0,1fr)}
.pj-pts li::before{content:"—";color:var(--pa,var(--accent))}
.pj-tech{display:flex;flex-wrap:wrap;gap:10px 22px}
.pj-tech li{display:inline-flex;align-items:center;gap:9px;font-size:.74rem;color:var(--fg);--ti-size:20px;min-width:0}
.pj-tech .ti{color:var(--muted)}
.pj-act{display:flex;flex-wrap:wrap;gap:12px 22px;align-items:center}
.pj-lk{font-size:.8rem;color:var(--pa,var(--accent));text-underline-offset:5px;text-decoration-thickness:1px}
.pj-db{position:relative;display:grid;grid-template-columns:minmax(0,1fr);padding:8px var(--pp) 30px}
.pj-db h4{font-weight:400;font-size:.72rem;color:var(--muted);margin:0 0 12px;letter-spacing:.08em}
.pj-db section{position:relative;display:grid;gap:12px;align-content:start;margin-bottom:22px}
.pj-db p{overflow-wrap:anywhere}
.pj-shots{display:flex;gap:14px;overflow-x:auto;scroll-snap-type:x proximity;padding:4px 2px 14px;margin:0 -2px;scrollbar-width:thin;scrollbar-color:var(--rule) transparent}
.pj-fg{flex:none;scroll-snap-align:start;margin:0}
.pj-shot{display:block;padding:0;border:1px solid var(--rule);background:#05070a;cursor:zoom-in;line-height:0;transition:border-color .35s var(--ease)}
.pj-shot:hover{border-color:var(--pa,var(--accent))}
.pj-shot img{display:block;height:clamp(170px,26vw,240px);width:auto;max-width:none;transition:opacity .4s var(--ease);opacity:.92}
.pj-shot:hover img{opacity:1}
.pj-fg figcaption,.bp-plate{display:none}

/* nav + lightbox */
.pj-dn{flex:none;background:var(--bg);display:grid;grid-template-columns:1fr 1fr;gap:12px;padding:6px var(--pp);padding-bottom:max(6px,env(safe-area-inset-bottom));border-top:1px solid var(--rule);font-size:.76rem}
.pj-dn button{background:none;border:0;cursor:pointer;color:var(--muted);text-align:left;padding:12px 0;min-height:44px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;transition:color .3s var(--ease)}
.pj-dn button:hover:not(:disabled){color:var(--pa,var(--accent))}
.pj-dn button:disabled{opacity:.3;cursor:default}
.pj-dn button:last-child{text-align:right}
.pj-lb{position:fixed;inset:0;z-index:20;display:grid;place-items:center;background:rgb(3 4 5/.94);cursor:zoom-out}
.pj-lb[hidden]{display:none}
.pj-lbf{position:relative;margin:0;max-width:94vw;display:grid;gap:10px}
.pj-lbf img{max-width:94vw;max-height:80dvh;border:1px solid var(--rule);background:#05070a}
.pj-lbf figcaption{display:none}
.pj-lb button{position:absolute;width:44px;height:44px;border:1px solid var(--rule);background:rgb(8 10 12/.8);color:var(--fg);cursor:pointer;font-size:1.1rem;line-height:1}
.pj-lb button:hover{border-color:var(--accent);color:var(--accent)}
.pj-lb [data-lb="-1"]{left:12px;top:50%;margin-top:-22px}
.pj-lb [data-lb="1"]{right:12px;top:50%;margin-top:-22px}
.pj-lb [data-lb="0"]{right:12px;top:12px}
.pj-lb.one [data-lb="-1"],.pj-lb.one [data-lb="1"]{display:none}
html.pj-lock{overflow:hidden}

/* ───────── drafting grid (body only; faint) ───────── */
.bp-grid .pj-sc{background:linear-gradient(rgb(${OR}/calc(.028*var(--ga))) 1px,transparent 1px) 0 0/24px 24px,linear-gradient(90deg,rgb(${OR}/calc(.028*var(--ga))) 1px,transparent 1px) 0 0/24px 24px,linear-gradient(rgb(${OR}/calc(.06*var(--ga))) 1px,transparent 1px) 0 0/120px 120px,linear-gradient(90deg,rgb(${OR}/calc(.06*var(--ga))) 1px,transparent 1px) 0 0/120px 120px,var(--bg);background-attachment:local}

/* ───────── figures + cover plate ───────── */
.bp-fig .pj-cv{display:none}
.bp-fig .bp-plate{display:block;margin:0 var(--pp) 16px}
.bp-pf{position:relative;aspect-ratio:16/6;max-height:250px;width:100%;overflow:hidden;background:#05070a;line-height:0}
.bp-pf img{width:100%;height:100%;object-fit:cover;opacity:.92}
.bp-pf::before{content:"";position:absolute;inset:7px;z-index:2;pointer-events:none;--m:rgb(${OR}/.95);background:linear-gradient(var(--m),var(--m)) 0 0/16px 1px no-repeat,linear-gradient(var(--m),var(--m)) 0 0/1px 16px no-repeat,linear-gradient(var(--m),var(--m)) 100% 0/16px 1px no-repeat,linear-gradient(var(--m),var(--m)) 100% 0/1px 16px no-repeat,linear-gradient(var(--m),var(--m)) 0 100%/16px 1px no-repeat,linear-gradient(var(--m),var(--m)) 0 100%/1px 16px no-repeat,linear-gradient(var(--m),var(--m)) 100% 100%/16px 1px no-repeat,linear-gradient(var(--m),var(--m)) 100% 100%/1px 16px no-repeat}
.bp-pf::after{content:"";position:absolute;inset:0;pointer-events:none;background:repeating-linear-gradient(0deg,rgb(0 0 0/.14) 0 1px,transparent 1px 3px)}
.bp-sl{position:absolute;z-index:3;left:0;right:0;top:0;height:2px;background:linear-gradient(90deg,transparent,rgb(${OR}/.95),transparent);box-shadow:0 0 14px 2px rgb(${OR}/.55);animation:bpScan 5.5s ease-in-out infinite alternate}
@keyframes bpScan{from{top:0}to{top:calc(100% - 2px)}}
.bp-plate figcaption,.bp-fig .pj-fg figcaption,.bp-fig .pj-lbf figcaption{display:flex;justify-content:space-between;gap:12px;font-size:.62rem;letter-spacing:.12em;line-height:1.2;color:rgb(${OR}/.85);text-transform:uppercase;padding-top:8px}
.bp-fig .pj-fg figcaption{display:block;padding-top:10px;color:var(--muted);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:100%}
.bp-fig .pj-shot{outline:1px solid rgb(${OR}/.3);outline-offset:4px;border-color:transparent}
.bp-fig .pj-shot:hover{outline-color:rgb(${OR}/.8)}
/* full-size view: measuring ticks along the top and left edges of the image */
.bp-fig .pj-lbf::before,.bp-fig .pj-lbf::after{content:"";position:absolute;pointer-events:none}
.bp-fig .pj-lbf::before{left:0;right:0;top:-16px;height:9px;background:repeating-linear-gradient(90deg,rgb(${OR}/.55) 0 1px,transparent 1px 10px) 0 100%/100% 4px no-repeat,repeating-linear-gradient(90deg,rgb(${OR}/.95) 0 1px,transparent 1px 100px) 0 100%/100% 9px no-repeat}
.bp-fig .pj-lbf::after{top:0;bottom:30px;left:-16px;width:9px;background:repeating-linear-gradient(0deg,rgb(${OR}/.55) 0 1px,transparent 1px 10px) 100% 0/4px 100% no-repeat,repeating-linear-gradient(0deg,rgb(${OR}/.95) 0 1px,transparent 1px 100px) 100% 0/9px 100% no-repeat}

/* ───────── boot build-up ─────────
   One timeline, in reading order:
   0.00 grid fades up  ·  0.15 meta line  ·  0.35 title types (JS)  ·  1.05 summary  ·  1.30 title block frame draws, cells fill in
   1.70 cover plate scans in  ·  2.10 sections follow, top to bottom */
.bp-play{animation:bpGa .9s var(--ease) both}
@keyframes bpGa{from{--ga:0}to{--ga:1}}
.bp-play .pj-k{animation:bpIn .6s var(--ease) .15s both}
.bp-play .pj-dh p{animation:bpIn .7s var(--ease) 1.05s both}
.bp-play .bp-tbk{animation:bpFrame .6s var(--ease) 1.3s both}
.bp-play .bp-tbk>div{animation:bpCell .5s var(--ease) calc(1.45s + var(--ci,0) * .07s) both}
.bp-play .bp-pf{animation:bpReveal 1s var(--ease) 1.7s both}
.bp-play .bp-pf .bp-sl{animation:bpSweep 1s var(--ease) 1.7s both}
.bp-play .bp-plate figcaption{animation:bpIn .6s var(--ease) 2.5s both}
.bp-play .pj-db>section{animation:bpIn .7s var(--ease) calc(2.1s + var(--si,0) * .1s) both}
@keyframes bpIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}
@keyframes bpFrame{from{clip-path:inset(0 100% 0 0)}to{clip-path:inset(0)}}
@keyframes bpCell{0%{opacity:0}35%{opacity:.7}50%{opacity:.25}100%{opacity:1}}
@keyframes bpReveal{from{clip-path:inset(0 0 100% 0)}to{clip-path:inset(0)}}
@keyframes bpSweep{from{top:0;opacity:1}85%{opacity:1}to{top:calc(100% - 2px);opacity:0}}
.bp-typing .bp-ty::after{content:"";display:inline-block;width:.07em;height:.82em;margin-left:.07em;background:var(--pa,var(--accent));vertical-align:-.04em;animation:bpBlink .7s steps(1) infinite}
@keyframes bpBlink{50%{opacity:0}}

/* mobile */
@media (max-width:899px){
  .pj-dlg{width:100%;max-width:100%;height:100dvh;max-height:none;margin:0;border:0;transform:translateY(24px)}
  .pj-dh{padding-top:68px}
  .pj-dx{top:max(14px,env(safe-area-inset-top))}
  .bp-tbk{grid-template-columns:repeat(2,minmax(0,1fr))}
  .bp-tbk .s2,.bp-tbk .s3,.bp-tbk>div:nth-child(3),.bp-tbk .dw{grid-column:1/-1}
  .bp-tbk .dw{order:9}
}
@media (prefers-reduced-motion:reduce){
  .bp-sl{animation:none;display:none}
  .bp-play,.bp-play *{animation:none!important}
}

`

const caption = (k, name) => `FIG. ${String(k).padStart(2, '0')} — ${name}`

function titleBlock(p, i, n) {
  const dwg = `${[...p.name].filter((c) => /[a-z0-9]/i.test(c)).slice(0, 3).join('').toUpperCase()}-${String(p.start.getUTCFullYear() % 100).padStart(2, '0')}${String(i + 1).padStart(2, '0')}`
  let ci = 0
  const cell = (cls, label, body) => `<div class="${cls}" style="--ci:${ci++}"><dt>${label}</dt><dd>${body}</dd></div>`
  return `<dl class="bp-tbk">
    ${cell('', 'Role', esc(p.role))}
    ${cell('', 'Kind', esc(p.kind))}
    ${cell('', 'Period', esc(period(p)))}
    ${p.metric ? cell('res s2', 'Result', `<b>${esc(p.metric.value)}</b><span>${esc(p.metric.label)}</span>`) : ''}
    ${cell('', 'State', p.current ? 'In service' : 'Released')}
    ${cell(p.metric ? 'dw s2' : 'dw', 'Dwg no.', esc(dwg))}
    ${cell('', 'Sheet', `${i + 1} / ${n}`)}
  </dl>`
}

/** Detail dialog: one per mount, content swapped per project. Prev/next walk the currently visible list. */
export function dialog(root, { getVisible, onNav, onClose }) {
  const d = document.createElement('dialog')
  d.setAttribute('aria-labelledby', 'pj-dt')
  root.append(d)
  d.className = 'pj-dlg bp-grid bp-fig'
  let shots = [], si = 0, cur = null
  let tPlay = 0, tType = 0
  const reduce = () => matchMedia('(prefers-reduced-motion: reduce)').matches
  const stop = () => { clearTimeout(tPlay); clearTimeout(tType); d.classList.remove('bp-play', 'bp-typing') }
  const play = () => {
    stop()
    if (reduce()) return
    const ty = d.querySelector('.bp-ty')
    const full = ty ? ty.dataset.t : ''
    if (ty) ty.textContent = ''
    void d.offsetWidth
    d.classList.add('bp-play', 'bp-typing')
    let k = 0
    const step = () => {
      k++
      ty.textContent = full.slice(0, k)
      if (k < full.length) tType = setTimeout(step, 1000 / Math.max(full.length, 12) * 0.7)
      else tType = setTimeout(() => d.classList.remove('bp-typing'), 500)
    }
    if (ty) tType = setTimeout(step, 350)
    tPlay = setTimeout(() => d.classList.remove('bp-play'), 3600)
  }

  const fill = (p) => {
    cur = p
    const v = getVisible(), i = v.indexOf(p)
    const pv = i > 0 ? v[i - 1] : null, nx = i >= 0 ? v[i + 1] : null
    let s = 0
    const sec = (cls, title, body) => `<section class="${cls}" style="--si:${s++}"><h4>${title}</h4>${body}</section>`
    d.setAttribute('style', `--a1:${p.pal[0]};--a2:${p.pal[1]};--a3:${p.pal[2]};--pa:${p.accent}`)
    d.innerHTML = `
      <button type="button" class="pj-dx" aria-label="Close"></button>
      <div class="pj-sc">
        <header class="pj-dh">
          ${p.cover ? `<img class="pj-cv" src="${esc(p.cover)}" alt="" decoding="async">` : ''}
          <div class="pj-k"><span>${esc(p.kind)}</span><span>${esc(period(p))}</span>${status(p)}</div>
          <h2 id="pj-dt" aria-label="${esc(p.name)}"><span class="bp-gh" aria-hidden="true">${esc(p.name)}</span><span class="bp-ty" data-t="${esc(p.name)}" aria-hidden="true">${esc(p.name)}</span></h2>
          <p>${esc(p.summary || p.headline)}</p>
        </header>
        ${titleBlock(p, Math.max(i, 0), v.length)}
        ${p.cover ? `<figure class="bp-plate"><div class="bp-pf"><img src="${esc(p.cover)}" alt="" decoding="async"><i class="bp-sl"></i></div><figcaption><span>${esc(caption(0, `${p.name} · cover plate`))}</span><span>Scale 1 : 1</span></figcaption></figure>` : ''}
        <div class="pj-db">
          ${sec('', 'Highlights', `<ul class="pj-pts">${(p.highlights.length ? p.highlights : [p.headline]).map((h) => `<li>${esc(h)}</li>`).join('')}</ul>`)}
          ${p.challenges ? sec('', 'The hard part', `<p>${esc(p.challenges)}</p>`) : ''}
          ${p.screenshots.length ? sec('', 'Screens', `<div class="pj-shots">${p.screenshots.map((sh, k) => `<figure class="pj-fg"><button type="button" class="pj-shot" data-i="${k}" aria-label="View screenshot ${k + 1} of ${p.screenshots.length}"><img src="${esc(sh)}" alt="${esc(p.name)} screenshot ${k + 1}" loading="lazy" decoding="async"></button><figcaption aria-hidden="true">${esc(caption(k + 1, `${p.name} · view ${k + 1}`))}</figcaption></figure>`).join('')}</div>`) : ''}
          ${sec('', 'Built with', `<ul class="pj-tech">${p.stack.map((t) => `<li>${icon(t)}<span>${esc(techName(t))}</span></li>`).join('')}</ul>`)}
          ${links(p) ? `<section style="--si:${s++}"><div class="pj-act">${links(p)}</div></section>` : ''}
        </div>
      </div>
      <nav class="pj-dn" aria-label="Project navigation">
        <button type="button" data-nav="${pv ? i - 1 : ''}" ${pv ? '' : 'disabled'}>${pv ? `← ${esc(pv.name)}` : ''}</button>
        <button type="button" data-nav="${nx ? i + 1 : ''}" ${nx ? '' : 'disabled'}>${nx ? `${esc(nx.name)} →` : ''}</button>
      </nav>
      ${p.screenshots.length ? `<div class="pj-lb${p.screenshots.length < 2 ? ' one' : ''}" hidden><figure class="pj-lbf"><img alt=""><figcaption></figcaption></figure><button type="button" data-lb="-1" aria-label="Previous screenshot">←</button><button type="button" data-lb="1" aria-label="Next screenshot">→</button><button type="button" data-lb="0" aria-label="Close screenshot">×</button></div>` : ''}`
    shots = p.screenshots
    d.querySelector('.pj-sc').scrollTop = 0
    play()
  }
  const showShot = (k) => {
    const L = d.querySelector('.pj-lb')
    if (!L || !shots.length) return
    si = (k + shots.length) % shots.length
    L.querySelector('img').src = shots[si]
    L.querySelector('figcaption').innerHTML = `<span>${esc(caption(si + 1, `${cur.name} · view ${si + 1}`))}</span><span>${si + 1} / ${shots.length}</span>`
    L.hidden = false
  }
  d.addEventListener('click', (ev) => {
    const lbBtn = ev.target.closest('[data-lb]')
    if (lbBtn) { const k = +lbBtn.dataset.lb; return k ? showShot(si + k) : (d.querySelector('.pj-lb').hidden = true) }
    if (ev.target.classList.contains('pj-lb') || ev.target.closest('.pj-lbf img')) return (d.querySelector('.pj-lb').hidden = true)
    const sh = ev.target.closest('.pj-shot')
    if (sh) return showShot(+sh.dataset.i)
    if (ev.target === d || ev.target.closest('.pj-dx')) return d.close()
    const b = ev.target.closest('[data-nav]')
    if (b && b.dataset.nav !== '') { const p = getVisible()[+b.dataset.nav]; fill(p); onNav(p) }
  })
  d.addEventListener('close', () => { document.documentElement.classList.remove('pj-lock'); stop(); onClose() })
  d.addEventListener('cancel', (ev) => { const L = d.querySelector('.pj-lb'); if (L && !L.hidden) { ev.preventDefault(); L.hidden = true } })
  d.addEventListener('keydown', (ev) => {
    const L = d.querySelector('.pj-lb')
    if (L && !L.hidden && (ev.key === 'ArrowLeft' || ev.key === 'ArrowRight')) showShot(si + (ev.key === 'ArrowRight' ? 1 : -1))
  })
  return {
    isOpen: () => d.open,
    open(p) { fill(p); document.documentElement.classList.add('pj-lock'); if (!d.open) d.showModal() },
    close() { if (d.open) d.close() },
    destroy() { d.close(); d.remove() },
  }
}
