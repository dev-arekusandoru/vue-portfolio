import { esc, reduce, range, dur, grpMeta } from '../lib/data.js'

export const id = 'marker'

const R = '.xv-monolith.rail-marker'

export const css = `
${R}{--g:56px}

/* ---------- shared: segmented rule ---------- */
${R} .mk :where(button){font:inherit;color:inherit;background:none;border:0;padding:0;margin:0;cursor:pointer;text-align:left;-webkit-tap-highlight-color:transparent}
${R} .mk :where(button):focus-visible{outline:2px solid var(--accent);outline-offset:3px}
${R} .mk-track{display:flex;gap:10px;pointer-events:none}
${R} .mk-grp{position:relative;display:flex;gap:3px}
${R} .mk-grp.multi::before{content:'';position:absolute;border:1px solid var(--accent);opacity:.55}
${R} .mk-seg{position:relative;flex:1 1 0;min-height:0;min-width:0;background:color-mix(in srgb,var(--muted) 38%,transparent)}
${R} .mk-seg::before{content:'';position:absolute;background:var(--muted);opacity:.7}
${R} .mk-fill{position:absolute;inset:0;background:var(--accent);opacity:0;transform:scale(0);transform-origin:top left;will-change:transform}
${R} .mk-seg.done .mk-fill{opacity:.5}
${R} .mk-seg.on .mk-fill{opacity:1;box-shadow:0 0 10px color-mix(in srgb,var(--accent) 70%,transparent)}
${R} .mk-seg.live .mk-fill{background:var(--blue)}
${R} .mk-seg.on.live .mk-fill{box-shadow:0 0 10px color-mix(in srgb,var(--blue) 75%,transparent);animation:mk-pulse 2.6s ease-in-out infinite}
${R} .mk-seg.on{background:color-mix(in srgb,var(--accent) 55%,transparent)}
${R} .mk-seg.on.live{background:color-mix(in srgb,var(--blue) 55%,transparent)}
${R} .mk-seg.on::before{opacity:1;background:var(--fg)}
@keyframes mk-pulse{0%,100%{opacity:1}50%{opacity:.72}}

/* label / text layers cross-fade */
${R} .mk-stack{display:grid;min-width:0}
${R} .mk-lay{grid-area:1/1;min-width:0;opacity:0;transform:translateY(4px);transition:opacity .38s var(--ease),transform .38s var(--ease);pointer-events:none}
${R} .mk-lay.is-on{opacity:1;transform:none;pointer-events:auto}
${R} .mk-co{font-family:var(--display);font-weight:200;font-size:.82rem;letter-spacing:.04em;color:var(--fg);line-height:1.25}
${R} .mk-ti{font-family:var(--mono);font-weight:300;font-size:.7rem;color:var(--muted);line-height:1.45}
${R} .mk-me{font-family:var(--mono);font-weight:300;font-size:.7rem;color:var(--muted);line-height:1.45}
${R} .mk-lv{color:var(--blue)}
${R} .mk-lv::before{content:'';display:inline-block;width:5px;height:5px;border-radius:50%;background:var(--blue);margin-right:6px;vertical-align:1px;animation:mk-pulse 2.6s ease-in-out infinite}

/* ---------- popover list (both containers) ---------- */
${R} .mk-pop{background:rgba(8,10,12,.97);border:1px solid var(--rule);visibility:hidden;opacity:0;transition:opacity .28s var(--ease),transform .28s var(--ease),visibility 0s .28s;overflow-y:auto;overscroll-behavior:contain}
${R} .mk.open .mk-pop{visibility:visible;opacity:1;transform:none;transition:opacity .28s var(--ease),transform .28s var(--ease)}
${R} .mk-eh{display:flex;flex-direction:column;gap:2px;padding:12px 16px 6px;font-family:var(--mono);font-weight:300;font-size:.7rem;color:var(--muted)}
${R} .mk-eh b{font-weight:300;font-family:var(--display);font-size:.78rem;letter-spacing:.04em;color:var(--accent)}
${R} .mk-grpl{margin-left:16px;border-left:1px solid var(--accent)}
${R} .mk-it{display:flex;flex-direction:column;justify-content:center;gap:1px;width:100%;min-height:44px;padding:6px 16px;box-sizing:border-box;position:relative;transition:background .25s var(--ease)}
${R} .mk-it:hover{background:rgba(255,255,255,.05)}
${R} .mk-it[aria-current="true"]{background:rgba(255,140,43,.09)}
${R} .mk-it.live[aria-current="true"]{background:rgba(90,209,230,.09)}
${R} .mk-it[aria-current="true"]::before{content:'';position:absolute;left:0;top:6px;bottom:6px;width:2px;background:var(--accent)}
${R} .mk-it.live[aria-current="true"]::before{background:var(--blue)}
${R} .mk-it:focus-visible{outline-offset:-3px !important}
${R} .mk-it .mk-co{font-size:.78rem}

/* ---------- desktop ---------- */
${R} .mk-d{position:sticky;--h:min(60svh,460px);top:calc((100svh - var(--h)) / 2);height:var(--h);z-index:5}
${R} .mk-d .mk-tog{position:absolute;left:0;top:-14px;bottom:-14px;width:44px;z-index:2}
${R} .mk-d .mk-tog:focus-visible{outline-offset:-2px}
${R} .mk-d .mk-track{position:absolute;left:22px;top:0;bottom:0;flex-direction:column}
${R} .mk-d .mk-grp{flex-direction:column}
${R} .mk-d .mk-grp.multi::before{left:-9px;top:0;bottom:0;width:4px;border-right:0}
${R} .mk-d .mk-seg{width:2px}
${R} .mk-d .mk-seg::before{left:0;top:0;width:6px;height:1px}
${R} .mk-d .mk-seg.on::before{width:10px}
${R} .mk-d .mk-seg.on{width:2px}
${R} .mk-lab{position:absolute;right:calc(100% - 4px);top:0;width:136px;pointer-events:none;z-index:1;transition:opacity .25s var(--ease);will-change:transform;text-align:right}
${R} .mk.open .mk-lab{opacity:0}
${R} .mk-lab .mk-lay{padding:2px 0}
${R} .mk-lab .mk-full{display:none}
${R} .mk-lab .mk-short{display:block}
@media (min-width:1400px){${R} .mk-lab .mk-full{display:block}${R} .mk-lab .mk-short{display:none}}
${R} .mk-lab .mk-eg{color:var(--accent)}
${R} .mk-lab .mk-me:not(.mk-eg){white-space:nowrap}
${R} .mk-d .mk-pop{position:absolute;left:44px;top:50%;width:min(380px,calc(100vw - 44px - var(--g) - 24px));max-height:min(78svh,640px);transform:translateY(-50%) translateX(-6px);z-index:3;box-shadow:0 20px 60px rgba(0,0,0,.6)}
${R} .mk-d.open .mk-pop{transform:translateY(-50%)}
${R} .mk-d .mk-pop::after{content:'';display:block;height:8px}

/* ---------- mobile bar ---------- */
${R} .mk-m{position:relative;margin-inline:-20px;background:rgba(8,10,12,.97);border-top:1px solid var(--rule)}
${R} .mk-m .mk-tog{display:block;width:100%;box-sizing:border-box;padding:12px 20px 8px;min-height:44px}
${R} .mk-m .mk-track{flex-direction:row;gap:8px;margin-bottom:9px;height:2px;pointer-events:none}
${R} .mk-m .mk-grp{flex-direction:row}
${R} .mk-m .mk-grp.multi::before{top:-6px;left:0;right:0;height:3px;border-bottom:0}
${R} .mk-m .mk-seg{height:2px}
${R} .mk-m .mk-seg::before{display:none}
${R} .mk-m .mk-row{display:flex;align-items:center;gap:12px}
${R} .mk-m .mk-stack{flex:1}
${R} .mk-m .mk-lay .mk-co,${R} .mk-m .mk-lay .mk-ti,${R} .mk-m .mk-lay .mk-me{white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
${R} .mk-m .mk-co{font-size:.74rem}
${R} .mk-m .mk-me{font-size:.7rem}
${R} .mk-chev{flex:none;width:12px;height:12px;position:relative;opacity:.8;transition:transform .35s var(--ease)}
${R} .mk-chev::before{content:'';position:absolute;inset:2px 2px auto 2px;height:7px;border-left:1px solid var(--fg);border-top:1px solid var(--fg);transform:translateY(2px) rotate(45deg) scale(.8)}
${R} .mk-m.open .mk-chev{transform:rotate(180deg)}
${R} .mk-m .mk-pop{position:absolute;left:0;right:0;bottom:100%;max-height:min(64svh,560px);transform:translateY(8px);border-width:1px 0}
${R} .mk-m .mk-it{padding-inline:20px}
${R} .mk-m .mk-eh{padding-inline:20px}
${R} .mk-m .mk-grpl{margin-left:20px}

@media (prefers-reduced-motion:reduce){
  ${R} .mk-lay,${R} .mk-pop,${R} .mk-chev{transition:none}
  ${R} .mk-seg.on.live .mk-fill,${R} .mk-lv::before{animation:none}
  ${R} .mk-pop{transform:none !important}
  ${R} .mk-d .mk-pop{transform:translateY(-50%) !important}
}
`

let uid = 0

export function mount(ctx) {
  const { gut, bar, flat, n, goTo, subscribe } = ctx
  if (!n) return () => {}
  const label = (f) => {
    const { e, c, ci } = f
    return `${esc(c.co)}, ${esc(c.title)}, ${esc(range(c))}${c.current ? ', current' : ''}`
  }

  /* ---- shared markup ---- */
  const grouped = []
  for (const f of flat) {
    const last = grouped[grouped.length - 1]
    if (last && last.e === f.e) last.items.push(f)
    else grouped.push({ e: f.e, items: [f] })
  }
  const trackHTML = () =>
    `<span class="mk-track" aria-hidden="true">${grouped.map((g) => `<span class="mk-grp${g.items.length > 1 ? ' multi' : ''}" style="flex:${g.items.length} 1 0">${g.items.map((f) => `<span class="mk-seg${f.c.current ? ' live' : ''}"><span class="mk-fill"></span></span>`).join('')}</span>`).join('')}</span>`

  const itemHTML = (f) =>
    `<button type="button" class="mk-it${f.c.current ? ' live' : ''}" data-i="${f.i}" aria-label="${label(f)}"><span class="mk-co">${esc(f.c.co)}</span><span class="mk-ti">${esc(f.c.title)}</span><span class="mk-me${f.c.current ? ' mk-lv' : ''}">${esc(range(f.c))} · ${esc(dur(f.c.start, f.c.end))}${f.c.current ? ' · current' : ''}</span></button>`
  const listHTML = () =>
    grouped.map((g) => (g.e.kind === 'group' && g.items.length > 1
      ? `<div class="mk-eh"><b>${esc(g.e.name)}</b><span>${esc(grpMeta(g.e))}</span></div><div class="mk-grpl">${g.items.map(itemHTML).join('')}</div>`
      : g.items.map(itemHTML).join(''))).join('')

  const caption = (f) => {
    const { e, c, ci } = f
    const multi = e.contracts.length > 1
    return `<span class="mk-short mk-me${c.current ? ' mk-lv' : ''}">${f.i + 1}/${n}</span><span class="mk-full"><span class="mk-co" style="display:block">${esc(c.co)}</span><span class="mk-ti" style="display:block">${esc(c.title)}</span><span class="mk-me${c.current ? ' mk-lv' : ''}" style="display:block">${c.current ? 'current · ' : ''}${f.i + 1} of ${n}</span>${multi ? `<span class="mk-me mk-eg" style="display:block">${esc(e.name)} · contract ${ci + 1} of ${e.contracts.length}</span>` : ''}</span>`
  }
  const mobCaption = (f) => {
    const { e, c, ci } = f
    const multi = e.contracts.length > 1
    return `<span class="mk-co" style="display:block">${esc(c.co)} <span style="color:var(--muted)">· ${esc(c.title)}</span></span><span class="mk-me${c.current ? ' mk-lv' : ''}" style="display:block">${c.current ? 'current · ' : ''}${f.i + 1} of ${n}${multi ? ` · ${esc(e.name)} ${ci + 1}/${e.contracts.length}` : ''}</span>`
  }
  const aria = (f) => `Experience timeline, ${f.i + 1} of ${n}: ${label(f)}. Show all contracts`

  const cleanups = []
  const views = []

  function build(host, mode) {
    const pid = `mk-pop-${++uid}`
    const d = mode === 'd'
    host.innerHTML = `<nav class="mk mk-${mode}" aria-label="Experience timeline">${
      d
        ? `<button type="button" class="mk-tog" aria-expanded="false" aria-controls="${pid}" aria-label="${esc(aria(flat[0]))}">${trackHTML()}</button><div class="mk-lab mk-stack" aria-hidden="true"><div class="mk-lay is-on"></div><div class="mk-lay"></div></div><div class="mk-pop" id="${pid}">${listHTML()}</div>`
        : `<div class="mk-pop" id="${pid}">${listHTML()}</div><button type="button" class="mk-tog" aria-expanded="false" aria-controls="${pid}" aria-label="${esc(aria(flat[0]))}">${trackHTML()}<span class="mk-row"><span class="mk-stack"><span class="mk-lay is-on"></span><span class="mk-lay"></span></span><span class="mk-chev" aria-hidden="true"></span></span></button>`
    }</nav>`
    const nav = host.firstElementChild
    const tog = nav.querySelector('.mk-tog')
    const pop = nav.querySelector('.mk-pop')
    const segs = [...nav.querySelectorAll('.mk-seg')]
    const fills = segs.map((s) => s.firstElementChild)
    const items = [...nav.querySelectorAll('.mk-it')]
    const lays = [...nav.querySelectorAll('.mk-lay')]
    const lab = nav.querySelector('.mk-lab')
    let pinned = false, hoverT = 0, cur = -1, layI = 0
    let centers = [], lastY = null
    const lastFill = new Array(n).fill(-1)

    const setOpen = (v) => {
      if (nav.classList.contains('open') === v) return
      nav.classList.toggle('open', v)
      tog.setAttribute('aria-expanded', String(v))
      if (!v) pinned = false
    }
    const close = (refocus) => {
      clearTimeout(hoverT)
      const hadFocus = nav.contains(document.activeElement)
      setOpen(false)
      if (refocus && hadFocus) tog.focus()
    }
    tog.addEventListener('click', () => {
      clearTimeout(hoverT)
      if (!nav.classList.contains('open')) { setOpen(true); pinned = true; return }
      if (!pinned && d) { pinned = true; return }
      close(false)
    })
    pop.addEventListener('click', (ev) => {
      const b = ev.target.closest('.mk-it')
      if (!b) return
      const i = +b.dataset.i
      close(false)
      goTo(i)
    })
    const onKey = (ev) => {
      if (ev.key === 'Escape' && nav.classList.contains('open')) { ev.stopPropagation(); close(true) }
    }
    nav.addEventListener('keydown', onKey)
    const onDown = (ev) => { if (nav.classList.contains('open') && !nav.contains(ev.target)) close(false) }
    document.addEventListener('pointerdown', onDown)
    const onFocusOut = (ev) => {
      if (nav.classList.contains('open') && ev.relatedTarget && !nav.contains(ev.relatedTarget)) close(false)
    }
    nav.addEventListener('focusout', onFocusOut)
    if (d) {
      nav.addEventListener('pointerenter', (ev) => { if (ev.pointerType === 'mouse') { clearTimeout(hoverT); setOpen(true) } })
      nav.addEventListener('pointerleave', (ev) => {
        if (ev.pointerType !== 'mouse' || pinned) return
        clearTimeout(hoverT)
        hoverT = setTimeout(() => setOpen(false), 220)
      })
      tog.addEventListener('focus', () => { if (tog.matches(':focus-visible')) setOpen(true) })
    }

    let ro
    if (d) {
      const measure = () => {
        centers = segs.map((s) => s.parentElement.offsetTop + s.offsetTop + s.offsetHeight / 2)
        lastY = null
        if (last) place(last.q)
      }
      ro = new ResizeObserver(measure)
      ro.observe(host)
      ro.observe(tog)
      requestAnimationFrame(measure)
    }
    let last = null
    function place(q) {
      if (!lab || !centers.length) return
      const j = Math.min(n - 1, Math.floor(q + 1e-3))
      const t = j >= n - 1 ? 0 : Math.max(0, Math.min(1, q - j))
      const y = j >= n - 1 ? centers[n - 1] : centers[j] + (centers[j + 1] - centers[j]) * t
      const r = Math.round(y * 10) / 10
      if (r === lastY) return
      lastY = r
      lab.style.transform = `translateY(${r}px) translateY(-50%)`
    }

    function update(st) {
      last = st
      const { q, idx } = st
      for (let k = 0; k < n; k++) {
        let p = Math.max(0, Math.min(1, q - k))
        if (k === n - 1 && q > n - 1 - 1e-3) p = 1
        if (p < 0.004) p = 0
        const rp = reduce ? Math.round(p) : Math.round(p * 500) / 500
        if (rp !== lastFill[k]) {
          lastFill[k] = rp
          fills[k].style.transform = d ? `scaleY(${rp})` : `scaleX(${rp})`
        }
        segs[k].classList.toggle('done', lastFill[k] >= 1 && k !== idx)
        segs[k].classList.toggle('on', k === idx)
      }
      if (d) place(q)
      if (idx !== cur) {
        cur = idx
        const f = flat[idx]
        const next = lays[1 - layI]
        next.innerHTML = d ? caption(f) : mobCaption(f)
        lays[layI].classList.remove('is-on')
        next.classList.add('is-on')
        layI = 1 - layI
        tog.setAttribute('aria-label', aria(f))
        items.forEach((b) => (+b.dataset.i === idx ? b.setAttribute('aria-current', 'true') : b.removeAttribute('aria-current')))
      }
    }
    // done-class must follow idx change too (segment k=idx is never "done")
    cleanups.push(() => {
      clearTimeout(hoverT)
      ro?.disconnect()
      document.removeEventListener('pointerdown', onDown)
      host.innerHTML = ''
    })
    views.push(update)
  }

  if (gut) {
    build(gut, 'd')
  }
  if (bar) build(bar, 'm')

  const unsub = subscribe((st) => views.forEach((u) => u(st)))
  return () => {
    unsub?.()
    cleanups.forEach((fn) => fn())
  }
}
