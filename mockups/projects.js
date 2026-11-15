// Projects page. Exports css + mount(el, { projects, filter }).
//
// Layout the host element gets:
//   .pj-wrap.f-<filter.id>
//     .pj-filter   <- the filter module draws here
//     .pj-main
//       .pj-bar    (count + clear)
//       .pj-list   (rows)
//
// A filter module is { id, css, mount(ctx) -> unmount? }, where ctx is:
//   host            the .pj-filter element
//   projects        all projects (newest first)
//   techs           [{ key, name, count, projects:Project[] }] most-used first (count = projects)
//   selected()      Set<techKey> (AND semantics: a project must contain every selected tech)
//   toggle(key) / set(keys[]) / clear()
//   visible()       Project[] currently matching
//   coUse(key)      Map<techKey, number>: other techs used together with `key` and how many projects share them
//   subscribe(fn)   fn(selectedSet, visibleProjects) is called now and after every change; returns unsubscribe
import { esc, techKey, techName } from './lib/data.js'
import { icon } from './lib/icons.js'

const MAX_ICONS = 6
const year = (d) => d.getUTCFullYear()
const mon = (d) => d.toLocaleDateString('en-US', { month: 'short', year: 'numeric', timeZone: 'UTC' })
const period = (p) => `${mon(p.start)} – ${p.current ? 'Present' : p.end ? mon(p.end) : mon(p.start)}`
const link = (u, t) => `<a class="pj-lk" href="${esc(u)}" target="_blank" rel="noopener noreferrer">${t}<span aria-hidden="true"> ↗</span></a>`
const links = (p) => [p.demo_url && link(/^https?:/.test(p.demo_url) ? p.demo_url : `https://${p.demo_url}`, 'Demo'), p.code_url && link(p.code_url, 'Code')].filter(Boolean).join('')
const status = (p) => `<span class="pj-st ${p.status}">${p.status === 'active' ? 'Active' : 'Shipped'}</span>`
const art = (p) => `style="--a1:${p.pal[0]};--a2:${p.pal[1]};--a3:${p.pal[2]}"`

export const css = `
.pj-wrap{display:grid;gap:clamp(20px,3vw,36px)}
.pj-main{min-width:0}
.pj-bar{display:flex;justify-content:space-between;align-items:center;gap:12px;min-height:34px;margin-bottom:6px;font-size:.76rem;color:var(--muted)}
.pj-bar b{color:var(--fg);font-weight:400}
.pj-clear{padding:6px 10px;border:1px solid var(--rule);background:none;cursor:pointer;font-size:.72rem;color:var(--fg);transition:border-color .3s var(--ease),color .3s var(--ease),opacity .3s var(--ease)}
.pj-clear:hover{border-color:var(--accent);color:var(--accent)}
.pj-clear[hidden]{display:inline-block;visibility:hidden}

/* rows */
.pj-list{border-top:1px solid var(--rule)}
.pj{display:grid;grid-template-rows:1fr;border-bottom:1px solid var(--rule);transition:grid-template-rows .6s var(--ease),opacity .45s var(--ease),border-color .45s var(--ease)}
.pj>.pj-in{min-height:0;overflow:hidden}
.pj[data-hide]{grid-template-rows:0fr;opacity:0;border-bottom-color:transparent;pointer-events:none}
.pj-row{position:relative;display:grid;grid-template-columns:4.2rem minmax(0,1fr) auto 5.4rem 1.2rem;gap:6px 20px;align-items:center;width:100%;padding:24px 0;text-align:left;background:none;border:0;cursor:pointer;transition:background .5s var(--ease)}
.pj-row::before{content:"";position:absolute;left:-14px;top:0;bottom:0;width:2px;background:var(--accent);transform:scaleY(0);transition:transform .5s var(--ease)}
.pj-row:hover,.pj[data-open] .pj-row{background:rgb(255 140 43/.04)}
.pj-row:hover::before,.pj[data-open] .pj-row::before{transform:scaleY(1)}
.pj-yr{font-size:.76rem;color:var(--muted)}
.pj-t{min-width:0;display:grid;gap:4px}
.pj-t h3{font:300 clamp(1.2rem,2.6vw,1.9rem)/1.15 var(--display);letter-spacing:.05em;transition:color .4s var(--ease)}
.pj-row:hover h3,.pj[data-open] h3{color:var(--accent)}
.pj-hl{font-size:.82rem;color:var(--muted);max-width:62ch}
.pj-ic{display:flex;align-items:center;gap:14px;color:var(--fg);opacity:.78;--ti-size:22px}
.pj-ic .ti{transition:color .35s var(--ease),opacity .35s var(--ease)}
.pj-ic .ti[data-hit]{color:var(--accent);opacity:1;filter:drop-shadow(0 0 6px rgb(255 140 43/.55))}
.pj-more-n{font-size:.72rem;color:var(--muted)}
.pj-st{display:inline-flex;align-items:center;font-size:.74rem;color:var(--muted)}
.pj-st::before{content:"";width:7px;height:7px;border-radius:50%;margin-right:8px;border:1px solid var(--muted)}
.pj-st.active{color:var(--fg)}
.pj-st.active::before{border:0;background:var(--blue);box-shadow:0 0 8px var(--blue);animation:pulse 2.4s ease-in-out infinite}
.pj-ch{position:relative;width:12px;height:12px;justify-self:end}
.pj-ch::before,.pj-ch::after{content:"";position:absolute;left:0;right:0;top:50%;height:1px;background:var(--accent);transition:transform .5s var(--ease)}
.pj-ch::after{transform:rotate(90deg)}
.pj[data-open] .pj-ch::after{transform:rotate(0)}

/* expanded */
.pj-more{display:grid;grid-template-rows:0fr;transition:grid-template-rows .65s var(--ease)}
.pj[data-open] .pj-more{grid-template-rows:1fr}
.pj-more>div{min-height:0;overflow:hidden}
.pj-x{display:grid;grid-template-columns:minmax(0,1.5fr) minmax(0,1fr);gap:clamp(20px,4vw,56px);padding:6px 0 30px calc(4.2rem + 20px);opacity:0;transform:translateY(-6px);transition:opacity .5s var(--ease),transform .6s var(--ease)}
.pj[data-open] .pj-x{opacity:1;transform:none;transition-delay:.12s}
.pj-pts{display:grid;gap:12px;font-size:.84rem}
.pj-pts li{display:grid;grid-template-columns:1.6rem 1fr}
.pj-pts li::before{content:"—";color:var(--accent)}
.pj-spec{display:grid;gap:8px;font-size:.78rem;align-content:start}
.pj-spec div{display:grid;grid-template-columns:5.2rem 1fr;gap:12px;padding-bottom:8px;border-bottom:1px solid var(--rule)}
.pj-spec dt{color:var(--muted)}
.pj-spec .pj-metric dd b{font:300 1.15rem/1.2 var(--display);letter-spacing:.04em;color:var(--accent);margin-right:8px}
.pj-tech{grid-column:1/-1;display:flex;flex-wrap:wrap;gap:10px 22px;margin-top:2px}
.pj-tech li{display:inline-flex;align-items:center;gap:9px;font-size:.74rem;color:var(--fg);--ti-size:20px}
.pj-tech .ti{color:var(--muted)}
.pj-act{grid-column:1/-1;display:flex;flex-wrap:wrap;gap:12px 22px;align-items:center}
.pj-lk{font-size:.8rem;color:var(--accent);text-underline-offset:5px;text-decoration-thickness:1px}
.pj-btn{padding:9px 16px;border:1px solid var(--accent);background:none;color:var(--accent);cursor:pointer;font-size:.78rem;transition:background .35s var(--ease),color .35s var(--ease)}
.pj-btn:hover{background:var(--accent);color:var(--bg)}

@media (max-width:899px){
  .pj-row{grid-template-columns:minmax(0,1fr) auto;grid-template-areas:"yr st" "t t" "ic ch";padding:22px 0;gap:8px 12px}
  .pj-yr{grid-area:yr}
  .pj-st{grid-area:st;justify-self:end}
  .pj-t{grid-area:t}
  .pj-ic{grid-area:ic;gap:12px;--ti-size:20px}
  .pj-ch{grid-area:ch}
  .pj-row::before{left:-10px}
  .pj-x{grid-template-columns:1fr;padding-left:0}
}

/* detail dialog */
.pj-dlg{position:fixed;inset:0;width:min(860px,100% - 24px);max-width:none;max-height:min(92dvh,900px);margin:auto;padding:0;border:1px solid var(--rule);background:var(--bg);color:var(--fg);font:300 .92rem/1.7 var(--mono);overflow:auto;overscroll-behavior:contain;opacity:0;transform:translateY(14px) scale(.985);transition:opacity .45s var(--ease),transform .6s var(--ease),overlay .6s allow-discrete,display .6s allow-discrete}
.pj-dlg[open]{opacity:1;transform:none}
@starting-style{.pj-dlg[open]{opacity:0;transform:translateY(14px) scale(.985)}}
.pj-dlg::backdrop{background:rgb(3 4 5/.78);backdrop-filter:blur(3px);opacity:0;transition:opacity .45s var(--ease),overlay .6s allow-discrete,display .6s allow-discrete}
.pj-dlg[open]::backdrop{opacity:1}
@starting-style{.pj-dlg[open]::backdrop{opacity:0}}
.pj-dlg::before,.pj-dlg::after{content:"";position:absolute;width:18px;height:18px;border:1px solid var(--accent);pointer-events:none;z-index:3}
.pj-dlg::before{top:-1px;left:-1px;border-right:0;border-bottom:0}
.pj-dlg::after{bottom:-1px;right:-1px;border-left:0;border-top:0}
.pj-dh{position:relative;isolation:isolate;overflow:hidden;padding:clamp(28px,5vw,48px) clamp(20px,4vw,40px) 28px;background:radial-gradient(circle at 25% 30%,var(--a1),transparent 60%),radial-gradient(circle at 85% 95%,var(--a3),transparent 52%),linear-gradient(160deg,var(--a2),#050607)}
.pj-dh::after{content:"";position:absolute;inset:0;background:linear-gradient(transparent 40%,var(--bg));z-index:-1}
.pj-dh .pj-k{font-size:.72rem;color:var(--fg);opacity:.8;display:flex;gap:14px;flex-wrap:wrap}
.pj-dh h2{font:200 clamp(1.8rem,5vw,3.2rem)/1.1 var(--display);letter-spacing:.06em;margin:14px 0 12px}
.pj-dh p{max-width:56ch;font-size:.9rem}
.pj-dx{position:absolute;top:14px;right:14px;width:38px;height:38px;border:1px solid var(--rule);background:rgb(8 10 12/.6);cursor:pointer;display:grid;place-items:center;z-index:2;transition:border-color .3s var(--ease)}
.pj-dx:hover{border-color:var(--accent)}
.pj-dx::before,.pj-dx::after{content:"";position:absolute;width:14px;height:1px;background:var(--fg);transform:rotate(45deg)}
.pj-dx::after{transform:rotate(-45deg)}
.pj-db{display:grid;grid-template-columns:minmax(0,1.5fr) minmax(0,1fr);gap:clamp(20px,4vw,48px);padding:8px clamp(20px,4vw,40px) 34px}
.pj-db h4{font-weight:400;font-size:.72rem;color:var(--muted);margin:0 0 12px;letter-spacing:.08em}
.pj-db section{display:grid;gap:12px;align-content:start;margin-bottom:22px}
.pj-db .pj-wide{grid-column:1/-1}
.pj-dn{display:flex;justify-content:space-between;gap:12px;padding:14px clamp(20px,4vw,40px);border-top:1px solid var(--rule);font-size:.76rem}
.pj-dn button{background:none;border:0;cursor:pointer;color:var(--muted);text-align:left;padding:6px 0;transition:color .3s var(--ease);max-width:45%}
.pj-dn button:hover:not(:disabled){color:var(--accent)}
.pj-dn button:disabled{opacity:.35;cursor:default}
.pj-dn button:last-child{text-align:right}
html.pj-lock{overflow:hidden}
@media (max-width:899px){.pj-db{grid-template-columns:1fr}.pj-dlg{max-height:96dvh}}
@media (prefers-reduced-motion:reduce){.pj,.pj-more,.pj-x,.pj-dlg,.pj-dlg::backdrop{transition-duration:.01ms!important}}
`

const iconsOf = (p, hit) => {
  const shown = p.stack.slice(0, MAX_ICONS), rest = p.stack.length - shown.length
  return shown.map(icon).join('') + (rest > 0 ? `<span class="pj-more-n" aria-label="${rest} more technologies">+${rest}</span>` : '')
}

const rowHTML = (p) => `
<article class="pj" data-id="${esc(p.id)}">
  <div class="pj-in">
    <button type="button" class="pj-row" aria-expanded="false" aria-controls="pj-${esc(p.id)}">
      <span class="pj-yr">${year(p.start)}</span>
      <span class="pj-t"><h3>${esc(p.name)}</h3><span class="pj-hl">${esc(p.headline)}</span></span>
      <span class="pj-ic" aria-label="Technologies">${iconsOf(p)}</span>
      ${status(p)}
      <span class="pj-ch" aria-hidden="true"></span>
    </button>
    <div class="pj-more" id="pj-${esc(p.id)}"><div><div class="pj-x">
      <ul class="pj-pts">${p.highlights.map((h) => `<li>${esc(h)}</li>`).join('')}</ul>
      <dl class="pj-spec">
        <div><dt>Kind</dt><dd>${esc(p.kind)}</dd></div>
        <div><dt>Role</dt><dd>${esc(p.role)}</dd></div>
        <div><dt>Period</dt><dd>${esc(period(p))}</dd></div>
        ${p.metric ? `<div class="pj-metric"><dt>Result</dt><dd><b>${esc(p.metric.value)}</b>${esc(p.metric.label)}</dd></div>` : ''}
      </dl>
      <ul class="pj-tech" aria-label="Full stack">${p.stack.map((s) => `<li>${icon(s)}<span>${esc(techName(s))}</span></li>`).join('')}</ul>
      <div class="pj-act">${links(p)}<button type="button" class="pj-btn" data-detail>Full details</button></div>
    </div></div></div>
  </div>
</article>`

/** Detail dialog: one per mount, content swapped per project. Prev/next walk the currently visible list. */
function dialog(root, getVisible) {
  const d = document.createElement('dialog')
  d.className = 'pj-dlg'
  d.setAttribute('aria-labelledby', 'pj-dt')
  root.append(d)
  let cur
  const fill = (p) => {
    cur = p
    const v = getVisible(), i = v.indexOf(p)
    const pv = v[i - 1], nx = v[i + 1]
    d.innerHTML = `
      <button type="button" class="pj-dx" aria-label="Close"></button>
      <header class="pj-dh" ${art(p)}>
        <div class="pj-k"><span>${esc(p.kind)}</span><span>${esc(period(p))}</span>${status(p)}</div>
        <h2 id="pj-dt">${esc(p.name)}</h2>
        <p>${esc(p.summary || p.headline)}</p>
      </header>
      <div class="pj-db">
        <section><h4>Highlights</h4><ul class="pj-pts">${p.highlights.map((h) => `<li>${esc(h)}</li>`).join('')}</ul></section>
        <section><h4>At a glance</h4><dl class="pj-spec">
          <div><dt>Role</dt><dd>${esc(p.role)}</dd></div>
          <div><dt>Kind</dt><dd>${esc(p.kind)}</dd></div>
          ${p.metric ? `<div class="pj-metric"><dt>Result</dt><dd><b>${esc(p.metric.value)}</b>${esc(p.metric.label)}</dd></div>` : ''}
        </dl></section>
        ${p.challenges ? `<section class="pj-wide"><h4>The hard part</h4><p>${esc(p.challenges)}</p></section>` : ''}
        <section class="pj-wide"><h4>Built with</h4><ul class="pj-tech">${p.stack.map((s) => `<li>${icon(s)}<span>${esc(techName(s))}</span></li>`).join('')}</ul></section>
        ${links(p) ? `<div class="pj-act pj-wide">${links(p)}</div>` : ''}
      </div>
      <nav class="pj-dn" aria-label="Project navigation">
        <button type="button" data-nav="${pv ? i - 1 : ''}" ${pv ? '' : 'disabled'}>${pv ? `← ${esc(pv.name)}` : ''}</button>
        <button type="button" data-nav="${nx ? i + 1 : ''}" ${nx ? '' : 'disabled'}>${nx ? `${esc(nx.name)} →` : ''}</button>
      </nav>`
    d.scrollTop = 0
  }
  d.addEventListener('click', (ev) => {
    if (ev.target === d || ev.target.closest('.pj-dx')) return d.close()
    const b = ev.target.closest('[data-nav]')
    if (b && b.dataset.nav !== '') fill(getVisible()[+b.dataset.nav])
  })
  d.addEventListener('close', () => document.documentElement.classList.remove('pj-lock'))
  return {
    open(p) { fill(p); document.documentElement.classList.add('pj-lock'); d.showModal() },
    destroy() { if (d.open) d.close(); d.remove() },
  }
}

export function mount(el, { projects, filter }) {
  const sel = new Set(new URLSearchParams(location.search).get('tech')?.split(',').map(techKey).filter(Boolean))
  const subs = new Set()

  const map = new Map()
  for (const p of projects) for (const s of p.stack) {
    const key = techKey(s), t = map.get(key) || { key, name: techName(s), count: 0, projects: [] }
    t.count++; t.projects.push(p); map.set(key, t)
  }
  const techs = [...map.values()].sort((a, b) => b.count - a.count || a.name.localeCompare(b.name))
  const keysOf = new Map(projects.map((p) => [p, new Set(p.stack.map(techKey))]))
  const match = (p) => [...sel].every((k) => keysOf.get(p).has(k))
  const visible = () => projects.filter(match)

  el.innerHTML = `<div class="pj-wrap f-${filter.id}"><div class="pj-filter"></div><div class="pj-main"><div class="pj-bar"><span class="pj-count" aria-live="polite"></span><button type="button" class="pj-clear" hidden>Clear filter</button></div><div class="pj-list">${projects.map(rowHTML).join('')}</div></div></div>`
  const $ = (s) => el.querySelector(s)
  const rows = new Map(projects.map((p) => [p, el.querySelector(`.pj[data-id="${CSS.escape(p.id)}"]`)]))
  const modal = dialog(el, visible)

  const render = () => {
    const vis = visible(), set = new Set(vis)
    for (const [p, r] of rows) {
      const hide = !set.has(p)
      r.toggleAttribute('data-hide', hide)
      r.inert = hide
      if (hide && r.hasAttribute('data-open')) setOpen(r, false)
      r.querySelectorAll('.pj-ic .ti').forEach((i) => (sel.has(i.dataset.tech) ? i.setAttribute('data-hit', '') : i.removeAttribute('data-hit')))
    }
    $('.pj-count').innerHTML = sel.size ? `<b>${vis.length}</b> of ${projects.length} projects` : `<b>${projects.length}</b> projects`
    $('.pj-clear').hidden = !sel.size
    subs.forEach((fn) => fn(sel, vis))
  }
  const setOpen = (r, on) => {
    r.toggleAttribute('data-open', on)
    r.querySelector('.pj-row').setAttribute('aria-expanded', String(on))
  }

  el.addEventListener('click', (ev) => {
    const r = ev.target.closest('.pj')
    if (!r) return
    const p = projects.find((x) => x.id === r.dataset.id)
    if (ev.target.closest('[data-detail]')) return modal.open(p)
    if (!ev.target.closest('.pj-row')) return
    const on = !r.hasAttribute('data-open')
    rows.forEach((x) => x.hasAttribute('data-open') && x !== r && setOpen(x, false))
    setOpen(r, on)
    if (on) setTimeout(() => { const b = r.getBoundingClientRect(); if (b.top < 70 || b.bottom > innerHeight) scrollTo({ top: scrollY + b.top - 90, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' }) }, 120)
  })
  $('.pj-clear').addEventListener('click', () => ctx.clear())

  const ctx = {
    host: $('.pj-filter'), projects, techs,
    selected: () => sel, visible,
    toggle(k) { sel.has(k) ? sel.delete(k) : sel.add(k); render() },
    set(ks) { sel.clear(); ks.forEach((k) => sel.add(k)); render() },
    clear() { sel.clear(); render() },
    coUse(k) {
      const m = new Map()
      for (const p of map.get(k)?.projects || []) for (const s of keysOf.get(p)) if (s !== k) m.set(s, (m.get(s) || 0) + 1)
      return m
    },
    subscribe(fn) { subs.add(fn); fn(sel, visible()); return () => subs.delete(fn) },
  }
  const unmount = filter.mount(ctx)
  render()
  return () => { unmount?.(); modal.destroy(); el.replaceChildren() }
}
