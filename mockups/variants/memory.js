// Memory scan v2. Each contract is a memory that resolves from a wireframe grid when it scrolls into view.
// Default state is deliberately small (name, dates, one-line headline, tech icons); the bullets are a click away.
import { esc, reduce, range, dur, fmt, techKey, techName } from '../lib/data.js'
import { icon } from '../lib/icons.js'

let uid = 0
const S = '.xv-memory'

export const css = `
${S}{--sc:cubic-bezier(.5,.05,.25,1);--rail:rgb(255 140 43/.4);--line:rgb(255 140 43/.3);--live:rgb(90 209 230);position:relative}
${S} [hidden]{display:none!important}
${S} .m-list{display:grid;gap:clamp(36px,5.5vw,68px)}
${S} .m-hint{display:flex;flex-wrap:wrap;align-items:center;gap:2px 14px;min-height:2.6em;margin-bottom:clamp(16px,2.4vw,26px);font-size:.76rem;line-height:1.6;color:var(--muted)}
${S} .m-rk{color:var(--accent)}
${S} .m-card.live .m-rk{color:var(--live)}
${S} .m-link{appearance:none;background:none;border:0;padding:4px 2px;min-height:28px;color:var(--accent);font:inherit;font-size:.76rem;text-decoration:underline;text-decoration-thickness:1px;text-underline-offset:5px;cursor:pointer}

/* ---------- frames: the SYSTOLIC group and the standalone solo card share one weight ---------- */
${S} .m-frame{--pad:clamp(14px,3.4vw,40px);position:relative;border:1px solid var(--line)}
${S} .m-group{padding:var(--pad)}
${S} .m-frame.brk::before,${S} .m-frame.brk::after{width:24px;height:24px}
${S} .m-frame.brk::before{top:-1px;left:-1px}
${S} .m-frame.brk::after{bottom:-1px;right:-1px}
${S} .m-c4{position:absolute;inset:-1px;pointer-events:none}
${S} .m-c4::before,${S} .m-c4::after{content:"";position:absolute;width:24px;height:24px;border:1px solid var(--accent)}
${S} .m-c4::before{top:0;right:0;border-left:0;border-bottom:0}
${S} .m-c4::after{bottom:0;left:0;border-right:0;border-top:0}

${S} .m-gh .m-c{display:grid;gap:14px clamp(24px,5vw,72px)}
${S} .m-gname{font:200 clamp(1.3rem,3.2vw,2.3rem)/1.15 var(--display);letter-spacing:.07em;overflow-wrap:break-word}
${S} .m-gmeta{display:flex;flex-wrap:wrap;gap:2px 22px;margin-top:10px;font-size:.76rem;color:var(--muted)}
${S} .m-desc{max-width:62ch}
${S} .m-desc-box{overflow:hidden}
${S} .m-desc-t{font-size:.8rem;line-height:1.75;color:var(--muted)}
${S} .m-desc-t.is-clamped{display:-webkit-box;-webkit-box-orient:vertical;-webkit-line-clamp:2;overflow:hidden}
${S} .m-desc .m-link{margin-top:4px}

/* rails: the frame visibly holds its contracts (default = stacked, rail on the left) */
${S} .m-cards{--g:clamp(16px,2.4vw,28px);--ind:14px;position:relative;display:grid;grid-template-columns:minmax(0,1fr);align-items:start;gap:var(--g);margin-top:30px;padding-left:var(--ind)}
${S} .m-cards>li{position:relative;min-width:0}
${S} .m-cards>li::before,${S} .m-cards>li::after{content:"";position:absolute;background:var(--rail);box-shadow:0 0 8px rgb(255 140 43/.35);pointer-events:none;transition:transform 1s var(--ease)}
${S} .m-cards>li::before{left:calc(var(--ind) * -1);top:30px;width:var(--ind);height:1px;transform-origin:left}
${S} .m-cards>li::after{left:calc(var(--ind) * -1);top:calc(var(--g) * -1);width:1px;height:calc(var(--g) + 31px);transform-origin:top}
${S} .m-cards>li:first-child::after{top:-30px;height:61px}
${S}.armed .m-cards:not(.in)>li::before{transform:scaleX(0)}
${S}.armed .m-cards:not(.in)>li::after{transform:scaleY(0)}
${S} .m-cards>li:nth-child(2)::before,${S} .m-cards>li:nth-child(2)::after{transition-delay:.22s}
${S} .m-cards>li:nth-child(3)::before,${S} .m-cards>li:nth-child(3)::after{transition-delay:.44s}
@media (min-width:760px){
  ${S} .m-gh .m-c{grid-template-columns:minmax(0,.9fr) minmax(0,1.1fr);align-items:start}
  ${S} .m-cards{--ind:0px;grid-template-columns:repeat(2,minmax(0,1fr));margin-top:38px;padding:30px 0 0}
  ${S} .m-cards.one{grid-template-columns:minmax(0,1fr)}
  ${S} .m-cards::before,${S} .m-cards::after{content:"";position:absolute;left:24px;background:var(--rail);box-shadow:0 0 8px rgb(255 140 43/.35);pointer-events:none;transition:transform 1s var(--ease)}
  ${S} .m-cards::before{top:0;height:1px;width:calc(50% + var(--g) / 2);transform-origin:left}
  ${S} .m-cards.one::before{display:none}
  ${S} .m-cards::after{top:-28px;height:28px;width:1px;transform-origin:top}
  ${S}.armed .m-cards:not(.in)::before{transform:scaleX(0)}
  ${S}.armed .m-cards:not(.in)::after{transform:scaleY(0)}
  ${S} .m-cards>li::before{left:24px;top:-30px;width:1px;height:30px;transform-origin:top}
  ${S}.armed .m-cards:not(.in)>li::before{transform:scaleY(0)}
  ${S} .m-cards>li::after{display:none}
  ${S} .m-cards>li:nth-child(n+3)::before{display:none}
  ${S} .m-cards>li:nth-child(2)::before{transition-delay:.3s}
}

/* ---------- contract card ---------- */
${S} .m-card{--pad:clamp(16px,2.4vw,26px);position:relative;isolation:isolate;border:1px solid var(--rule);background:rgb(0 0 0/.34)}
${S} .m-card.live{border-color:rgb(90 209 230/.3)}
${S} .m-card.brk::before,${S} .m-card.brk::after{width:9px;height:9px}
${S} .m-card.m-solo{--pad:clamp(14px,3.4vw,40px);background:none;border-color:var(--line)}
${S} .m-card.m-solo.live{border-color:rgb(90 209 230/.3)}
${S} .m-rv{position:relative;z-index:1}
${S} .m-card .m-c{padding:var(--pad)}
${S} .m-parent{margin-bottom:6px;font-size:.74rem;color:var(--muted)}
${S} .m-top{display:flex;flex-wrap:wrap;align-items:baseline;gap:4px 14px}
${S} .m-co{font:300 clamp(1.05rem,1.7vw,1.3rem)/1.25 var(--display);letter-spacing:.06em;overflow-wrap:break-word}
${S} .m-solo .m-co{font:200 clamp(1.3rem,3.2vw,2.3rem)/1.15 var(--display);letter-spacing:.07em}
${S} .m-card.live .m-co{text-shadow:-1.5px 0 rgb(255 140 43/.6),1.5px 0 rgb(90 209 230/.6);animation:xvm-flick 9s linear infinite}
${S} .m-role{margin-top:6px;font-size:.82rem;color:var(--fg)}
${S} .m-when{display:flex;flex-wrap:wrap;gap:2px 0;margin-top:6px;font-size:.76rem;color:var(--muted)}
${S} .m-when span+span{margin-left:14px;padding-left:14px;border-left:1px solid var(--rule)}
@media (max-width:420px){${S} .m-when{flex-direction:column}${S} .m-when span+span{margin-left:0;padding-left:0;border-left:0}}
${S} .m-head{margin-top:16px;font-size:.84rem;line-height:1.65;max-width:58ch}
${S} .m-solo .m-c{display:grid;gap:0 clamp(24px,5vw,72px)}
${S} .m-solo .m-head{margin-top:0}
@media (min-width:760px){${S} .m-solo .m-c{grid-template-columns:minmax(0,.9fr) minmax(0,1.1fr);align-items:start}}
@media (max-width:759px){${S} .m-solo .m-head{margin-top:16px}}

${S} .m-ghost{position:absolute;inset:0;z-index:0;pointer-events:none;opacity:0;
  background-image:linear-gradient(rgb(255 140 43/.2) 1px,transparent 1px),linear-gradient(90deg,rgb(255 140 43/.2) 1px,transparent 1px);background-size:14px 14px}
${S} .m-card.live .m-ghost{background-image:linear-gradient(rgb(90 209 230/.2) 1px,transparent 1px),linear-gradient(90deg,rgb(90 209 230/.2) 1px,transparent 1px)}
${S} .m-edge{position:absolute;z-index:2;left:-1px;top:-1px;bottom:-1px;width:2px;background:var(--live);box-shadow:0 0 14px 1px rgb(90 209 230/.65);animation:xvm-flick 9s linear infinite;pointer-events:none}

/* tech icons */
${S} .m-tech{display:flex;flex-wrap:wrap;gap:2px;margin:16px -8px 0}
${S} .m-t{position:relative;display:grid;place-items:center;width:40px;height:40px;padding:0;border:0;background:transparent;color:var(--muted);--ti-size:20px;cursor:pointer;transition:color .3s var(--ease),opacity .35s var(--ease),transform .4s var(--ease)}
${S} .m-t:focus-visible{outline-offset:-3px}
${S} .m-t::after{content:"";position:absolute;left:10px;right:10px;bottom:4px;height:1px;background:currentColor;transform:scaleX(0);transition:transform .45s var(--ease)}
${S} .m-card.live .m-t{color:var(--fg)}
${S} .m-t:hover,${S} .m-t.hit{color:var(--accent)}
${S} .m-card.live .m-t:hover,${S} .m-card.live .m-t.hit{color:var(--live)}
${S} .m-t.hit{transform:translateY(-2px)}
${S} .m-t.hit::after{transform:scaleX(1)}
${S}.tracing .m-t:not(.hit){opacity:.26}
${S} .m-foot{display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:8px 16px;margin-top:10px}
${S} .m-ro{min-height:1.5em;font-size:.74rem;line-height:1.5;color:var(--muted)}

/* the reconstruct button */
${S} .m-btn{appearance:none;display:inline-flex;align-items:center;gap:10px;min-height:40px;padding:6px 14px;border:1px solid rgb(255 140 43/.5);background:transparent;color:var(--accent);font:300 .78rem/1.2 var(--mono);cursor:pointer;transition:background .35s var(--ease),border-color .35s var(--ease)}
${S} .m-btn:hover{background:rgb(255 140 43/.1);border-color:var(--accent)}
${S} .m-btn[aria-expanded=true]{border-color:var(--accent)}
${S} .m-btn i{position:relative;flex:none;width:10px;height:10px}
${S} .m-btn i::before,${S} .m-btn i::after{content:"";position:absolute;background:currentColor}
${S} .m-btn i::before{left:0;right:0;top:4.5px;height:1px}
${S} .m-btn i::after{top:0;bottom:0;left:4.5px;width:1px;transition:transform .45s var(--ease)}
${S} .m-btn[aria-expanded=true] i::after{transform:scaleY(0)}

/* details: grid-rows reveal + a second scan sweep */
${S} .m-more{position:relative;z-index:1;display:grid;grid-template-rows:0fr;visibility:hidden;transition:grid-template-rows .75s var(--ease),visibility 0s .75s}
${S} .m-more.open{grid-template-rows:1fr;visibility:visible;transition-delay:0s,0s}
${S} .m-more-in{min-height:0;overflow:hidden}
${S} .m-det{position:relative;padding:0 var(--pad) calc(var(--pad) * .9)}
${S} .m-pts{display:grid;gap:12px;padding-top:var(--pad);border-top:1px solid var(--rule);max-width:70ch;transition:opacity .25s var(--ease)}
${S} .m-more:not(.open) .m-pts{opacity:0}
${S} .m-pts li{position:relative;padding-left:22px;font-size:.82rem;line-height:1.7}
${S} .m-pts li::before{content:"";position:absolute;left:0;top:.85em;width:12px;height:1px;background:var(--accent)}
${S} .m-card.live .m-pts li::before{background:var(--live)}
${S} .m-dscan{position:absolute;inset:0;pointer-events:none;opacity:0;transform:translateY(-100%)}
${S} .m-dscan::after,${S} .m-scan::after{content:"";position:absolute;left:0;right:0;bottom:0;height:1px;background:var(--accent);box-shadow:0 0 14px 2px rgb(255 140 43/.55),0 -22px 30px -10px rgb(255 140 43/.22)}
${S} .m-card.live .m-dscan::after,${S} .m-card.live .m-scan::after{background:var(--live);box-shadow:0 0 14px 2px rgb(90 209 230/.55),0 -22px 30px -10px rgb(90 209 230/.22)}
${S} .m-more.open .m-pts{animation:xvm-clip .95s var(--sc) .12s backwards}
${S} .m-more.open .m-dscan{animation:xvm-line .95s var(--sc) .12s backwards}

/* first reveal */
${S} .m-scan{position:absolute;inset:0;z-index:2;pointer-events:none;opacity:0;transform:translateY(-100%)}
${S}.armed [data-rev]:not(.in) .m-c{opacity:0}
${S}.armed .m-ghost{opacity:1}
${S} [data-rev].in .m-c{animation:xvm-clip 1.2s var(--sc) var(--d,0s) backwards}
${S} [data-rev].in .m-scan{animation:xvm-line 1.2s var(--sc) var(--d,0s) backwards}
${S} [data-rev].in .m-ghost{animation:xvm-ghost 1.2s var(--sc) var(--d,0s) forwards}

@keyframes xvm-clip{0%{clip-path:inset(0 0 100% 0);filter:blur(8px);opacity:.15}55%{filter:blur(2px);opacity:1}100%{clip-path:inset(0 0 0 0);filter:blur(0);opacity:1}}
@keyframes xvm-line{0%{transform:translateY(-100%);opacity:0}8%{opacity:1}88%{opacity:1}100%{transform:translateY(0);opacity:0}}
@keyframes xvm-ghost{0%{clip-path:inset(0 0 0 0);opacity:1}99%{opacity:1}100%{clip-path:inset(100% 0 0 0);opacity:0}}
@keyframes xvm-flick{0%,84%,100%{opacity:1}86%{opacity:.78}88%{opacity:1}92%{opacity:.88}94%{opacity:1}}

/* compact (home) */
${S}.xv-compact .m-card{max-width:760px}
${S}.xv-compact .m-card .m-c{padding:clamp(16px,2.4vw,24px)}

@media (prefers-reduced-motion:reduce){
  ${S} *,${S} *::before,${S} *::after{animation:none!important;transition-duration:0s!important;transition-delay:0s!important}
  ${S} .m-ghost,${S} .m-scan,${S} .m-dscan{display:none}
}
`

const uniq = (skills) => {
  const seen = new Set()
  return skills.filter((s) => { const k = techKey(s); if (seen.has(k)) return false; seen.add(k); return true })
}

export function mount(el, { employers, compact }) {
  const id = `m${++uid}`
  let seq = 0
  const all = employers.flatMap((e) => e.contracts)
  const total = all.length
  const counts = new Map()
  for (const c of all) for (const s of uniq(c.skills)) {
    const k = techKey(s), t = counts.get(k) || { name: techName(s), n: 0 }
    t.n++; counts.set(k, t)
  }

  const card = (c, { h, solo, delay, parent }) => {
    const n = ++seq, more = `${id}-d${n}`, techs = uniq(c.skills), keys = techs.map(techKey)
    const hasPts = c.pts && c.pts.length
    return `<article class="m-card${solo ? ' m-frame m-solo' : ''}${c.current ? ' live' : ''} brk" data-rev data-keys="${esc(keys.join('|'))}" style="--d:${delay}s">
  ${solo ? '<i class="m-c4" aria-hidden="true"></i>' : ''}<i class="m-ghost" aria-hidden="true"></i>${c.current ? '<i class="m-edge" aria-hidden="true"></i>' : ''}
  <div class="m-rv"><div class="m-c">
    <div class="m-hd">
      ${parent ? `<p class="m-parent">${esc(parent)}</p>` : ''}
      <div class="m-top"><${h} class="m-co">${esc(c.co)}</${h}>${c.current ? '<span class="badge">Live</span>' : ''}</div>
      <p class="m-role">${esc(c.title)}</p>
      <p class="m-when"><span>${esc(range(c))}</span><span>${esc(dur(c.start, c.end))}</span></p>
    </div>
    <div class="m-bd">
      <p class="m-head">${esc(c.headline)}</p>
      <ul class="m-tech" aria-label="Technologies, ${esc(c.co)}">${techs.map((s) => `<li><button type="button" class="m-t" data-tech="${esc(techKey(s))}" aria-pressed="false">${icon(s)}</button></li>`).join('')}</ul>
      <div class="m-foot"><p class="m-ro" data-def="${techs.length} technolog${techs.length === 1 ? 'y' : 'ies'}">${techs.length} technolog${techs.length === 1 ? 'y' : 'ies'}</p>
      ${hasPts ? `<button type="button" class="m-btn" aria-expanded="false" aria-controls="${more}"><i aria-hidden="true"></i><span class="m-bl">Show details</span><span class="sr"> for ${esc(c.co)}, ${esc(c.title)}</span></button>` : ''}</div>
    </div>
  </div><i class="m-scan" aria-hidden="true"></i></div>
  ${hasPts ? `<div class="m-more" id="${more}"><div class="m-more-in"><div class="m-det"><ul class="m-pts">${c.pts.map((p) => `<li>${esc(p)}</li>`).join('')}</ul><i class="m-dscan" aria-hidden="true"></i></div></div></div>` : ''}
</article>`
  }

  const group = (e, i) => {
    const gid = `${id}-g${i}`, did = `${gid}-desc`
    const meta = `${fmt(e.start)} – ${e.current ? 'Present' : fmt(e.end)}`
    return `<section class="m-frame m-group brk" aria-labelledby="${gid}">
  <i class="m-c4" aria-hidden="true"></i>
  <div class="m-gh" data-rev><div class="m-rv"><div class="m-c">
    <div><h2 class="m-gname" id="${gid}">${esc(e.name)}</h2><p class="m-gmeta"><span>${esc(meta)}</span><span>${e.contracts.length} contract${e.contracts.length > 1 ? 's' : ''}</span></p></div>
    ${e.desc ? `<div class="m-desc"><div class="m-desc-box"><p class="m-desc-t is-clamped" id="${did}">${esc(e.desc)}</p></div><button type="button" class="m-link m-rm" aria-expanded="false" aria-controls="${did}" hidden><span>Read more</span><span class="sr"> about ${esc(e.name)}</span></button></div>` : ''}
  </div><i class="m-scan" aria-hidden="true"></i></div></div>
  <ul class="m-cards${e.contracts.length === 1 ? ' one' : ''}" data-rail>${e.contracts.map((c, k) => `<li>${card(c, { h: 'h3', delay: 0.2 + k * 0.22 })}</li>`).join('')}</ul>
</section>`
  }

  const entry = (e, i) => {
    if (compact) return card(e.contracts[0], { h: 'h3', delay: 0, parent: e.kind === 'group' && e.name !== e.contracts[0].co ? e.name : '' })
    return `<li>${e.kind === 'group' ? group(e, i) : card(e.contracts[0], { h: 'h2', solo: true, delay: 0 })}</li>`
  }

  el.innerHTML = compact
    ? employers.map(entry).join('')
    : `<p class="m-hint" role="status"><span class="m-ht"></span><button type="button" class="m-link m-clear" hidden>Clear selection</button></p><ul class="m-list">${employers.map(entry).join('')}</ul>`

  /* ---------- cross-card tech tracing ---------- */
  const btns = [...el.querySelectorAll('.m-t')]
  const cards = [...el.querySelectorAll('.m-card')].map((c) => ({ el: c, keys: new Set(c.dataset.keys.split('|')), ro: c.querySelector('.m-ro'), last: '' }))
  const hintT = el.querySelector('.m-ht'), clear = el.querySelector('.m-clear')
  const hintDef = 'Select a technology to trace it across every contract.'
  let hover = null, focus = null, pin = null

  const render = () => {
    const key = hover || focus || pin
    el.classList.toggle('tracing', !!key)
    for (const b of btns) {
      b.classList.toggle('hit', b.dataset.tech === key)
      b.setAttribute('aria-pressed', String(b.dataset.tech === pin))
    }
    const t = key && counts.get(key)
    for (const c of cards) {
      const html = !key ? esc(c.ro.dataset.def)
        : c.keys.has(key) ? `<span class="m-rk">${esc(t.name)}</span>${total > 1 ? `, in ${t.n} of ${total} contracts` : ''}` : `No ${esc(t.name)}`
      if (html !== c.last) { c.ro.innerHTML = html; c.last = html }
    }
    if (hintT) {
      const p = pin && counts.get(pin)
      hintT.innerHTML = p ? `Tracing <span class="m-rk">${esc(p.name)}</span>, in ${p.n} of ${total} contracts.` : hintDef
      clear.hidden = !pin
    }
  }

  const tech = (e) => e.target.closest?.('.m-t')
  const onOver = (e) => { const b = tech(e); if (b && e.pointerType === 'mouse') { hover = b.dataset.tech; render() } }
  const onOut = (e) => { if (tech(e) && e.pointerType === 'mouse' && hover) { hover = null; render() } }
  const onFocusIn = (e) => { const b = tech(e); if (b && b.matches(':focus-visible')) { focus = b.dataset.tech; render() } }
  const onFocusOut = (e) => { if (tech(e) && focus) { focus = null; render() } }
  const onKey = (e) => { if (e.key === 'Escape' && (pin || hover)) { pin = null; render() } }

  /* ---------- clicks: pin tech, expand details, expand description, clear ---------- */
  const ease = 'cubic-bezier(.22,.8,.2,1)'
  const onClick = (e) => {
    const b = tech(e)
    if (b) { pin = pin === b.dataset.tech ? null : b.dataset.tech; render(); return }
    if (e.target.closest('.m-clear')) { pin = null; render(); return }
    const d = e.target.closest('.m-btn')
    if (d) {
      const open = d.getAttribute('aria-expanded') !== 'true'
      d.setAttribute('aria-expanded', String(open))
      d.querySelector('.m-bl').textContent = open ? 'Hide details' : 'Show details'
      document.getElementById(d.getAttribute('aria-controls'))?.classList.toggle('open', open)
      return
    }
    const r = e.target.closest('.m-rm')
    if (r) {
      const p = document.getElementById(r.getAttribute('aria-controls')), box = p.parentElement
      const open = r.getAttribute('aria-expanded') !== 'true', h0 = box.offsetHeight
      p.classList.toggle('is-clamped', !open)
      r.setAttribute('aria-expanded', String(open))
      r.firstElementChild.textContent = open ? 'Show less' : 'Read more'
      const h1 = box.offsetHeight
      if (!reduce && h0 !== h1) box.animate([{ height: `${h0}px` }, { height: `${h1}px` }], { duration: 480, easing: ease })
    }
  }

  el.addEventListener('pointerover', onOver)
  el.addEventListener('pointerout', onOut)
  el.addEventListener('focusin', onFocusIn)
  el.addEventListener('focusout', onFocusOut)
  el.addEventListener('keydown', onKey)
  el.addEventListener('click', onClick)

  /* description clamp: only offer "Read more" when the text is actually truncated */
  const ros = []
  el.querySelectorAll('.m-desc-t').forEach((p) => {
    const btn = p.closest('.m-desc').querySelector('.m-rm')
    const check = () => { if (p.classList.contains('is-clamped')) btn.hidden = p.scrollHeight <= p.clientHeight + 1 }
    const ro = new ResizeObserver(check)
    ro.observe(p); ros.push(ro)
  })

  /* ---------- scan-in on first view ---------- */
  let io
  if (!reduce && 'IntersectionObserver' in window) {
    el.classList.add('armed')
    io = new IntersectionObserver((es) => {
      for (const e of es) if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target) }
    }, { threshold: 0.15, rootMargin: '0px 0px -6% 0px' })
    el.querySelectorAll('[data-rev],[data-rail]').forEach((n) => io.observe(n))
  }

  render()

  return () => {
    io?.disconnect()
    ros.forEach((r) => r.disconnect())
    for (const [t, f] of [['pointerover', onOver], ['pointerout', onOut], ['focusin', onFocusIn], ['focusout', onFocusOut], ['keydown', onKey], ['click', onClick]]) el.removeEventListener(t, f)
  }
}
