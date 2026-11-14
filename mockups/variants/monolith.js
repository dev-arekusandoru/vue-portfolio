// Monolith: one contract per frame, an establishing shot each. A sticky light rail follows the scroll.
import { esc, reduce, range, dur, techName } from '../lib/data.js'
import { icon } from '../lib/icons.js'

let uid = 0

export const css = `
.xv-monolith{--g:124px;--lx:72px;--rh:min(72svh,560px);--ti-size:52px;position:relative;display:grid;grid-template-columns:var(--g) minmax(0,1fr);color:var(--fg)}
.xv-monolith ol,.xv-monolith ul{list-style:none}
.xv-monolith.xv-compact{display:block;--ti-size:36px}

/* ---------- light rail ---------- */
.xv-monolith .mo-gut{position:relative}
.xv-monolith .mo-rail{position:sticky;top:calc((100svh - var(--rh)) / 2);height:var(--rh)}
.xv-monolith .mo-line{position:absolute;left:var(--lx);top:0;bottom:0;width:1px;background:rgb(255 140 43/.26)}
.xv-monolith .mo-fill{position:absolute;inset:0;background:var(--accent);opacity:.9;transform-origin:top;transform:scaleY(0);box-shadow:0 0 8px rgb(255 140 43/.7)}
.xv-monolith .mo-dot{position:absolute;left:var(--lx);top:0;width:0;height:0;will-change:transform;pointer-events:none}
.xv-monolith .mo-dot i{position:absolute;left:0;top:0;width:0;height:0;transition:opacity .7s var(--ease)}
.xv-monolith .mo-dot i::before{content:"";position:absolute;left:-4px;top:-4px;width:9px;height:9px;border-radius:50%;background:var(--accent);box-shadow:0 0 10px 2px rgb(255 140 43/.7),0 0 34px 7px rgb(255 140 43/.28)}
.xv-monolith .mo-dot i::after{content:"";position:absolute;left:-.5px;top:-52px;width:1px;height:104px;background:linear-gradient(transparent,var(--accent) 50%,transparent);opacity:.55}
.xv-monolith .mo-dot .b{opacity:0}
.xv-monolith .mo-dot .b::before{background:var(--blue);box-shadow:0 0 10px 2px rgb(90 209 230/.75),0 0 34px 7px rgb(90 209 230/.3)}
.xv-monolith .mo-dot .b::after{background:linear-gradient(transparent,var(--blue) 50%,transparent)}
.xv-monolith .mo-rail.mo-onlive .mo-dot .o{opacity:0}
.xv-monolith .mo-rail.mo-onlive .mo-dot .b{opacity:1}

.xv-monolith .mo-emps{position:absolute;inset:0}
.xv-monolith .mo-remp{position:absolute;left:0;right:0;top:var(--t);height:var(--h)}
.xv-monolith .mo-remp::before{content:"";position:absolute;left:8px;top:7px;bottom:7px;width:8px;border:1px solid rgb(255 140 43/.55);border-right:0}
.xv-monolith .mo-rlabel{position:absolute;left:24px;top:7px;bottom:7px;width:1.5em;display:block;writing-mode:vertical-rl;transform:rotate(180deg);text-align:center;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;font-size:.7rem;line-height:1.5;color:var(--muted)}
.xv-monolith .mo-cur .mo-rlabel{color:var(--fg)}
.xv-monolith .mo-stops{position:absolute;inset:0}
.xv-monolith .mo-stops li{position:absolute;left:0;top:var(--y)}
.xv-monolith .mo-stop{position:absolute;left:var(--lx);top:0;width:32px;height:32px;transform:translate(-50%,-50%);display:grid;place-items:center;text-decoration:none}
.xv-monolith .mo-stop::before{content:"";width:9px;height:9px;border-radius:50%;border:1px solid var(--accent);background:var(--bg);transition:transform .6s var(--ease),background-color .5s var(--ease),box-shadow .6s var(--ease)}
.xv-monolith .mo-stop:hover::before{background:rgb(255 140 43/.5)}
.xv-monolith .mo-stop[aria-current=true]::before{background:var(--accent);transform:scale(1.4);box-shadow:0 0 12px rgb(255 140 43/.6)}
.xv-monolith .mo-stop.mo-live::before{border-color:var(--blue)}
.xv-monolith .mo-stop.mo-live:hover::before{background:rgb(90 209 230/.5)}
.xv-monolith .mo-stop.mo-live[aria-current=true]::before{background:var(--blue);box-shadow:0 0 14px rgb(90 209 230/.8)}
.xv-monolith .mo-stop.mo-live::after{content:"";position:absolute;left:50%;top:50%;width:9px;height:9px;margin:-4.5px 0 0 -4.5px;border-radius:50%;border:1px solid var(--blue);animation:mo-ring 3.2s var(--ease) infinite}
@keyframes mo-ring{0%{transform:scale(1);opacity:.7}100%{transform:scale(3.2);opacity:0}}
.xv-monolith .mo-yr{position:absolute;left:calc(100% - 2px);top:50%;transform:translateY(-50%);font-size:.7rem;color:var(--muted);transition:color .4s var(--ease)}
.xv-monolith .mo-stop[aria-current=true] .mo-yr,.xv-monolith .mo-stop:hover .mo-yr{color:var(--fg)}

/* ---------- frames ---------- */
.xv-monolith .mo-frames{min-width:0}
.xv-monolith .mo-frame{position:relative;isolation:isolate;overflow-x:clip;display:flex;flex-direction:column;justify-content:center;min-height:clamp(540px,88svh,900px);padding:clamp(64px,11svh,128px) 0 clamp(64px,11svh,128px) clamp(10px,2vw,28px);scroll-snap-align:start}
.xv-monolith .mo-frame:first-child{scroll-snap-align:none}
.xv-monolith .mo-frame + .mo-frame{border-top:1px solid var(--rule)}
.xv-monolith .mo-frame::before{content:"";position:absolute;z-index:-1;right:-8%;top:50%;width:min(80vw,860px);aspect-ratio:1;transform:translateY(-50%);pointer-events:none;background:radial-gradient(closest-side,rgb(255 140 43/.08),rgb(255 140 43/.026) 55%,transparent)}
.xv-monolith .mo-frame.mo-live::before{background:radial-gradient(closest-side,rgb(90 209 230/.12),rgb(90 209 230/.04) 55%,transparent)}
.xv-monolith .mo-body{position:relative;max-width:60rem}

.xv-monolith .mo-strap{display:flex;flex-wrap:wrap;align-items:baseline;gap:2px 16px;max-width:34rem;padding:0 0 12px 14px;border-bottom:1px solid var(--rule);font-size:.74rem;position:relative}
.xv-monolith .mo-strap::before{content:"";position:absolute;left:0;top:.35em;width:1px;height:1.15em;background:var(--accent)}
.xv-monolith .mo-sk{color:var(--muted)}
.xv-monolith .mo-sv{color:var(--fg)}
.xv-monolith .mo-sn{margin-left:auto;color:var(--muted)}
.xv-monolith .mo-desc{max-width:34rem;margin-top:14px;font-size:.76rem;line-height:1.75;color:var(--muted)}
.xv-monolith .mo-desc p{display:-webkit-box;-webkit-box-orient:vertical;-webkit-line-clamp:2;overflow:hidden}
.xv-monolith .mo-desc.mo-full p{display:block;-webkit-line-clamp:unset;overflow:visible}
.xv-monolith .mo-link{margin-top:2px;padding:6px 0;background:none;border:0;cursor:pointer;font:inherit;font-size:.74rem;color:var(--accent);text-decoration:underline;text-decoration-thickness:1px;text-underline-offset:5px;min-height:32px}
.xv-monolith .mo-link[hidden]{display:none}

.xv-monolith .mo-name{position:relative;margin:clamp(22px,4svh,44px) 0 clamp(18px,3svh,30px);font:200 clamp(1.45rem,7.2vw,5.6rem)/1.06 var(--display);letter-spacing:.035em;overflow-wrap:anywhere}
.xv-monolith .mo-name:focus-visible{outline-offset:8px}
.xv-monolith .mo-live .mo-name::before,.xv-monolith .mo-live .mo-name::after{content:attr(data-t);content:attr(data-t) / "";position:absolute;inset:0;pointer-events:none;mix-blend-mode:screen;opacity:.5;animation:mo-split 9s linear infinite}
.xv-monolith .mo-live .mo-name::before{color:var(--accent);--s:-1}
.xv-monolith .mo-live .mo-name::after{color:var(--blue);--s:1;animation-delay:-.4s}
@keyframes mo-split{
  0%,86%{transform:translateX(calc(var(--s) * .022em));opacity:.45}
  90%{transform:translateX(calc(var(--s) * .05em));opacity:.8}
  91.5%{transform:translateX(calc(var(--s) * .008em));opacity:.25}
  93%{transform:translateX(calc(var(--s) * .04em));opacity:.7}
  96%,100%{transform:translateX(calc(var(--s) * .022em));opacity:.45}
}
.xv-monolith .mo-meta{display:flex;flex-wrap:wrap;align-items:baseline;gap:6px 26px;font-size:.82rem;color:var(--muted)}
.xv-monolith .mo-title{color:var(--fg)}
.xv-monolith .mo-lede{margin-top:clamp(18px,3svh,30px);max-width:44ch;font-size:clamp(1rem,1.5vw,1.18rem);line-height:1.75;color:var(--fg)}

.xv-monolith .mo-stack{display:flex;flex-wrap:wrap;gap:22px 14px;margin-top:clamp(28px,5svh,52px)}
.xv-monolith .mo-stack li{display:grid;justify-items:start;align-content:start;gap:10px;min-width:4.6rem;max-width:6.6rem;color:var(--muted);transition:color .4s var(--ease)}
.xv-monolith .mo-stack .ti{transition:color .4s var(--ease),filter .5s var(--ease),opacity .4s var(--ease)}
.xv-monolith .mo-stack li:hover{color:var(--fg)}
.xv-monolith .mo-stack li:hover .ti{color:var(--accent)}
.xv-monolith .mo-live .mo-stack .ti{color:var(--blue);opacity:.85}
.xv-monolith .mo-live .mo-stack li:hover .ti{color:var(--fg);opacity:1;filter:drop-shadow(0 0 8px rgb(90 209 230/.7))}
.xv-monolith .mo-cap{font-size:.66rem;line-height:1.4;overflow-wrap:anywhere}

.xv-monolith .mo-dtl{margin-top:clamp(22px,4svh,40px)}
.xv-monolith .mo-more{display:inline-flex;align-items:center;gap:14px;min-height:44px;padding:0;background:none;border:0;cursor:pointer;font:inherit;font-size:.78rem;color:var(--fg)}
.xv-monolith .mo-more:focus-visible,.xv-monolith .mo-link:focus-visible{outline:2px solid var(--accent);outline-offset:4px}
.xv-monolith .mo-pm{position:relative;flex:none;width:20px;height:20px;border:1px solid rgb(255 140 43/.55);transition:border-color .4s var(--ease),transform .6s var(--ease)}
.xv-monolith .mo-pm::before,.xv-monolith .mo-pm::after{content:"";position:absolute;left:50%;top:50%;background:var(--accent);transition:transform .6s var(--ease)}
.xv-monolith .mo-pm::before{width:8px;height:1px;margin:-.5px 0 0 -4px}
.xv-monolith .mo-pm::after{width:1px;height:8px;margin:-4px 0 0 -.5px}
.xv-monolith .mo-more:hover .mo-pm{border-color:var(--accent)}
.xv-monolith .mo-more[aria-expanded=true] .mo-pm::after{transform:scaleY(0)}
.xv-monolith .mo-panel{position:relative;max-width:62ch;margin-top:8px}
.xv-monolith .mo-panel[hidden]{display:none}
.xv-monolith .mo-pts li{position:relative;padding:14px 0 14px 28px;border-top:1px solid var(--rule);font-size:.86rem;line-height:1.75}
.xv-monolith .mo-pts li::before{content:"";position:absolute;left:0;top:calc(14px + .875em);width:14px;height:1px;background:var(--accent)}
.xv-monolith .mo-live .mo-pts li::before{background:var(--blue)}
.xv-monolith .mo-panel.mo-open{animation:mo-recon 1.1s var(--ease) both}
.xv-monolith .mo-panel.mo-open::after{content:"";position:absolute;left:0;right:0;top:0;height:100%;pointer-events:none;background:linear-gradient(transparent calc(100% - 40px),rgb(255 140 43/.14) calc(100% - 1px),var(--accent) calc(100% - 1px));animation:mo-sweep 1.1s var(--ease) both}
@keyframes mo-recon{from{clip-path:inset(0 -30px 100% -30px);filter:blur(5px);opacity:.2}to{clip-path:inset(-30px -30px -30px -30px);filter:blur(0);opacity:1}}
@keyframes mo-sweep{0%{transform:translateY(-100%);opacity:0}15%,80%{opacity:1}100%{transform:translateY(0);opacity:0}}

/* ---------- entrance: blur to sharp, light blooms in; the live frame is scanned ---------- */
.xv-monolith .mo-x{transition:opacity 1.5s var(--ease) calc(var(--d,0) * var(--dm,1) * 1ms),filter 1.5s var(--ease) calc(var(--d,0) * var(--dm,1) * 1ms),transform 1.5s var(--ease) calc(var(--d,0) * var(--dm,1) * 1ms)}
.xv-monolith.mo-armed .mo-frame:not(.mo-in) .mo-x{opacity:0;filter:blur(12px);transform:translateY(14px)}
.xv-monolith.mo-armed .mo-frame:not(.mo-in) .mo-name.mo-x{filter:blur(22px);transform:translateY(8px) scale(1.015)}
.xv-monolith.mo-armed .mo-frame::before{transition:opacity 2.6s var(--ease),transform 3s var(--ease)}
.xv-monolith.mo-armed .mo-frame:not(.mo-in)::before{opacity:0;transform:translateY(-50%) scale(.8)}
.xv-monolith .mo-live{--dm:1.9}
.xv-monolith .mo-live.mo-in::before{animation:mo-breathe 8s ease-in-out 3s infinite}
@keyframes mo-breathe{50%{opacity:.72}}
.xv-monolith .mo-scan{position:absolute;inset:0;z-index:2;pointer-events:none;opacity:0;background:linear-gradient(transparent calc(100% - 90px),rgb(90 209 230/.1) calc(100% - 1px),rgb(90 209 230/.9) calc(100% - 1px))}
.xv-monolith.mo-armed .mo-live.mo-in .mo-scan{animation:mo-scan 2.8s cubic-bezier(.45,0,.35,1) both}
@keyframes mo-scan{0%{transform:translateY(-100%);opacity:0}8%,88%{opacity:1}100%{transform:translateY(0);opacity:0}}

/* ---------- compact (home) ---------- */
.xv-monolith.xv-compact .mo-frame{min-height:0;max-width:880px;overflow:visible;padding:clamp(28px,4.5vw,52px);scroll-snap-align:none;--dm:1.3;background:linear-gradient(var(--accent),var(--accent)) 0 0/18px 1px no-repeat,linear-gradient(var(--accent),var(--accent)) 0 0/1px 18px no-repeat,linear-gradient(var(--accent),var(--accent)) 100% 100%/18px 1px no-repeat,linear-gradient(var(--accent),var(--accent)) 100% 100%/1px 18px no-repeat}
.xv-monolith.xv-compact .mo-frame::before{right:-14%;width:min(120%,760px)}
.xv-monolith.xv-compact .mo-name{margin:clamp(18px,3vw,28px) 0 14px;font-size:clamp(1.5rem,4.4vw,2.9rem)}
.xv-monolith.xv-compact .mo-lede{margin-top:16px;font-size:1rem}
.xv-monolith.xv-compact .mo-stack{margin-top:26px;gap:18px 12px}
.xv-monolith.xv-compact .mo-dtl{margin-top:18px}

/* ---------- narrow: rail collapses to a thin left line ---------- */
@media (max-width:899px){
  .xv-monolith{--g:28px;--lx:17px;--rh:min(64svh,420px);--ti-size:40px}
  .xv-monolith .mo-rlabel,.xv-monolith .mo-yr{display:none}
  .xv-monolith .mo-remp::before{left:3px;width:5px}
  .xv-monolith .mo-stop{width:28px;height:28px}
  .xv-monolith .mo-frame{min-height:min(78svh,640px);padding:clamp(44px,8svh,72px) 0 clamp(44px,8svh,72px) 12px}
  .xv-monolith .mo-stack{gap:18px 8px}
  .xv-monolith .mo-stack li{min-width:4.2rem}
  .xv-monolith .mo-lede{max-width:34ch}
  .xv-monolith.xv-compact{--ti-size:34px}
  .xv-monolith.xv-compact .mo-frame{padding:28px 20px}
}

@media (prefers-reduced-motion:reduce){
  .xv-monolith .mo-x,.xv-monolith .mo-frame::before{opacity:1!important;filter:none!important;transition:none!important}
  .xv-monolith .mo-x{transform:none!important}
  .xv-monolith .mo-frame::before{transform:translateY(-50%)!important}
  .xv-monolith .mo-scan{display:none}
  .xv-monolith .mo-panel.mo-open,.xv-monolith .mo-panel.mo-open::after{animation:none!important}
}
`

export function mount(el, { employers, compact }) {
  const u = ++uid
  const flat = []
  employers.forEach((e) => e.contracts.forEach((c, ci) => flat.push({ e, c, ci, i: flat.length })))
  const n = flat.length
  if (!n) return

  const H = compact ? 'h3' : 'h2'
  let step = 0
  const frameHTML = ({ e, c, ci, i }) => {
    const group = e.kind === 'group'
    const hid = `mo${u}-${i}-h`
    const live = c.current
    const strap = group
      ? `<p class="mo-strap mo-x" style="--d:0"><span class="mo-sk">Employer</span><span class="mo-sv">${esc(e.name)}</span>${e.contracts.length > 1 ? `<span class="mo-sn">Contract ${ci + 1} of ${e.contracts.length}</span>` : ''}</p>`
      : ''
    const desc = group && ci === 0 && e.desc && !compact
      ? `<div class="mo-desc mo-x" style="--d:90"><p id="mo${u}-${i}-dt">${esc(e.desc)}</p><button type="button" class="mo-link" aria-expanded="false" aria-controls="mo${u}-${i}-dt" hidden>Read more</button></div>`
      : ''
    const stack = c.skills.map((s, k) => `<li class="mo-x" style="--d:${620 + k * 55}"><span aria-hidden="true">${icon(s)}</span><span class="mo-cap">${esc(techName(s))}</span></li>`).join('')
    const pts = c.pts.length
      ? `<div class="mo-dtl mo-x" style="--d:${760 + c.skills.length * 55}"><button type="button" class="mo-more" aria-expanded="false" aria-controls="mo${u}-${i}-p"><span class="mo-pm" aria-hidden="true"></span><span class="mo-more-t">Show details<span class="sr"> for ${esc(c.co)}</span></span></button><div class="mo-panel" id="mo${u}-${i}-p" hidden><ul class="mo-pts">${c.pts.map((p) => `<li>${esc(p)}</li>`).join('')}</ul></div></div>`
      : ''
    return `<article class="mo-frame${live ? ' mo-live' : ''}" data-i="${i}" aria-labelledby="${hid}">
      ${live ? '<div class="mo-scan" aria-hidden="true"></div>' : ''}
      <div class="mo-body">
        ${strap}${desc}
        <${H} class="mo-name mo-x" id="${hid}" tabindex="-1" data-t="${esc(c.co)}" style="--d:160">${esc(c.co)}</${H}>
        <p class="mo-meta mo-x" style="--d:380"><span class="mo-title">${esc(c.title)}</span><span>${esc(range(c))}</span><span>${esc(dur(c.start, c.end))}</span>${live ? '<span class="badge">Live</span>' : ''}</p>
        <p class="mo-lede mo-x" style="--d:500">${esc(c.headline)}</p>
        <ul class="mo-stack" aria-label="Technologies used at ${esc(c.co)}">${stack}</ul>
        ${pts}
      </div>
    </article>`
  }

  let railHTML = ''
  if (!compact) {
    railHTML = `<div class="mo-gut"><nav class="mo-rail" aria-label="Experience timeline"><div class="mo-line" aria-hidden="true"><div class="mo-fill"></div></div><ol class="mo-emps">${
      employers.map((e) => {
        const k = e.contracts.length, t = (step / n) * 100, h = (k / n) * 100
        const stops = e.contracts.map((c, j) => {
          const g = step + j, y = ((j + 0.5) / k) * 100
          const label = `${c.co}, ${c.title}, ${range(c)}${c.current ? ', current' : ''}`
          return `<li style="--y:${y}%"><a class="mo-stop${c.current ? ' mo-live' : ''}" href="#/experience" data-i="${g}" aria-label="${esc(label)}" title="${esc(`${c.co}, ${range(c)}`)}"><span class="mo-yr" aria-hidden="true">${c.start.getUTCFullYear()}</span></a></li>`
        }).join('')
        step += k
        return `<li class="mo-remp${e.current ? ' mo-cur' : ''}" style="--t:${t}%;--h:${h}%"><span class="mo-rlabel" title="${esc(e.name)}">${esc(e.name)}</span><ol class="mo-stops">${stops}</ol></li>`
      }).join('')
    }</ol><div class="mo-dot" aria-hidden="true"><i class="o"></i><i class="b"></i></div></nav></div>`
  }

  el.innerHTML = `${railHTML}<div class="mo-frames">${flat.map(frameHTML).join('')}</div>`

  const frames = [...el.querySelectorAll('.mo-frame')]
  const cleanups = []

  /* arm entrance transitions and observe frames */
  if (!reduce) {
    el.classList.add('mo-armed')
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (!en.isIntersecting) return
        en.target.classList.add('mo-in')
        io.unobserve(en.target)
      })
    }, { rootMargin: '0px 0px -16% 0px', threshold: 0.1 })
    frames.forEach((f) => io.observe(f))
    cleanups.push(() => io.disconnect())
  }

  /* details + employer description */
  const onClick = (ev) => {
    const more = ev.target.closest('.mo-more')
    if (more && el.contains(more)) {
      const panel = el.querySelector(`#${more.getAttribute('aria-controls')}`)
      const open = more.getAttribute('aria-expanded') !== 'true'
      more.setAttribute('aria-expanded', String(open))
      more.querySelector('.mo-more-t').firstChild.textContent = open ? 'Hide details' : 'Show details'
      panel.hidden = !open
      panel.classList.remove('mo-open')
      if (open && !reduce) { void panel.offsetWidth; panel.classList.add('mo-open') }
      return
    }
    const link = ev.target.closest('.mo-link')
    if (link && el.contains(link)) {
      const box = link.parentElement
      const full = !box.classList.contains('mo-full')
      box.classList.toggle('mo-full', full)
      link.setAttribute('aria-expanded', String(full))
      link.textContent = full ? 'Read less' : 'Read more'
    }
  }
  el.addEventListener('click', onClick)
  cleanups.push(() => el.removeEventListener('click', onClick))

  /* only offer "Read more" when the description is actually clamped */
  const descs = [...el.querySelectorAll('.mo-desc')]
  const checkDesc = () => descs.forEach((d) => {
    const p = d.querySelector('p'), b = d.querySelector('.mo-link')
    if (!p.clientHeight || d.classList.contains('mo-full')) return
    b.hidden = p.scrollHeight <= p.clientHeight + 1
  })

  /* rail: scrollspy, following light, jump links */
  let tick = () => {}
  if (!compact) {
    const rail = el.querySelector('.mo-rail')
    const dot = el.querySelector('.mo-dot')
    const fill = el.querySelector('.mo-fill')
    const stops = [...el.querySelectorAll('.mo-stop')]
    let raf = 0, cur = -1
    tick = () => {
      raf = 0
      if (!el.getClientRects().length) return
      const ref = innerHeight * 0.5
      const rects = frames.map((f) => f.getBoundingClientRect())
      let p
      if (ref <= rects[0].top) p = 0
      else if (ref >= rects[n - 1].bottom) p = n
      else {
        const i = rects.findIndex((r) => ref < r.bottom)
        p = i + (ref - rects[i].top) / (rects[i].height || 1)
      }
      const f = p / n
      dot.style.transform = `translate3d(0,${(f * rail.offsetHeight).toFixed(1)}px,0)`
      fill.style.transform = `scaleY(${f.toFixed(4)})`
      const idx = Math.min(n - 1, Math.floor(p))
      if (idx !== cur) {
        cur = idx
        stops.forEach((s, k) => (k === idx ? s.setAttribute('aria-current', 'true') : s.removeAttribute('aria-current')))
        rail.classList.toggle('mo-onlive', flat[idx].c.current)
      }
    }
    const queue = () => { if (!raf) raf = requestAnimationFrame(tick) }
    addEventListener('scroll', queue, { passive: true })
    addEventListener('resize', queue)
    cleanups.push(() => { removeEventListener('scroll', queue); removeEventListener('resize', queue); cancelAnimationFrame(raf) })

    rail.addEventListener('click', (ev) => {
      const a = ev.target.closest('a[data-i]')
      if (!a || ev.button || ev.metaKey || ev.ctrlKey || ev.shiftKey || ev.altKey) return
      ev.preventDefault()
      const f = frames[+a.dataset.i]
      f.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' })
      f.querySelector('.mo-name').focus({ preventScroll: true })
    })
    var ro = new ResizeObserver(() => { checkDesc(); queue() })
    ro.observe(el)
    queue()
  } else {
    var ro = new ResizeObserver(checkDesc)
    ro.observe(el)
  }
  cleanups.push(() => ro.disconnect())
  checkDesc()

  /* gentle snapping on the experience page only; proximity never traps scrolling */
  let prevSnap
  if (!compact) {
    prevSnap = document.documentElement.style.scrollSnapType
    document.documentElement.style.scrollSnapType = 'y proximity'
    cleanups.push(() => { document.documentElement.style.scrollSnapType = prevSnap })
  }

  return () => cleanups.forEach((fn) => fn())
}
