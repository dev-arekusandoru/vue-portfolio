// Emanator: a line of light with one orb gliding along it (Joi's projector). Least text, most mood.
// Desktop: vertical line in the gutter. Mobile: the same instrument laid on its side in the bottom bar.
import { esc, reduce, range } from '../lib/data.js'

export const id = 'emanator'

const R = '.xv-monolith.rail-emanator'

export const css = `
${R}{--g:128px}
${R} .mo-bar{background:rgb(8 10 12/.97)}

${R} .em-nav{--em-a:255 140 43;--em-b:90 209 230;position:relative;font:300 .7rem/1.35 var(--mono);color:var(--muted)}
${R} .em-rail{position:relative}
${R} .em-lines{position:absolute}
${R} .em-ln,${R} .em-ha,${R} .em-fl,${R} .em-fa,${R} .em-fb{position:absolute;inset:0}
${R} .em-ln{background:rgb(var(--em-a)/.34)}
${R} .em-ha{background:rgb(var(--em-a)/.16);filter:blur(4px)}
${R} .em-fl{transform-origin:0 0}
${R} .em-fa{--c:rgb(var(--em-a))}
${R} .em-fb{--c:rgb(var(--em-b));opacity:0}
${R} .em-fa::before,${R} .em-fb::before{content:"";position:absolute;inset:0;background:var(--c)}
${R} .em-fa::after,${R} .em-fb::after{content:"";position:absolute;background:var(--c);opacity:.5;filter:blur(4px)}
${R} .em-fa,${R} .em-fb{transition:opacity .9s var(--ease)}
${R} .em-nav[data-live="1"] .em-fa{opacity:0}
${R} .em-nav[data-live="1"] .em-fb{opacity:1}

/* the orb: bloom, core and a streak that stretches behind it while it moves */
${R} .em-orb{position:absolute;width:0;height:0;pointer-events:none;will-change:transform}
${R} .em-ly{position:absolute;left:0;top:0;transition:opacity .9s var(--ease)}
${R} .em-ly.a{--c:rgb(255 176 100);--k:#fff2e0;--gl:255 140 43}
${R} .em-ly.b{--c:rgb(150 232 247);--k:#eafcff;--gl:90 209 230;opacity:0}
${R} .em-nav[data-live="1"] .em-ly.a{opacity:0}
${R} .em-nav[data-live="1"] .em-ly.b{opacity:1}
${R} .em-bloom{position:absolute;left:0;top:0;width:92px;height:92px;margin:-46px 0 0 -46px;border-radius:50%;background:radial-gradient(circle,rgb(var(--gl)/.55),rgb(var(--gl)/.14) 42%,transparent 70%);animation:em-breathe 4.2s ease-in-out infinite alternate}
${R} .em-core{position:absolute;left:0;top:0;width:7px;height:7px;margin:-3.5px 0 0 -3.5px;border-radius:50%;background:var(--k);box-shadow:0 0 7px 1px var(--c),0 0 22px 6px rgb(var(--gl)/.5)}
${R} .em-streak{position:absolute;left:0;top:0}

/* stops */
${R} .em-stop{position:absolute;display:grid;place-items:center;padding:0;border:0;border-radius:0;background:none;color:inherit;font:inherit;cursor:pointer;-webkit-tap-highlight-color:transparent}
${R} .em-ring{position:relative;display:block;width:15px;height:15px;border-radius:50%;border:1px solid rgb(var(--em-a)/.6);background:var(--bg);transition:transform .5s var(--ease),border-color .5s var(--ease),box-shadow .5s var(--ease)}
${R} .em-ring::before{content:"";position:absolute;left:50%;top:50%;width:3px;height:3px;margin:-1.5px 0 0 -1.5px;border-radius:50%;background:rgb(var(--em-a));opacity:0;transition:opacity .5s var(--ease)}
${R} .em-stop.past .em-ring{border-color:rgb(var(--em-a));box-shadow:0 0 8px rgb(var(--em-a)/.4)}
${R} .em-stop.past .em-ring::before{opacity:1}
${R} .em-stop.is-live .em-ring{border-color:rgb(var(--em-b)/.75)}
${R} .em-stop.is-live .em-ring::before{background:rgb(var(--em-b))}
${R} .em-stop.is-live.past .em-ring{border-color:rgb(var(--em-b));box-shadow:0 0 9px rgb(var(--em-b)/.5)}
${R} .em-stop.is-live .em-ring::after{content:"";position:absolute;inset:-1px;border-radius:50%;border:1px solid rgb(var(--em-b));animation:em-ping 3.6s var(--ease) infinite}
${R} .em-stop:hover .em-ring,${R} .em-stop:focus-visible .em-ring{transform:scale(1.3)}
${R} .em-stop:focus-visible{outline:none}
${R} .em-stop:focus-visible .em-ring{outline:2px solid var(--accent);outline-offset:3px}

/* employer brackets */
${R} .em-br{position:absolute;border:1px solid rgb(var(--em-a)/.5);transition:border-color .6s var(--ease),box-shadow .6s var(--ease)}
${R} .em-gn{position:absolute;color:var(--muted);transition:color .6s var(--ease);pointer-events:none}
${R} .em-br.on{border-color:rgb(var(--em-a));box-shadow:0 0 8px rgb(var(--em-a)/.3)}
${R} .em-gn.on{color:var(--fg)}

/* ===== wide: a vertical line in the gutter ===== */
${R} .em-v{--h:clamp(260px,calc(var(--n)*150px),min(calc(100svh - 230px),760px));position:sticky;top:max(112px,calc((100svh - var(--h)) / 2));height:var(--h)}
${R} .em-v .em-rail{height:100%}
${R} .em-v .em-lines{left:28px;top:0;bottom:0;width:1px;-webkit-mask-image:linear-gradient(to bottom,transparent,#000 8%,#000 92%,transparent);mask-image:linear-gradient(to bottom,transparent,#000 8%,#000 92%,transparent)}
${R} .em-v .em-ha{inset:0 -4px}
${R} .em-v .em-fl{transform:scaleY(0)}
${R} .em-v .em-fa::after,${R} .em-v .em-fb::after{inset:0 -4px}
${R} .em-v .em-orb{left:28px;top:0}
${R} .em-v .em-streak{width:2px;height:100px;margin:-50px 0 0 -1px;background:linear-gradient(to bottom,transparent,var(--c) 50%,transparent);transform:translateY(var(--sh,0px)) scaleY(var(--ss,.34))}
${R} .em-v .em-stop{left:28px;top:var(--at);width:34px;height:34px;margin:-17px 0 0 -17px;border-radius:50%}
${R} .em-v .em-br{left:9px;top:var(--t);height:var(--hh);width:7px;border-right:0}
${R} .em-v .em-gn{left:3px;top:var(--t);max-width:112px;display:-webkit-box;-webkit-box-orient:vertical;-webkit-line-clamp:2;overflow:hidden;overflow-wrap:anywhere;transform:translateY(calc(-100% - 5px))}
${R} .em-v .em-lab{position:absolute;left:calc(100% + 2px);top:50%;width:max-content;max-width:calc(var(--g) - 52px + clamp(10px,2vw,28px));text-align:left;opacity:0;transform:translate(-8px,-50%);transition:opacity .55s var(--ease),transform .7s var(--ease);pointer-events:none}
${R} .em-v .em-nm{position:relative;display:block;color:var(--fg);overflow-wrap:anywhere}
${R} .em-v .em-yr{display:block;color:var(--muted)}
${R} .em-v .em-stop:hover .em-lab,${R} .em-v .em-stop:focus-visible .em-lab,${R} .em-v .em-stop.on .em-lab{opacity:1;transform:translate(0,-50%)}
${R} .em-v .em-stop.is-live .em-nm{color:var(--blue)}

/* hologram: the live contract's label flickers and carries a chromatic edge */
${R} .em-v .em-stop.is-live.on .em-lab{animation:em-dim 7s linear infinite}
${R} .em-v .em-stop.is-live.on .em-nm::before,${R} .em-v .em-stop.is-live.on .em-nm::after{content:attr(data-t);position:absolute;left:0;top:0;width:100%;opacity:.5;mix-blend-mode:screen;pointer-events:none}
${R} .em-v .em-stop.is-live.on .em-nm::before{color:#ff5a78;transform:translateX(-1px);animation:em-fl-a 7s linear infinite}
${R} .em-v .em-stop.is-live.on .em-nm::after{color:#5ad1e6;transform:translateX(1px);animation:em-fl-b 7s linear infinite}

/* ===== narrow: the same line laid on its side ===== */
${R} .em-h{box-sizing:border-box;height:60px;margin-inline:-20px;padding:4px 20px 0;background:rgb(8 10 12/.97);border-top:1px solid var(--rule)}
${R} .em-h .em-now{position:relative;display:flex;align-items:baseline;gap:12px;height:18px;margin:0 0 -6px;line-height:18px;white-space:nowrap}
${R} .em-h .em-nn{flex:1 1 auto;min-width:0;overflow:hidden;text-overflow:ellipsis;color:var(--fg)}
${R} .em-h .em-ee{color:var(--muted)}
${R} .em-h .em-sep{margin:0 .55em;color:rgb(var(--em-a))}
${R} .em-h .em-ct{flex:none;color:var(--muted)}
${R} .em-h .em-lv{flex:none;color:var(--blue)}
${R} .em-h .em-lv::before{content:"";display:inline-block;width:5px;height:5px;margin-right:5px;vertical-align:1px;border-radius:50%;background:var(--blue);box-shadow:0 0 6px var(--blue)}
${R} .em-h .em-lv[hidden],${R} .em-h .em-sep[hidden],${R} .em-h .em-ee[hidden]{display:none}
${R} .em-h .em-now.live .em-nn{color:var(--blue);text-shadow:-1px 0 rgb(255 90 120/.45),1px 0 rgb(90 209 230/.5);animation:em-dim 7s linear infinite}
${R} .em-h .em-now.live .em-ee{color:var(--blue)}
${R} .em-h .em-rail{height:44px}
${R} .em-h .em-lines{left:0;right:0;top:22px;height:1px;-webkit-mask-image:linear-gradient(to right,transparent,#000 6%,#000 94%,transparent);mask-image:linear-gradient(to right,transparent,#000 6%,#000 94%,transparent)}
${R} .em-h .em-ha{inset:-4px 0}
${R} .em-h .em-fl{transform:scaleX(0)}
${R} .em-h .em-fa::after,${R} .em-h .em-fb::after{inset:-4px 0}
${R} .em-h .em-orb{left:0;top:22px}
${R} .em-h .em-bloom{width:64px;height:64px;margin:-32px 0 0 -32px}
${R} .em-h .em-streak{width:100px;height:2px;margin:-1px 0 0 -50px;background:linear-gradient(to right,transparent,var(--c) 50%,transparent);transform:translateX(var(--sh,0px)) scaleX(var(--ss,.34))}
${R} .em-h .em-stop{left:var(--at);top:22px;width:max(28px,calc(100% / var(--n)));height:44px;transform:translate(-50%,-50%)}
${R} .em-h .em-br{left:var(--t);top:8px;width:var(--hh);height:5px;border-bottom:0}
${R} .em-h .em-gn,${R} .em-h .em-lab{display:none}

@keyframes em-breathe{from{transform:scale(.88);opacity:.75}to{transform:scale(1.1);opacity:1}}
@keyframes em-ping{0%{transform:scale(1);opacity:.75}70%,100%{transform:scale(2.7);opacity:0}}
@keyframes em-dim{0%,90%,100%{opacity:1}91%{opacity:.5}92%{opacity:1}94.5%{opacity:.62}95.5%{opacity:1}}
@keyframes em-fl-a{0%,90%,100%{transform:translateX(-1px);opacity:.5}91%{transform:translateX(-3px);opacity:.9}92%{transform:translateX(-1px);opacity:.35}94.5%{transform:translateX(-2.5px);opacity:.85}95.5%{transform:translateX(-1px);opacity:.5}}
@keyframes em-fl-b{0%,90%,100%{transform:translateX(1px);opacity:.5}91%{transform:translateX(3px);opacity:.9}92%{transform:translateX(1px);opacity:.35}94.5%{transform:translateX(2.5px);opacity:.85}95.5%{transform:translateX(1px);opacity:.5}}

@media (prefers-reduced-motion:reduce){
  ${R} .em-bloom,${R} .em-lab,${R} .em-nn,${R} .em-nm::before,${R} .em-nm::after{animation:none!important}
  ${R} .em-stop.is-live .em-ring::after{animation:none;transform:scale(1.9);opacity:.35}
  ${R} .em-ly,${R} .em-fa,${R} .em-fb,${R} .em-ring,${R} .em-ring::before,${R} .em-br,${R} .em-gn,${R} .em-lab{transition:none!important}
}
`

/* ---------- helpers ---------- */
const yearSpan = (c) => {
  const a = c.start.getUTCFullYear(), b = c.end.getUTCFullYear()
  return c.current ? `${a} – now` : a === b ? `${a}` : `${a} – ${b}`
}
// the name a contract goes by: a group's own-name contract is told apart by its title
const cname = (e, c) => (e.kind === 'group' && c.co === e.name ? c.title : c.co)
const aria = ({ e, c }) => `${c.co}, ${c.title}, ${range(c)}${c.current ? ', current' : ''}${e.kind === 'group' ? `, employer ${e.name}` : ''}`

export function mount(ctx) {
  const { gut, bar, flat, n, goTo, subscribe } = ctx
  if (!n) return () => {}

  const pct = (k) => ((k + 0.5) / n) * 100
  const groups = ctx.employers
    .filter((e) => e.kind === 'group')
    .map((e) => {
      const ix = flat.filter((f) => f.e === e).map((f) => f.i)
      return { e, a: Math.min(...ix), b: Math.max(...ix) }
    })

  const stopHTML = (it) => {
    const nm = cname(it.e, it.c)
    return `<button type="button" class="em-stop${it.c.current ? ' is-live' : ''}" data-i="${it.i}" style="--at:${pct(it.i)}%" aria-label="${esc(aria(it))}"><span class="em-ring"></span><span class="em-lab" aria-hidden="true"><span class="em-nm" data-t="${esc(nm)}">${esc(nm)}</span><span class="em-yr">${esc(yearSpan(it.c))}</span></span></button>`
  }
  const brHTML = (g, v) => `<span class="em-br" style="--t:${((g.a + 0.2) / n) * 100}%;--hh:${((g.b - g.a + 0.6) / n) * 100}%" aria-hidden="true"></span>${v ? `<span class="em-gn" style="--t:${((g.a + 0.2) / n) * 100}%" aria-hidden="true">${esc(g.e.name)}</span>` : ''}`
  const layers = '<span class="em-bloom"></span><span class="em-streak"></span><span class="em-core"></span>'
  const nowHTML = '<p class="em-now" aria-hidden="true"><span class="em-nn"><span class="em-ee"></span><span class="em-sep">›</span><span class="em-cn"></span></span><span class="em-ct"></span><span class="em-lv" hidden>now</span></p>'

  const build = (host, axis) => {
    host.innerHTML = `<nav class="em-nav em-${axis}" aria-label="Experience timeline" style="--n:${n}">${axis === 'h' ? nowHTML : ''}<div class="em-rail"><div class="em-lines" aria-hidden="true"><span class="em-ln"></span><span class="em-ha"></span><span class="em-fl"><span class="em-fa"></span><span class="em-fb"></span></span></div>${groups.map((g) => brHTML(g, axis === 'v')).join('')}${flat.map(stopHTML).join('')}<div class="em-orb" aria-hidden="true"><span class="em-ly a">${layers}</span><span class="em-ly b">${layers}</span></div></div></nav>`
    const nav = host.firstElementChild
    const $ = (s) => nav.querySelector(s)
    const brs = [...nav.querySelectorAll('.em-br')], gns = [...nav.querySelectorAll('.em-gn')]
    return {
      host, nav, h: axis === 'h', size: 0,
      rail: $('.em-rail'), orb: $('.em-orb'), fl: $('.em-fl'),
      stops: [...nav.querySelectorAll('.em-stop')],
      grp: groups.map((g, k) => ({ ...g, br: brs[k], gn: gns[k] })),
      now: $('.em-now'), ee: $('.em-ee'), sep: $('.em-sep'), cn: $('.em-cn'), ct: $('.em-ct'), lv: $('.em-lv'),
    }
  }

  const navs = [gut && build(gut, 'v'), bar && build(bar, 'h')].filter(Boolean)

  /* jump: one delegated listener per host */
  const onClick = (ev) => {
    const b = ev.target.closest('.em-stop')
    if (b) goTo(+b.dataset.i)
  }
  navs.forEach((N) => N.host.addEventListener('click', onClick))

  /* sizes of the rails (read by observer, never inside the scroll callback) */
  const ro = new ResizeObserver((entries) => {
    for (const en of entries) {
      const N = navs.find((x) => x.rail === en.target)
      if (N) N.size = N.h ? en.contentRect.width : en.contentRect.height
    }
    draw()
  })
  navs.forEach((N) => ro.observe(N.rail))

  /* orb: eased toward the scroll position, the lag stretches its streak */
  let target = 0, cur = 0, lag = 0, raf = 0, last = 0, started = false
  const draw = () => {
    const s = lag === 0 ? 0 : Math.min(Math.abs(lag) * n * 46, 130)
    const shift = -Math.sign(lag) * s / 2
    const scale = (34 + s) / 100
    for (const N of navs) {
      if (!N.size) continue
      const px = cur * N.size
      N.orb.style.transform = N.h ? `translate3d(${px}px,0,0)` : `translate3d(0,${px}px,0)`
      N.fl.style.transform = N.h ? `scaleX(${cur})` : `scaleY(${cur})`
      N.orb.style.setProperty('--sh', `${shift}px`)
      N.orb.style.setProperty('--ss', scale)
    }
  }
  const tick = (t) => {
    raf = 0
    const dt = Math.min(0.05, (t - last) / 1000)
    last = t
    const d = target - cur
    if (Math.abs(d) < 0.0002 / n) { cur = target; lag = 0; draw(); return }
    cur += d * (1 - Math.exp(-dt * 11))
    lag = target - cur
    draw()
    raf = requestAnimationFrame(tick)
  }
  const kick = () => { if (!raf) { last = performance.now(); raf = requestAnimationFrame(tick) } }

  /* discrete state: current contract, reached stops, live crossfade, bar label */
  let idx = -1, pastN = -1
  const setIdx = (i) => {
    idx = i
    const { e, c } = flat[i]
    for (const N of navs) {
      N.stops.forEach((b, k) => {
        const on = k === i
        b.classList.toggle('on', on)
        if (on) b.setAttribute('aria-current', 'true'); else b.removeAttribute('aria-current')
      })
      N.grp.forEach((g) => { const on = g.e === e; g.br.classList.toggle('on', on); g.gn?.classList.toggle('on', on) })
      N.nav.dataset.live = c.current ? '1' : '0'
      if (N.now) {
        const grouped = e.kind === 'group'
        N.ee.hidden = N.sep.hidden = !grouped
        N.ee.textContent = e.name
        N.cn.textContent = cname(e, c)
        N.ct.textContent = `${i + 1} of ${n}`
        N.lv.hidden = !c.current
        N.now.classList.toggle('live', c.current)
      }
    }
  }
  const setPast = (p) => {
    pastN = p
    navs.forEach((N) => N.stops.forEach((b, k) => b.classList.toggle('past', k < p)))
  }

  const unsub = subscribe(({ q, idx: i }) => {
    target = (q + 0.5) / n
    if (!started || reduce) { cur = target; lag = 0; started = true; draw() } else kick()
    if (i !== idx) setIdx(i)
    const p = Math.min(n, Math.floor(q + 0.001) + 1)
    if (p !== pastN) setPast(p)
  })

  return () => {
    unsub()
    cancelAnimationFrame(raf)
    ro.disconnect()
    navs.forEach((N) => { N.host.removeEventListener('click', onClick); N.host.innerHTML = '' })
  }
}
