import type { Project } from '../data'

export interface Tech {
  key: string
  name: string
  /** number of projects using it */
  count: number
  projects: Project[]
}

/** The shared selection state (AND semantics) and the host element the graph draws into. */
export interface FilterCtx {
  host: HTMLElement
  projects: Project[]
  /** most-used first */
  techs: Tech[]
  selected(): Set<string>
  toggle(key: string): void
  set(keys: string[]): void
  clear(): void
  visible(): Project[]
  /** other techs used together with `key` and how many projects share them */
  coUse(key: string): Map<string, number>
  /** `fn` is called now and after every change; returns unsubscribe */
  subscribe(fn: (selected: Set<string>, visible: Project[]) => void): () => void
}
