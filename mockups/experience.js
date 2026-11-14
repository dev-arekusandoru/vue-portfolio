// Monolith: one contract per frame, an establishing shot each. A rail module (rails/*.js) follows the scroll.
import { esc, reduce, range, dur, grpMeta, techName } from './lib/data.js'
import { icon } from './lib/icons.js'

let uid = 0

export const css = `
.xv-monolith{--g:96px;--ti-size:52px;position:relative;display:grid;grid-template-columns:var(--g) minmax(0,1fr);color:var(--fg)}
.xv-monolith ol,.xv-monolith ul{list-style:none}
.xv-monolith.xv-compact{display:block;--ti-size:36px}

/* ---------- rail mount points: a rail module fills .mo-gut (wide screens) and .mo-bar (narrow screens) ---------- */
.xv-monolith .mo-gut{position:relative}
.xv-monolith .mo-bar{display:none}

/* ---------- frames ---------- */
.xv-monolith .mo-frames{min-width:0}
.xv-monolith .mo-frame{position:relative;isolation:isolate;overflow-x:clip;display:flex;flex-direction:column;justify-content:flex-start;min-height:clamp(560px,100svh,960px);padding:clamp(72px,15svh,150px) 0 clamp(64px,11svh,128px) clamp(10px,2vw,28px);scroll-snap-align:start}
.xv-monolith:not(.xv-compact) .mo-frame:first-child{padding-top:clamp(112px,16svh,170px)}
.xv-monolith .mo-frame + .mo-frame{border-top:1px solid var(--rule)}
.xv-monolith .mo-frame::before{content:"";position:absolute;z-index:-1;right:-8%;top:50%;width:min(80vw,860px);aspect-ratio:1;transform:translateY(-50%);pointer-events:none;background:radial-gradient(closest-side,rgb(255 140 43/.08),rgb(255 140 43/.026) 55%,transparent)}
.xv-monolith .mo-frame.mo-live::before{background:radial-gradient(closest-side,rgb(90 209 230/.12),rgb(90 209 230/.04) 55%,transparent)}
.xv-monolith .mo-body{position:relative;max-width:60rem}

/* optional layer: the contract's start year, huge and faint, behind its frame */
html[data-ghost=on] .xv-monolith:not(.xv-compact) .mo-frame::after{content:attr(data-year);content:attr(data-year) / "";position:absolute;z-index:-1;right:-2%;bottom:-3%;font:200 clamp(9rem,26vw,24rem)/.8 var(--display);letter-spacing:-.02em;color:rgb(255 140 43/.05);pointer-events:none;user-select:none;transition:opacity 2.4s var(--ease) .3s}
html[data-ghost=on] .xv-monolith:not(.xv-compact) .mo-live::after{color:rgb(90 209 230/.06)}
html[data-ghost=on] .xv-monolith.mo-armed .mo-frame:not(.mo-in)::after{opacity:0}

.xv-monolith .mo-emp{position:relative;max-width:46rem;padding:clamp(18px,2.4vw,26px) clamp(18px,3vw,32px) clamp(20px,2.6vw,28px);background:linear-gradient(135deg,rgb(255 140 43/.09),rgb(255 140 43/.02) 60%,transparent);box-shadow:inset 0 0 0 1px rgb(255 140 43/.3)}
.xv-monolith .mo-emp-name{font:300 clamp(1.2rem,2.4vw,1.75rem)/1.15 var(--display);letter-spacing:.06em;color:var(--fg)}
.xv-monolith .mo-emp-meta{display:flex;flex-wrap:wrap;gap:2px 14px;margin-top:8px;font-size:.76rem;color:var(--muted)}
.xv-monolith .mo-emp-meta b{font-weight:300;color:var(--accent)}
.xv-monolith .mo-emp-desc{max-width:58ch;margin-top:16px;font-size:.88rem;line-height:1.8;color:var(--fg);opacity:.9}
.xv-monolith .mo-strap{position:relative;display:flex;flex-wrap:wrap;align-items:baseline;gap:2px 16px;max-width:34rem;padding:2px 0 12px 16px;border-bottom:1px solid var(--rule);font-size:.86rem}
.xv-monolith .mo-strap::before{content:"";position:absolute;left:0;top:.25em;width:2px;height:1.35em;background:var(--accent)}
.xv-monolith .mo-sk{font-size:.74rem;color:var(--accent)}
.xv-monolith .mo-sv{font:300 .95rem/1.3 var(--display);letter-spacing:.05em;color:var(--fg)}
.xv-monolith .mo-sn{margin-left:auto;font-size:.76rem;color:var(--muted)}

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

.xv-monolith .mo-stack{display:grid;grid-template-columns:repeat(auto-fill,6.4rem);gap:24px 10px;margin-top:clamp(28px,5svh,52px)}
.xv-monolith .mo-stack li{display:grid;justify-items:start;align-content:start;gap:10px;color:var(--muted);transition:color .4s var(--ease)}
.xv-monolith .mo-stack .ti{transition:color .4s var(--ease),filter .5s var(--ease),opacity .4s var(--ease)}
.xv-monolith .mo-stack li:hover{color:var(--fg)}
.xv-monolith .mo-stack li:hover .ti{color:var(--accent)}
.xv-monolith .mo-live .mo-stack .ti{color:var(--blue);opacity:.85}
.xv-monolith .mo-live .mo-stack li:hover .ti{color:var(--fg);opacity:1;filter:drop-shadow(0 0 8px rgb(90 209 230/.7))}
.xv-monolith .mo-cap{font-size:.66rem;line-height:1.4;overflow-wrap:anywhere}

.xv-monolith .mo-dtl{margin-top:clamp(22px,4svh,40px)}
.xv-monolith .mo-more{display:inline-flex;align-items:center;gap:14px;min-height:44px;padding:0;background:none;border:0;cursor:pointer;font:inherit;font-size:.78rem;color:var(--fg)}
.xv-monolith .mo-more:focus-visible{outline:2px solid var(--accent);outline-offset:4px}
.xv-monolith .mo-pm{position:relative;flex:none;width:20px;height:20px;border:1px solid rgb(255 140 43/.55);transition:border-color .4s var(--ease),transform .6s var(--ease)}
.xv-monolith .mo-pm::before,.xv-monolith .mo-pm::after{content:"";position:absolute;left:50%;top:50%;background:var(--accent);transition:transform .6s var(--ease)}
.xv-monolith .mo-pm::before{width:8px;height:1px;margin:-.5px 0 0 -4px}
.xv-monolith .mo-pm::after{width:1px;height:8px;margin:-4px 0 0 -.5px}
.xv-monolith .mo-more:hover .mo-pm{border-color:var(--accent)}
.xv-monolith .mo-more[aria-expanded=true] .mo-pm::after{transform:scaleY(0)}
.xv-monolith .mo-panel{position:relative;max-width:62ch;margin-top:8px;display:grid;grid-template-rows:0fr;visibility:hidden;transition:grid-template-rows .75s var(--ease),visibility 0s linear .75s}
.xv-monolith .mo-panel.mo-open{grid-template-rows:1fr;visibility:visible;transition:grid-template-rows .75s var(--ease),visibility 0s}
.xv-monolith .mo-pin{min-height:0;overflow:hidden}
.xv-monolith .mo-pts{opacity:0;transform:translateY(-10px);transition:opacity .4s var(--ease),transform .6s var(--ease)}
.xv-monolith .mo-panel.mo-open .mo-pts{opacity:1;transform:none;transition-delay:.1s}
.xv-monolith .mo-pts li{position:relative;padding:14px 0 14px 28px;border-top:1px solid var(--rule);font-size:.86rem;line-height:1.75}
.xv-monolith .mo-pts li::before{content:"";position:absolute;left:0;top:calc(14px + .875em);width:14px;height:1px;background:var(--accent)}
.xv-monolith .mo-live .mo-pts li::before{background:var(--blue)}
.xv-monolith .mo-panel.mo-open::after{content:"";position:absolute;left:0;right:0;top:0;height:100%;pointer-events:none;background:linear-gradient(transparent calc(100% - 40px),rgb(255 140 43/.14) calc(100% - 1px),var(--accent) calc(100% - 1px));animation:mo-sweep 1s var(--ease) both}
@keyframes mo-sweep{0%{transform:translateY(-100%);opacity:0}15%,80%{opacity:1}100%{transform:translateY(0);opacity:0}}

/* wide screens: bullets are always shown, so the toggle is hidden */
@media (min-width:900px){
  .xv-monolith .mo-more{display:none}
  .xv-monolith .mo-panel{grid-template-rows:1fr;visibility:visible;transition:none}
  .xv-monolith .mo-pts{opacity:1;transform:none;transition:none}
}

/* ---------- entrance: blur to sharp, light blooms in; the live frame is scanned ---------- */
.xv-monolith .mo-x{--tx:calc(var(--d,0) * var(--dm,1) * 1ms);transition:opacity .9s var(--ease) var(--tx),transform .9s var(--ease) var(--tx)}
.xv-monolith .mo-name.mo-x{transition:opacity 1s var(--ease) var(--tx),transform 1s var(--ease) var(--tx),filter 1.1s var(--ease) var(--tx)}
.xv-monolith.mo-armed .mo-frame:not(.mo-in) .mo-x{opacity:0;transform:translateY(12px)}
.xv-monolith.mo-armed .mo-frame:not(.mo-in) .mo-name.mo-x{filter:blur(14px);transform:translateY(6px) scale(1.012)}
.xv-monolith.mo-armed .mo-frame::before{transition:opacity 2s var(--ease),transform 2.4s var(--ease)}
.xv-monolith.mo-armed .mo-frame:not(.mo-in)::before{opacity:0;transform:translateY(-50%) scale(.8)}
.xv-monolith .mo-live{--dm:1.25}
.xv-monolith .mo-live.mo-in::before{animation:mo-breathe 8s ease-in-out 3s infinite}
@keyframes mo-breathe{50%{opacity:.72}}
.xv-monolith .mo-scan{position:absolute;inset:0;z-index:2;pointer-events:none;opacity:0;background:linear-gradient(transparent calc(100% - 90px),rgb(90 209 230/.1) calc(100% - 1px),rgb(90 209 230/.9) calc(100% - 1px))}
.xv-monolith.mo-armed .mo-live.mo-in .mo-scan{animation:mo-scan 2.2s cubic-bezier(.45,0,.35,1) both}
@keyframes mo-scan{0%{transform:translateY(-100%);opacity:0}8%,88%{opacity:1}100%{transform:translateY(0);opacity:0}}

/* ---------- compact (home) ---------- */
.xv-monolith.xv-compact .mo-frame{min-height:0;max-width:880px;overflow:visible;padding:clamp(28px,4.5vw,52px);--dm:1.3;background:linear-gradient(var(--accent),var(--accent)) 0 0/18px 1px no-repeat,linear-gradient(var(--accent),var(--accent)) 0 0/1px 18px no-repeat,linear-gradient(var(--accent),var(--accent)) 100% 100%/18px 1px no-repeat,linear-gradient(var(--accent),var(--accent)) 100% 100%/1px 18px no-repeat}
.xv-monolith.xv-compact .mo-frame::before{right:-14%;width:min(120%,760px)}
.xv-monolith.xv-compact .mo-name{margin:clamp(18px,3vw,28px) 0 14px;font-size:clamp(1.5rem,4.4vw,2.9rem)}
.xv-monolith.xv-compact .mo-lede{margin-top:16px;font-size:1rem}
.xv-monolith.xv-compact .mo-stack{grid-template-columns:repeat(auto-fill,5.6rem);margin-top:26px;gap:18px 8px}
.xv-monolith.xv-compact .mo-dtl{margin-top:18px}

/* ---------- narrow: the rail moves to a bar pinned to the bottom of the screen ---------- */
@media (max-width:899px){
  .xv-monolith{grid-template-columns:minmax(0,1fr);--ti-size:26px}
  .xv-monolith .mo-gut{display:none}
  .xv-monolith .mo-bar{display:block;grid-column:1/-1;position:sticky;bottom:0;z-index:30;padding-bottom:env(safe-area-inset-bottom)}
  .xv-monolith .mo-frame{min-height:min(100svh,860px);padding:clamp(44px,8svh,72px) 0 clamp(44px,8svh,72px) 0}
  .xv-monolith .mo-name{font-size:clamp(1.7rem,9vw,3rem)}
  .xv-monolith .mo-stack{grid-template-columns:repeat(auto-fill,minmax(4.4rem,1fr));gap:16px 6px}
  .xv-monolith .mo-cap{font-size:.62rem}
  .xv-monolith .mo-cw{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap}
  .xv-monolith .mo-lede{max-width:34ch}
  .xv-monolith.xv-compact{--ti-size:26px}
  .xv-monolith.xv-compact .mo-frame{padding:28px 20px}
}

@media (prefers-reduced-motion:reduce){
  .xv-monolith .mo-x,.xv-monolith .mo-frame::before{opacity:1!important;filter:none!important;transition:none!important}
  .xv-monolith .mo-x{transform:none!important}
  .xv-monolith .mo-frame::before{transform:translateY(-50%)!important}
  .xv-monolith .mo-scan{display:none}
  .xv-monolith .mo-panel.mo-open::after{animation:none!important}
  .xv-monolith .mo-pts{opacity:1;transform:none}
}
`

export function mount(el, { employers, compact, rail }) {
  const u = ++uid
  const flat = []
  employers.forEach((e) => e.contracts.forEach((c, ci) => flat.push({ e, c, ci, i: flat.length })))
  const n = flat.length
  if (!n) return

  const H = compact ? 'h3' : 'h2'
  const frameHTML = ({ e, c, ci, i }) => {
    const group = e.kind === 'group'
    const hid = `mo${u}-${i}-h`
    const live = c.current
    const total = e.contracts.length
    const plate = group && ci === 0 && !compact
      ? `<div class="mo-emp mo-x brk" style="--d:0" role="group" aria-label="Employer: ${esc(e.name)}"><p class="mo-emp-name">${esc(e.name)}</p><p class="mo-emp-meta"><b>Employer</b><span>${esc(grpMeta(e))}</span></p>${e.desc ? `<p class="mo-emp-desc">${esc(e.desc)}</p>` : ''}</div>`
      : ''
    const strap = group && !plate
      ? `<p class="mo-strap mo-x" style="--d:0"><span class="mo-sk">Employer</span><span class="mo-sv">${esc(e.name)}</span>${total > 1 ? `<span class="mo-sn"><span class="mo-cw">Contract </span>${ci + 1} of ${total}</span>` : ''}</p>`
      : ''
    const stack = c.skills.map((s, k) => `<li class="mo-x" style="--d:${300 + k * 45}"><span aria-hidden="true">${icon(s)}</span><span class="mo-cap">${esc(techName(s))}</span></li>`).join('')
    const pts = c.pts.length
      ? `<div class="mo-dtl mo-x" style="--d:${420 + c.skills.length * 45}"><button type="button" class="mo-more" aria-expanded="false" aria-controls="mo${u}-${i}-p"><span class="mo-pm" aria-hidden="true"></span><span class="mo-more-t">Show details<span class="sr"> for ${esc(c.co)}</span></span></button><div class="mo-panel" id="mo${u}-${i}-p"><div class="mo-pin"><ul class="mo-pts">${c.pts.map((p) => `<li>${esc(p)}</li>`).join('')}</ul></div></div></div>`
      : ''
    return `<article class="mo-frame${live ? ' mo-live' : ''}" data-i="${i}" data-year="${c.start.getUTCFullYear()}" aria-labelledby="${hid}">
      ${live ? '<div class="mo-scan" aria-hidden="true"></div>' : ''}
      <div class="mo-body">
        ${plate}${strap}
        <${H} class="mo-name mo-x" id="${hid}" tabindex="-1" data-t="${esc(c.co)}" style="--d:100">${esc(c.co)}</${H}>
        <p class="mo-meta mo-x" style="--d:220"><span class="mo-title">${esc(c.title)}</span><span>${esc(range(c))}</span><span>${esc(dur(c.start, c.end))}</span>${live ? '<span class="badge">Live</span>' : ''}</p>
        <p class="mo-lede mo-x" style="--d:300">${esc(c.headline)}</p>
        <ul class="mo-stack" aria-label="Technologies used at ${esc(c.co)}">${stack}</ul>
        ${pts}
      </div>
    </article>`
  }

  el.innerHTML = `${compact ? '' : '<div class="mo-gut"></div>'}<div class="mo-frames">${flat.map(frameHTML).join('')}</div>${compact ? '' : '<div class="mo-bar"></div>'}`

  const frames = [...el.querySelectorAll('.mo-frame')]
  const cleanups = []

  /* animated scroll for rail jumps. Native scroll-snap is suspended while it runs and restored after (the target is a snap point, so nothing moves). Any user input cancels it. */
  const root = document.documentElement
  const inOutCubic = (p) => (p < 0.5 ? 4 * p ** 3 : 1 - (-2 * p + 2) ** 3 / 2)
  let glideRaf = 0, gliding = false
  const endGlide = () => {
    cancelAnimationFrame(glideRaf)
    if (!gliding) return
    gliding = false
    root.style.removeProperty('scroll-snap-type')
  }
  const glide = (to, ms) => {
    endGlide()
    const from = scrollY, dist = to - from
    if (reduce || Math.abs(dist) < 2) { scrollTo({ top: to, behavior: 'instant' }); return }
    gliding = true
    root.style.scrollSnapType = 'none'
    let t0
    const step = (now) => {
      t0 ??= now
      const p = Math.min(1, (now - t0) / ms)
      scrollTo({ top: from + dist * inOutCubic(p), behavior: 'instant' })
      if (p < 1 && gliding) glideRaf = requestAnimationFrame(step)
      else endGlide()
    }
    glideRaf = requestAnimationFrame(step)
  }
  cleanups.push(endGlide)

  /* entrance: frames start hidden and play once as they scroll into view. While the boot overlay is up the entrance waits, so it plays as the overlay lifts instead of behind it. */
  if (!reduce) {
    el.classList.add('mo-armed')
    let io
    const observe = () => {
      io?.disconnect()
      io = new IntersectionObserver((entries) => {
        entries.forEach((en) => {
          if (!en.isIntersecting) return
          en.target.classList.add('mo-in')
          io.unobserve(en.target)
        })
      }, { rootMargin: '0px 0px -16% 0px', threshold: 0.1 })
      frames.forEach((f) => io.observe(f))
    }
    if (root.dataset.boot === 'running') addEventListener('boot-done', observe, { once: true })
    else observe()
    cleanups.push(() => { io?.disconnect(); removeEventListener('boot-done', observe) })
  }

  /* details: collapsed on narrow screens until opened (wide screens show them always, see CSS) */
  const onClick = (ev) => {
    const more = ev.target.closest('.mo-more')
    if (!more || !el.contains(more)) return
    const open = more.getAttribute('aria-expanded') !== 'true'
    more.setAttribute('aria-expanded', String(open))
    more.querySelector('.mo-more-t').firstChild.textContent = open ? 'Hide details' : 'Show details'
    el.querySelector(`#${more.getAttribute('aria-controls')}`).classList.toggle('mo-open', open)
  }
  el.addEventListener('click', onClick)
  cleanups.push(() => el.removeEventListener('click', onClick))

  /* progress shared with the rail. q is 0 when frame 0's top is at the top of the screen and n-1 at the last frame's top, linear in between, so a rail marker stays aligned however tall a frame grows. idx is the frame under the middle of the screen. */
  if (!compact) {
    const subs = new Set()
    let state = null, raf = 0
    const compute = () => {
      raf = 0
      if (!el.getClientRects().length) return
      const y = scrollY, ref = innerHeight * 0.5
      const rects = frames.map((f) => f.getBoundingClientRect())
      let q = n - 1
      if (rects[0].top >= 0) q = 0
      else for (let k = 0; k < n - 1; k++) {
        const a = rects[k].top + y, b = rects[k + 1].top + y
        if (y < b) { q = k + Math.max(0, y - a) / (b - a || 1); break }
      }
      let idx = rects.findIndex((r) => ref < r.bottom)
      if (idx < 0) idx = n - 1
      state = { q, idx }
      subs.forEach((fn) => fn(state))
    }
    const queue = () => { if (!raf) raf = requestAnimationFrame(compute) }
    addEventListener('scroll', queue, { passive: true })
    addEventListener('resize', queue)
    const ro = new ResizeObserver(queue)
    ro.observe(el)
    cleanups.push(() => { removeEventListener('scroll', queue); removeEventListener('resize', queue); ro.disconnect(); cancelAnimationFrame(raf) })

    const goTo = (i) => {
      const f = frames[i]
      const top = f.getBoundingClientRect().top + scrollY
      glide(top, Math.min(1000, 450 + Math.abs(top - scrollY) * 0.25))
      f.querySelector('.mo-name').focus({ preventScroll: true })
    }
    const subscribe = (fn) => { subs.add(fn); if (state) fn(state); return () => subs.delete(fn) }
    el.classList.add(`rail-${rail.id}`)
    const stop = rail.mount({ el, gut: el.querySelector('.mo-gut'), bar: el.querySelector('.mo-bar'), flat, employers, n, frames, goTo, subscribe })
    cleanups.push(() => { stop?.(); el.classList.remove(`rail-${rail.id}`) })
    queue()
  }

  /* any user input cancels a rail jump and hands control back to native snapping */
  if (!compact) {
    const inputs = ['wheel', 'touchstart', 'keydown', 'pointerdown']
    inputs.forEach((t) => addEventListener(t, endGlide, { passive: true }))
    cleanups.push(() => inputs.forEach((t) => removeEventListener(t, endGlide)))
  }

  return () => cleanups.forEach((fn) => fn())
}
