// Projects page. Exports css + mount(el, { projects, filter }).
//
// Layout the host element gets:
//   .pj-wrap.<filter classes>
//     .pj-filter   <- the filter module draws here
//     .pj-main
//       .pj-bar    (label + count, clear)
//       .pj-list   (rows; a click opens the detail dialog at #/projects/<slug>)
//
// A filter module is { id, classes?, css, mount(ctx) -> unmount? }. `classes` (default ['f-<id>']) go on .pj-wrap, so css can scope to them.
// ctx is:
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
import { dialog, status, css as detailCss } from './detail.js'

const MAX_ICONS = 6
const year = (d) => d.getUTCFullYear()
const art = (p) => `style="--a1:${p.pal[0]};--a2:${p.pal[1]};--a3:${p.pal[2]};--pa:${p.accent}"`
const slugOf = (p) => p.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
const subOf = () => { const m = location.hash.match(/^#\/projects\/([^/?]+)/); return m ? decodeURIComponent(m[1]) : null }
const PINK = '#ff4fa3', CYAN = '#5ad1e6'

const rowsCss = `
.pj-wrap{display:grid;gap:clamp(20px,3vw,36px)}
.pj-main{min-width:0}
.pj-bar{display:flex;justify-content:space-between;align-items:center;gap:12px;min-height:34px;margin-bottom:6px;font-size:.76rem;color:var(--muted)}
.pj-bar b{color:var(--fg);font-weight:400}
.pj-lbl{letter-spacing:.14em;text-transform:uppercase;font-size:.7rem}
.pj-lbl i{font-style:normal;color:var(--accent);margin:0 6px}
.pj-clear{padding:6px 10px;border:1px solid var(--rule);background:none;cursor:pointer;font-size:.72rem;color:var(--fg);transition:border-color .3s var(--ease),color .3s var(--ease)}
.pj-clear:hover{border-color:var(--accent);color:var(--accent)}
.pj-clear[hidden]{display:inline-block;visibility:hidden}

/* rows: the whole row is one button that opens the detail dialog */
.pj-list{border-top:1px solid var(--rule)}
.pj{display:grid;grid-template-rows:1fr;border-bottom:1px solid var(--rule);transition:grid-template-rows .6s var(--ease),opacity .45s var(--ease),border-color .45s var(--ease)}
.pj>.pj-in{min-height:0;overflow:hidden}
.pj[data-hide]{grid-template-rows:0fr;opacity:0;border-bottom-color:transparent;pointer-events:none}
.pj-row{position:relative;isolation:isolate;display:grid;grid-template-columns:96px minmax(0,1fr) auto 5.4rem 1.4rem;gap:6px 24px;align-items:center;width:100%;padding:20px 0;text-align:left;background:none;border:0;cursor:pointer}
.pj-row::before{content:"";position:absolute;left:-14px;top:0;bottom:0;width:2px;background:var(--pa);box-shadow:0 0 10px var(--pa);transform:scaleY(0);transition:transform .5s var(--ease);z-index:2}
.pj-row:hover::before,.pj-row:focus-visible::before{transform:scaleY(1)}
.pj-yr{display:none;font-size:.76rem;color:var(--muted)}
.pj-t{min-width:0;display:grid;gap:4px}
.pj-t h3{font:300 clamp(1.2rem,2.6vw,1.9rem)/1.15 var(--display);letter-spacing:.05em;transition:color .4s var(--ease),transform .6s var(--ease)}
.pj-row:hover h3,.pj-row:focus-visible h3{color:var(--pa);transform:translateX(6px)}
.pj-hl{font-size:.82rem;color:var(--muted);max-width:62ch}
.pj-ic{display:flex;align-items:center;gap:14px;color:var(--fg);opacity:.78;--ti-size:22px}
.pj-ic .ti{transition:color .35s var(--ease),opacity .35s var(--ease)}
.pj-ic .ti[data-hit]{color:var(--accent);opacity:1;filter:drop-shadow(0 0 6px rgb(255 140 43/.55))}
.pj-more-n{font-size:.72rem;color:var(--muted)}
.pj-st{display:inline-flex;align-items:center;font-size:.74rem;color:var(--muted)}
.pj-st::before{content:"";width:7px;height:7px;border-radius:50%;margin-right:8px;border:1px solid var(--muted)}
.pj-st.active{color:var(--fg)}
.pj-st.active::before{border:0;background:var(--blue);box-shadow:0 0 8px var(--blue);animation:pulse 2.4s ease-in-out infinite}
.pj-go{justify-self:end;color:var(--muted);transition:color .4s var(--ease),transform .5s var(--ease)}
.pj-row:hover .pj-go,.pj-row:focus-visible .pj-go{color:var(--pa)}
.pj-row>*:not(.pj-art){position:relative;z-index:1}

/* hover plate: holographic wash fading in from the right, split into pink and cyan ghosts */
.pj-art{position:absolute;z-index:0;right:0;top:0;bottom:0;width:min(46%,520px);opacity:0;pointer-events:none;overflow:hidden;
  -webkit-mask:linear-gradient(90deg,transparent,#000 55%,#000 85%,transparent);mask:linear-gradient(90deg,transparent,#000 55%,#000 85%,transparent);transition:opacity .6s var(--ease);
  background:linear-gradient(112deg,transparent 15%,rgb(255 79 163/.42) 48%,rgb(90 209 230/.46) 82%),radial-gradient(circle at 25% 30%,var(--a1),transparent 55%),linear-gradient(160deg,var(--a2),transparent)}
.pj-art img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;opacity:.75;z-index:0}
.pj-art::before,.pj-art::after{content:"";position:absolute;inset:0;z-index:1;mix-blend-mode:screen;opacity:0;transition:opacity .5s var(--ease),transform .7s var(--ease)}
.pj-art::before{background:radial-gradient(circle at 30% 40%,${PINK},transparent 56%),linear-gradient(110deg,transparent 40%,rgb(255 79 163/.22))}
.pj-art::after{background:radial-gradient(circle at 78% 80%,${CYAN},transparent 56%),linear-gradient(250deg,transparent 40%,rgb(90 209 230/.22))}
.pj-row:hover .pj-art,.pj-row:focus-visible .pj-art{opacity:.5}
.pj-row:hover .pj-art::before,.pj-row:focus-visible .pj-art::before{opacity:.55;transform:translateX(-12px)}
.pj-row:hover .pj-art::after,.pj-row:focus-visible .pj-art::after{opacity:.55;transform:translateX(12px)}
.pj-row:focus-visible{outline-offset:-2px}

/* thumb tile: the cover, clear and un-tinted; without a cover, the project's generated gradient with its initial */
.pj-tile{position:relative;width:96px;height:64px;overflow:hidden;background:radial-gradient(circle at 25% 30%,var(--a1),transparent 62%),radial-gradient(circle at 85% 95%,var(--a3),transparent 55%),linear-gradient(160deg,var(--a2),#050607);outline:1px solid var(--rule);outline-offset:-1px;transition:transform .6s var(--ease),box-shadow .6s var(--ease),outline-color .4s var(--ease)}
.pj-tile img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;transition:transform .9s var(--ease)}
.pj-tile b{position:absolute;inset:0;display:grid;place-items:center;font:200 1.7rem/1 var(--display);color:var(--fg);opacity:.85}
.pj-tile::after{content:"";position:absolute;inset:0;background:linear-gradient(transparent 60%,rgb(5 6 7/.5));pointer-events:none}
.pj-row:hover .pj-tile,.pj-row:focus-visible .pj-tile{transform:scale(1.05);outline-color:var(--pa);box-shadow:-5px 0 14px -4px ${PINK}aa,5px 0 14px -4px ${CYAN}aa,0 0 22px -6px var(--pa)}
.pj-row:hover .pj-tile img,.pj-row:focus-visible .pj-tile img{transform:scale(1.08)}

@media (max-width:899px){
  .pj-row{grid-template-columns:72px minmax(0,1fr) auto;grid-template-areas:"tile yr st" "tile t t" "ic ic go";padding:20px 0;gap:6px 14px}
  .pj-tile{width:72px;height:72px;align-self:start}
  .pj-yr{display:block;grid-area:yr}
  .pj-st{grid-area:st;justify-self:end}
  .pj-t{grid-area:t;align-self:start}
  .pj-ic{grid-area:ic;gap:12px;--ti-size:20px;flex-wrap:wrap;padding-top:6px}
  .pj-go{grid-area:go}
  .pj-row::before{left:-10px}
  .pj-art{display:none}
  .pj-tile{grid-area:tile}
}

@media (prefers-reduced-motion:reduce){.pj,.pj-dlg,.pj-dlg::backdrop,.pj-art,.pj-art::before,.pj-art::after,.pj-t h3,.pj-go,.pj-shot,.pj-shot img{transition-duration:.01ms!important}}
`
export const css = rowsCss + detailCss

const iconsOf = (p) => {
  const shown = p.stack.slice(0, MAX_ICONS), rest = p.stack.length - shown.length
  return shown.map(icon).join('') + (rest > 0 ? `<span class="pj-more-n" aria-label="${rest} more technologies">+${rest}</span>` : '')
}

const rowHTML = (p) => `
<article class="pj" data-id="${esc(p.id)}">
  <div class="pj-in">
    <button type="button" class="pj-row" aria-haspopup="dialog" ${art(p)}>
      <span class="pj-art" aria-hidden="true"></span>
      <span class="pj-yr">${year(p.start)}</span>
      <span class="pj-tile" aria-hidden="true">${p.cover ? `<img src="${esc(p.cover)}" alt="" loading="lazy" decoding="async">` : `<b>${esc([...p.name][0])}</b>`}</span>
      <span class="pj-t"><h3>${esc(p.name)}</h3><span class="pj-hl">${esc(p.headline)}</span></span>
      <span class="pj-ic" aria-label="Technologies">${iconsOf(p)}</span>
      ${status(p)}
      <span class="pj-go" aria-hidden="true">→</span>
    </button>
  </div>
</article>`

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

  const fc = (filter.classes || [`f-${filter.id}`]).join(' ')
  el.innerHTML = `<div class="pj-wrap ${fc}"><div class="pj-filter"></div><div class="pj-main"><div class="pj-bar"><span class="pj-lbl" aria-live="polite"></span><button type="button" class="pj-clear" hidden>Clear filter</button></div><div class="pj-list">${projects.map(rowHTML).join('')}</div></div></div>`
  const $ = (s) => el.querySelector(s)
  const rows = new Map(projects.map((p) => [p, el.querySelector(`.pj[data-id="${CSS.escape(p.id)}"]`)]))

  /* the dialog is a route: #/projects/<slug>. Opening pushes a history entry, so Back closes it. */
  let pushed = false, closingFromHash = false, dead = false
  const modal = dialog(el, {
    getVisible: visible,
    onNav: (p) => history.replaceState(null, '', `#/projects/${slugOf(p)}`),
    onClose: () => {
      if (dead || closingFromHash) { closingFromHash = false; return }
      if (!subOf()) return
      if (pushed) { pushed = false; history.back() } else history.replaceState(null, '', '#/projects')
    },
  })
  const sync = () => {
    const s = subOf(), p = s && projects.find((x) => slugOf(x) === s)
    if (p) { if (!modal.isOpen()) modal.open(p) }
    else if (modal.isOpen()) { closingFromHash = true; modal.close() }
  }
  addEventListener('hashchange', sync)

  const render = () => {
    const vis = visible(), set = new Set(vis)
    for (const [p, r] of rows) {
      const hide = !set.has(p)
      r.toggleAttribute('data-hide', hide)
      r.inert = hide
      r.querySelectorAll('.pj-ic .ti').forEach((i) => (sel.has(i.dataset.tech) ? i.setAttribute('data-hit', '') : i.removeAttribute('data-hit')))
    }
    $('.pj-lbl').innerHTML = `Projects<i aria-hidden="true">·</i><b>${sel.size ? `${vis.length} of ${projects.length}` : projects.length}</b>`
    $('.pj-clear').hidden = !sel.size
    subs.forEach((fn) => fn(sel, vis))
  }

  el.addEventListener('click', (ev) => {
    const r = ev.target.closest('.pj')
    if (!r || !ev.target.closest('.pj-row')) return
    pushed = true
    location.hash = `#/projects/${slugOf(projects.find((x) => x.id === r.dataset.id))}`
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
  sync()
  return () => { dead = true; removeEventListener('hashchange', sync); unmount?.(); modal.destroy(); el.replaceChildren() }
}
