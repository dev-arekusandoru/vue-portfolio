import { computed, reactive, watch } from 'vue'
import { techKey, techName, type Project } from '@/lib/data'
import type { FilterCtx, Tech } from '@/lib/filters/types'

/** The Projects page's tech filter state: the selection (AND semantics), the matching projects, and per-tech usage. */
export function useTechFilter(projects: Project[]) {
  const sel = reactive(new Set<string>())

  const byTech = new Map<string, Tech>()
  for (const p of projects)
    for (const s of p.stack) {
      const key = techKey(s)
      const t = byTech.get(key) || { key, name: techName(s), count: 0, projects: [] }
      t.count++
      t.projects.push(p)
      byTech.set(key, t)
    }
  /** most-used first */
  const techs = [...byTech.values()].sort(
    (a, b) => b.count - a.count || a.name.localeCompare(b.name),
  )
  const keysOf = new Map(projects.map((p) => [p, new Set(p.stack.map(techKey))]))

  const visible = computed(() =>
    projects.filter((p) => [...sel].every((k) => keysOf.get(p)!.has(k))),
  )

  const toggle = (k: string) => void (sel.has(k) ? sel.delete(k) : sel.add(k))
  const clear = () => sel.clear()
  /** other techs used together with `key` and how many projects share them */
  const coUse = (k: string) => {
    const m = new Map<string, number>()
    for (const p of byTech.get(k)?.projects || [])
      for (const s of keysOf.get(p)!) if (s !== k) m.set(s, (m.get(s) || 0) + 1)
    return m
  }

  /** The graph is imperative; this is the surface it draws and listens through. */
  const graphCtx = (host: HTMLElement): FilterCtx => ({
    host,
    projects,
    techs,
    selected: () => sel,
    visible: () => visible.value,
    toggle,
    set(ks) {
      sel.clear()
      ks.forEach((k) => sel.add(k))
    },
    clear,
    coUse,
    subscribe(fn) {
      fn(sel, visible.value)
      return watch(
        () => [...sel],
        () => fn(sel, visible.value),
        { flush: 'sync' },
      )
    },
  })

  return { sel, techs, visible, toggle, clear, coUse, graphCtx }
}
export type TechFilter = ReturnType<typeof useTechFilter>
