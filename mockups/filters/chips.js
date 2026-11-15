// Filter: compact chip bar. One line collapsed (top 10 + "+N more"), wraps + search when expanded.
// Chip count = results you'd get with that chip on; chips that would give 0 are dimmed, not hidden.
import { esc } from '../lib/data.js'
import { icon } from '../lib/icons.js'

export const id = 'chips'

const S = '.pj-wrap.f-chips'
export const css = `
${S}{--cb-h:34px;--cb-pad:6px;--cb-gap:6px;grid-template-columns:minmax(0,1fr)}
${S} .pj-filter{min-width:0}
${S} .cb{display:grid;grid-template-columns:minmax(0,1fr);gap:0;min-width:0}
${S} .cb-tools{display:grid;grid-template-rows:0fr;visibility:hidden;transition:grid-template-rows .55s var(--ease),visibility 0s .55s}
${S} .cb[data-open] .cb-tools{grid-template-rows:1fr;visibility:visible;transition-delay:0s}
${S} .cb-tools>div{min-height:0;overflow:hidden}
${S} .cb-find{display:flex;align-items:center;gap:14px;padding:4px 4px 14px;opacity:0;transform:translateY(-4px);transition:opacity .45s var(--ease),transform .55s var(--ease)}
${S} .cb[data-open] .cb-find{opacity:1;transform:none;transition-delay:.08s}
${S} .cb-q{position:relative;flex:1 1 auto;min-width:0;max-width:340px;display:flex;align-items:center}
${S} .cb-q::after{content:"";position:absolute;left:0;right:0;bottom:0;height:1px;background:var(--accent);transform:scaleX(0);transform-origin:left;transition:transform .5s var(--ease)}
${S} .cb-q:focus-within::after{transform:scaleX(1)}
${S} .cb-input{width:100%;min-width:0;padding:9px 0 9px 0;background:none;border:0;border-bottom:1px solid var(--rule);border-radius:0;color:var(--fg);font:inherit;font-size:.8rem;outline:none}
${S} .cb-input::placeholder{color:var(--muted);opacity:.8}
${S} .cb-hits{flex:none;font-size:.7rem;color:var(--muted);font-variant-numeric:tabular-nums}

${S} .cb-row{display:flex;align-items:flex-start;gap:10px}
${S} .cb-vp{position:relative;box-sizing:border-box;flex:1 1 0;min-width:0;margin:calc(var(--cb-pad)*-1);padding:var(--cb-pad);height:calc(var(--cb-h) + var(--cb-pad)*2);overflow:hidden;transition:height .6s var(--ease)}
${S} .cb[data-open]:not([data-busy]) .cb-vp{overflow:visible}
${S} .cb-chips{display:flex;flex-wrap:wrap;gap:var(--cb-gap)}
${S} .cb-chip{position:relative;flex:none;display:inline-flex;align-items:center;gap:7px;height:var(--cb-h);padding:0 10px;border:1px solid var(--rule);border-radius:0;background:none;color:var(--muted);font:inherit;font-size:.74rem;line-height:1;white-space:nowrap;cursor:pointer;--ti-size:15px;transition:border-color .35s var(--ease),color .35s var(--ease),background .35s var(--ease),box-shadow .45s var(--ease),opacity .4s var(--ease)}
${S} .cb-chip .ti{color:var(--muted)}
${S} .cb-chip::after{content:"";position:absolute;left:-1px;right:-1px;bottom:-1px;height:2px;background:var(--accent);transform:scaleX(0);transform-origin:left;transition:transform .55s var(--ease)}
${S} .cb-n{font-size:.66rem;color:var(--muted);opacity:.85;font-variant-numeric:tabular-nums;min-width:1.1ch;text-align:right;transition:color .35s var(--ease)}
${S} .cb-chip:hover{border-color:rgb(230 224 212/.45);color:var(--fg)}
${S} .cb-chip:hover .ti{color:var(--fg)}
${S} .cb-chip[aria-pressed=true]{border-color:var(--accent);color:var(--accent);background:rgb(255 140 43/.06);box-shadow:0 0 16px -4px rgb(255 140 43/.45),inset 0 0 12px -6px rgb(255 140 43/.4)}
${S} .cb-chip[aria-pressed=true] .ti{color:var(--accent);filter:drop-shadow(0 0 4px rgb(255 140 43/.55))}
${S} .cb-chip[aria-pressed=true] .cb-n{color:var(--accent)}
${S} .cb-chip[aria-pressed=true]::after{transform:scaleX(1)}
${S} .cb-chip[data-zero]:not([aria-pressed=true]){opacity:.42}
${S} .cb-chip[data-zero]:not([aria-pressed=true]):hover{opacity:.7}
${S} .cb-chip[hidden]{display:none}
${S} .cb:not([data-open]):not([data-busy]) .cb-chip[data-x]:not([aria-pressed=true]){display:none}
${S} .cb:not([data-open]):not([data-busy]) .cb-chip[data-off]{visibility:hidden}
${S} .cb-empty{display:none;padding:10px 2px;font-size:.76rem;color:var(--muted)}
${S} .cb[data-none] .cb-empty{display:block}

${S} .cb-more{flex:none;position:relative;display:inline-flex;align-items:center;gap:8px;height:var(--cb-h);padding:0 14px;border:1px dashed rgb(255 140 43/.55);border-radius:0;background:none;color:var(--accent);font:inherit;font-size:.74rem;line-height:1;white-space:nowrap;cursor:pointer;transition:background .35s var(--ease),border-color .35s var(--ease),color .35s var(--ease)}
${S} .cb-more:hover{background:rgb(255 140 43/.08);border-style:solid;border-color:var(--accent)}
${S} .cb-more-i{width:9px;height:9px;position:relative;flex:none}
${S} .cb-more-i::before,${S} .cb-more-i::after{content:"";position:absolute;left:0;right:0;top:50%;height:1px;background:currentColor;transition:transform .5s var(--ease)}
${S} .cb-more-i::after{transform:rotate(90deg)}
${S} .cb[data-open] .cb-more-i::after{transform:rotate(0)}
${S} .cb[data-open] .cb-mw{display:none}
${S} .cb-dot{width:6px;height:6px;border-radius:50%;background:var(--accent);box-shadow:0 0 8px var(--accent)}
${S} .cb-dot[hidden]{display:none}

@media (max-width:640px){
  ${S}{--cb-h:40px}
  ${S} .cb-vp{--fl:0px;--fr:0px}
  ${S} .cb:not([data-open]) .cb-vp{overflow-x:auto;overflow-y:hidden;scrollbar-width:none;overscroll-behavior-x:contain;-webkit-mask-image:linear-gradient(90deg,transparent,#000 var(--fl),#000 calc(100% - var(--fr)),transparent);mask-image:linear-gradient(90deg,transparent,#000 var(--fl),#000 calc(100% - var(--fr)),transparent)}
  ${S} .cb:not([data-open]) .cb-vp::-webkit-scrollbar{display:none}
  ${S} .cb:not([data-open]) .cb-chips{flex-wrap:nowrap;width:max-content}
  ${S} .cb:not([data-open]) .cb-mw{display:none}
  ${S} .cb:not([data-open]) .cb-more{padding:0 12px}
  ${S} .cb[data-open] .cb-row{flex-direction:column;align-items:flex-start;gap:12px}
  ${S} .cb[data-open] .cb-vp{align-self:stretch;flex:none;order:2;margin-top:calc(var(--cb-pad)*-1 - 0px)}
  ${S} .cb[data-open] .cb-more{order:1}
  ${S} .cb-find{padding-bottom:12px}
  ${S} .cb-input{font-size:16px;padding:10px 0}
  ${S} .cb-q{max-width:none}
}
@media (prefers-reduced-motion:reduce){
  ${S} .cb *,${S} .cb *::after{transition-duration:.01ms!important;transition-delay:0s!important}
}
`

const TOP = 10

export function mount(ctx) {
  const { host, techs } = ctx
  const total = techs.length
  host.innerHTML = `<div class="cb" role="group" aria-label="Filter by technology">
  <div class="cb-tools" id="cb-tools"><div><div class="cb-find">
    <label class="cb-q"><span class="cb-sr" style="position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0)">Find tech</span><input class="cb-input" type="text" inputmode="search" enterkeyhint="search" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="find tech" aria-controls="cb-chips" tabindex="-1"></label>
    <span class="cb-hits" aria-live="polite"></span>
  </div></div></div>
  <div class="cb-row">
    <div class="cb-vp"><div class="cb-chips" id="cb-chips">${techs.map((t, i) => `<button type="button" class="cb-chip" data-k="${esc(t.key)}"${i >= TOP ? ' data-x' : ''} aria-pressed="false"><span aria-hidden="true">${icon(t.name)}</span><span class="cb-t">${esc(t.name)}</span><span class="cb-n">${t.count}</span></button>`).join('')}</div></div>
    <button type="button" class="cb-more" aria-expanded="false" aria-controls="cb-tools"><span class="cb-more-i" aria-hidden="true"></span><span class="cb-more-t"></span><span class="cb-mw">more</span><span class="cb-dot" hidden aria-hidden="true"></span></button>
  </div>
  <p class="cb-empty" role="status">No tech matches.</p>
</div>`
  const $ = (s) => host.querySelector(s)
  const root = $('.cb'), vp = $('.cb-vp'), input = $('.cb-input'), hits = $('.cb-hits'), more = $('.cb-more'), moreT = $('.cb-more-t'), dot = $('.cb-dot')
  const chips = new Map([...host.querySelectorAll('.cb-chip')].map((c) => [c.dataset.k, c]))
  const reduce = matchMedia('(prefers-reduced-motion: reduce)')
  let open = false, busy = null, query = '', label = `+${Math.max(0, total - TOP)}`

  // ---- state render --------------------------------------------------
  const render = (sel, vis) => {
    const set = new Set(vis)
    for (const t of techs) {
      const c = chips.get(t.key), on = sel.has(t.key)
      const n = on ? vis.length : t.projects.reduce((a, p) => a + (set.has(p) ? 1 : 0), 0)
      c.setAttribute('aria-pressed', String(on))
      c.toggleAttribute('data-zero', n === 0)
      c.querySelector('.cb-n').textContent = n
      c.setAttribute('aria-label', `${t.name}, ${n} project${n === 1 ? '' : 's'}`)
    }
    measure()
  }

  // ---- collapsed-mode measurement ----------------------------------
  // Chips that wrap off the first line (desktop) are hidden + the "+N more" count is derived from what is actually visible.
  const measure = () => {
    if (open || busy) return
    let shown = 0, offSel = 0, top = null
    for (const c of chips.values()) {
      c.removeAttribute('data-off')
      if (c.offsetParent === null) continue
      if (top === null) top = c.offsetTop
      if (c.offsetTop > top + 4) { c.setAttribute('data-off', ''); if (c.getAttribute('aria-pressed') === 'true') offSel++ } else shown++
    }
    label = `+${total - shown}`
    if (!open) moreT.textContent = label
    dot.hidden = !offSel
    edges()
  }
  const edges = () => {
    if (open) return
    const max = vp.scrollWidth - vp.clientWidth
    vp.style.setProperty('--fl', max > 1 && vp.scrollLeft > 4 ? '28px' : '0px')
    vp.style.setProperty('--fr', max > 1 && vp.scrollLeft < max - 4 ? '28px' : '0px')
  }

  // ---- animated height ---------------------------------------------
  const settle = (done) => {
    let fin = false
    const end = () => {
      if (fin) return
      fin = true
      vp.removeEventListener('transitionend', onEnd)
      clearTimeout(timer)
      busy = null
      root.removeAttribute('data-busy')
      done()
    }
    const onEnd = (e) => e.target === vp && e.propertyName === 'height' && end()
    const timer = setTimeout(end, 900)
    vp.addEventListener('transitionend', onEnd)
    busy = end
    root.setAttribute('data-busy', '')
  }
  const grow = () => {
    busy?.()
    const from = vp.offsetHeight
    vp.style.height = 'auto'
    const to = vp.offsetHeight
    vp.style.height = from + 'px'
    vp.offsetHeight // reflow
    settle(() => { vp.style.height = open ? 'auto' : '' ; if (!open) measure() })
    vp.style.height = to + 'px'
  }
  const setOpen = (on) => {
    if (on === open) return
    busy?.()
    open = on
    root.toggleAttribute('data-open', on)
    more.setAttribute('aria-expanded', String(on))
    moreT.textContent = on ? 'Show less' : label
    input.tabIndex = on ? 0 : -1
    vp.scrollLeft = 0
    if (on) {
      for (const c of chips.values()) c.removeAttribute('data-off')
      vp.style.setProperty('--fl', '0px'); vp.style.setProperty('--fr', '0px')
      dot.hidden = true
      grow()
    } else {
      if (query) { query = ''; input.value = ''; filter() }
      const from = vp.offsetHeight
      vp.style.height = from + 'px'
      vp.offsetHeight
      settle(() => { vp.style.height = ''; measure() })
      vp.style.height = ''
    }
  }

  // ---- search --------------------------------------------------------
  function filter() {
    const q = query.trim().toLowerCase()
    let n = 0
    const sel = ctx.selected()
    for (const t of techs) {
      const hit = !q || t.name.toLowerCase().includes(q) || t.key.includes(q)
      const c = chips.get(t.key)
      const show = hit || sel.has(t.key)
      c.hidden = !show
      if (hit) n++
    }
    hits.textContent = q ? (n ? `${n} / ${total}` : 'no match') : ''
    root.toggleAttribute('data-none', !!q && !n)
    if (open) grow()
  }

  // ---- events --------------------------------------------------------
  const onClick = (e) => {
    const c = e.target.closest('.cb-chip')
    if (c) return ctx.toggle(c.dataset.k)
    if (e.target.closest('.cb-more')) setOpen(!open)
  }
  const onInput = () => { query = input.value; filter() }
  const onKey = (e) => {
    if (e.key !== 'Escape') return
    if (query) { e.preventDefault(); e.stopPropagation(); input.value = ''; query = ''; filter() }
    else if (open) { e.preventDefault(); e.stopPropagation(); setOpen(false); more.focus() }
  }
  root.addEventListener('click', onClick)
  input.addEventListener('input', onInput)
  input.addEventListener('keydown', onKey)
  vp.addEventListener('scroll', edges, { passive: true })
  const ro = new ResizeObserver(() => { if (!open && !busy) measure() })
  ro.observe(vp)

  const unsub = ctx.subscribe((sel, vis) => { render(sel, vis); if (query) filter() })
  moreT.textContent = label
  measure()
  document.fonts?.ready.then(() => measure())

  return () => {
    unsub(); ro.disconnect(); busy?.()
    root.removeEventListener('click', onClick)
    host.replaceChildren()
  }
}
