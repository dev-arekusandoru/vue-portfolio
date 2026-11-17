// Filter: compact chip bar. One line collapsed (top 10 + "+N more"), wraps + search when expanded.
// Chip count = results you'd get with that chip on; chips that would give 0 are dimmed, not hidden.
import { esc } from '../data'
import { icon } from '../icons'
import './chips.css'
import type { FilterCtx } from './types'

export const id = 'chips'

const TOP = 10

export function mount(ctx: FilterCtx): () => void {
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
  const $ = <T extends HTMLElement>(s: string) => host.querySelector<T>(s)!
  const root = $('.cb'),
    vp = $('.cb-vp'),
    input = $<HTMLInputElement>('.cb-input'),
    hits = $('.cb-hits'),
    more = $('.cb-more'),
    moreT = $('.cb-more-t'),
    dot = $('.cb-dot')
  const chips = new Map(
    Array.from(host.querySelectorAll<HTMLElement>('.cb-chip')).map((c) => [c.dataset.k!, c]),
  )
  let open = false
  let busy: (() => void) | null = null
  let query = ''
  let label = `+${Math.max(0, total - TOP)}`

  // ---- state render --------------------------------------------------
  const render = (sel: Set<string>, vis: unknown[]) => {
    const set = new Set(vis)
    for (const t of techs) {
      const c = chips.get(t.key)!
      const on = sel.has(t.key)
      const n = on ? vis.length : t.projects.reduce((a, p) => a + (set.has(p) ? 1 : 0), 0)
      c.setAttribute('aria-pressed', String(on))
      c.toggleAttribute('data-zero', n === 0)
      c.querySelector('.cb-n')!.textContent = String(n)
      c.setAttribute('aria-label', `${t.name}, ${n} project${n === 1 ? '' : 's'}`)
    }
    measure()
  }

  // ---- collapsed-mode measurement ----------------------------------
  // Chips that wrap off the first line (desktop) are hidden + the "+N more" count is derived from what is actually visible.
  const measure = () => {
    if (open || busy) return
    let shown = 0
    let offSel = 0
    let top: number | null = null
    for (const c of chips.values()) {
      c.removeAttribute('data-off')
      if (c.offsetParent === null) continue
      if (top === null) top = c.offsetTop
      if (c.offsetTop > top + 4) {
        c.setAttribute('data-off', '')
        if (c.getAttribute('aria-pressed') === 'true') offSel++
      } else shown++
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
  const settle = (done: () => void) => {
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
    const onEnd = (e: TransitionEvent) => {
      if (e.target === vp && e.propertyName === 'height') end()
    }
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
    void vp.offsetHeight // reflow
    settle(() => {
      vp.style.height = open ? 'auto' : ''
      if (!open) measure()
    })
    vp.style.height = to + 'px'
  }
  const setOpen = (on: boolean) => {
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
      vp.style.setProperty('--fl', '0px')
      vp.style.setProperty('--fr', '0px')
      dot.hidden = true
      grow()
    } else {
      if (query) {
        query = ''
        input.value = ''
        filter()
      }
      const from = vp.offsetHeight
      vp.style.height = from + 'px'
      void vp.offsetHeight
      settle(() => {
        vp.style.height = ''
        measure()
      })
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
      const c = chips.get(t.key)!
      c.hidden = !(hit || sel.has(t.key))
      if (hit) n++
    }
    hits.textContent = q ? (n ? `${n} / ${total}` : 'no match') : ''
    root.toggleAttribute('data-none', !!q && !n)
    if (open) grow()
  }

  // ---- events --------------------------------------------------------
  const onClick = (e: MouseEvent) => {
    const t = e.target as Element
    const c = t.closest<HTMLElement>('.cb-chip')
    if (c) return ctx.toggle(c.dataset.k!)
    if (t.closest('.cb-more')) setOpen(!open)
  }
  const onInput = () => {
    query = input.value
    filter()
  }
  const onKey = (e: KeyboardEvent) => {
    if (e.key !== 'Escape') return
    if (query) {
      e.preventDefault()
      e.stopPropagation()
      input.value = ''
      query = ''
      filter()
    } else if (open) {
      e.preventDefault()
      e.stopPropagation()
      setOpen(false)
      more.focus()
    }
  }
  root.addEventListener('click', onClick)
  input.addEventListener('input', onInput)
  input.addEventListener('keydown', onKey)
  vp.addEventListener('scroll', edges, { passive: true })
  const ro = new ResizeObserver(() => {
    if (!open && !busy) measure()
  })
  ro.observe(vp)

  const unsub = ctx.subscribe((sel, vis) => {
    render(sel, vis)
    if (query) filter()
  })
  moreT.textContent = label
  measure()
  let dead = false
  void document.fonts?.ready.then(() => {
    if (!dead) measure()
  })

  return () => {
    dead = true
    unsub()
    ro.disconnect()
    busy?.()
    root.removeEventListener('click', onClick)
    input.removeEventListener('input', onInput)
    input.removeEventListener('keydown', onKey)
    vp.removeEventListener('scroll', edges)
    host.replaceChildren()
  }
}
