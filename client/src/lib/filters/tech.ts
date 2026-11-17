// Tech filter: the interlinked graph from 900px up, the chip bar below. Both are driven by the same selection state.
import * as graph from './graph'
import * as chips from './chips'
import './tech.css'
import type { FilterCtx } from './types'

export const id = 'tech'
export const classes = [`f-${graph.id}`, `f-${chips.id}`]

export function mount(ctx: FilterCtx): () => void {
  ctx.host.innerHTML = '<div class="tf-g"></div><div class="tf-c"></div>'
  const [g, c] = Array.from(ctx.host.children) as HTMLElement[]
  const offs = [graph.mount({ ...ctx, host: g }), chips.mount({ ...ctx, host: c })]
  return () => offs.forEach((fn) => fn())
}
