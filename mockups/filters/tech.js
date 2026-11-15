// Tech filter: the interlinked graph from 900px up, the chip bar below. Both are driven by the same selection state.
import * as graph from './graph.js'
import * as chips from './chips.js'

export const id = 'tech'
export const classes = [`f-${graph.id}`, `f-${chips.id}`]
export const css = `${graph.css}
${chips.css}
.pj-filter>.tf-c{display:none}
@media (max-width:899px){.pj-filter>.tf-g{display:none}.pj-filter>.tf-c{display:block}}`

export function mount(ctx) {
  ctx.host.innerHTML = '<div class="tf-g"></div><div class="tf-c"></div>'
  const [g, c] = ctx.host.children
  const offs = [graph.mount({ ...ctx, host: g }), chips.mount({ ...ctx, host: c })]
  return () => offs.forEach((fn) => fn?.())
}
