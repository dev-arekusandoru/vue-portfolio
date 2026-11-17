// Projects page: the filter plus the project rows. Exports mount(el, { projects, filter, open, onVisible }).
//
// Layout the host element gets:
//   .pj-wrap.<filter classes>
//     .pj-filter   <- the filter module draws here
//     .pj-main
//       .pj-bar    (label + count, clear)
//       .pj-list   (rows; a click calls `open(project)`, the router opens the detail dialog at /projects/<slug>)
//
// A filter module is { id, classes?, mount(ctx) -> unmount }. `classes` (default ['f-<id>']) go on .pj-wrap, so css can scope to them.
import { esc, techKey, techName, type Project } from './data'
import { icon } from './icons'
import { status } from './detail'
import type { FilterCtx, FilterMount, Tech } from './filters/types'
import './projects.css'

const MAX_ICONS = 6
const year = (d: Date) => d.getUTCFullYear()
const art = (p: Project) =>
  `style="--a1:${p.pal[0]};--a2:${p.pal[1]};--a3:${p.pal[2]};--pa:${p.accent}"`

export interface Filter {
  id: string
  classes?: string[]
  mount: FilterMount
}
export interface MountOptions {
  projects: Project[]
  filter: Filter
  /** A row was activated. */
  open: (p: Project) => void
  /** The filtered list changed (also called once on mount). */
  onVisible?: (visible: Project[]) => void
}

const iconsOf = (p: Project) => {
  const shown = p.stack.slice(0, MAX_ICONS)
  const rest = p.stack.length - shown.length
  return (
    shown.map(icon).join('') +
    (rest > 0
      ? `<span class="pj-more-n" aria-label="${rest} more technologies">+${rest}</span>`
      : '')
  )
}

const rowHTML = (p: Project) => `
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

export function mount(
  el: HTMLElement,
  { projects, filter, open, onVisible }: MountOptions,
): () => void {
  const sel = new Set<string>()
  const subs = new Set<(s: Set<string>, v: Project[]) => void>()

  const map = new Map<string, Tech>()
  for (const p of projects)
    for (const s of p.stack) {
      const key = techKey(s)
      const t = map.get(key) || { key, name: techName(s), count: 0, projects: [] }
      t.count++
      t.projects.push(p)
      map.set(key, t)
    }
  const techs = [...map.values()].sort((a, b) => b.count - a.count || a.name.localeCompare(b.name))
  const keysOf = new Map(projects.map((p) => [p, new Set(p.stack.map(techKey))]))
  const match = (p: Project) => [...sel].every((k) => keysOf.get(p)!.has(k))
  const visible = () => projects.filter(match)

  const fc = (filter.classes || [`f-${filter.id}`]).join(' ')
  el.innerHTML = `<div class="pj-wrap ${fc}"><div class="pj-filter"></div><div class="pj-main"><div class="pj-bar"><span class="pj-lbl" aria-live="polite"></span><button type="button" class="pj-clear" hidden>Clear filter</button></div><div class="pj-list">${projects.map(rowHTML).join('')}</div></div></div>`
  const $ = <T extends HTMLElement>(s: string) => el.querySelector<T>(s)!
  const rows = new Map(
    projects.map((p) => [p, el.querySelector<HTMLElement>(`.pj[data-id="${CSS.escape(p.id)}"]`)!]),
  )
  const clearBtn = $<HTMLButtonElement>('.pj-clear')

  const render = () => {
    const vis = visible()
    const set = new Set(vis)
    for (const [p, r] of rows) {
      const hide = !set.has(p)
      r.toggleAttribute('data-hide', hide)
      r.inert = hide
      r.querySelectorAll<HTMLElement>('.pj-ic .ti').forEach((i) =>
        sel.has(i.dataset.tech!) ? i.setAttribute('data-hit', '') : i.removeAttribute('data-hit'),
      )
    }
    $('.pj-lbl').innerHTML =
      `Projects<i aria-hidden="true">·</i><b>${sel.size ? `${vis.length} of ${projects.length}` : projects.length}</b>`
    clearBtn.hidden = !sel.size
    subs.forEach((fn) => fn(sel, vis))
    onVisible?.(vis)
  }

  const onClick = (ev: MouseEvent) => {
    const t = ev.target as Element
    const r = t.closest<HTMLElement>('.pj')
    if (!r || !t.closest('.pj-row')) return
    const p = projects.find((x) => x.id === r.dataset.id)
    if (p) open(p)
  }
  el.addEventListener('click', onClick)
  const onClear = () => ctx.clear()
  clearBtn.addEventListener('click', onClear)

  const ctx: FilterCtx = {
    host: $('.pj-filter'),
    projects,
    techs,
    selected: () => sel,
    visible,
    toggle(k) {
      if (sel.has(k)) sel.delete(k)
      else sel.add(k)
      render()
    },
    set(ks) {
      sel.clear()
      ks.forEach((k) => sel.add(k))
      render()
    },
    clear() {
      sel.clear()
      render()
    },
    coUse(k) {
      const m = new Map<string, number>()
      for (const p of map.get(k)?.projects || [])
        for (const s of keysOf.get(p)!) if (s !== k) m.set(s, (m.get(s) || 0) + 1)
      return m
    },
    subscribe(fn) {
      subs.add(fn)
      fn(sel, visible())
      return () => {
        subs.delete(fn)
      }
    },
  }
  const unmount = filter.mount(ctx)
  render()
  return () => {
    el.removeEventListener('click', onClick)
    clearBtn.removeEventListener('click', onClear)
    unmount()
    el.replaceChildren()
  }
}
