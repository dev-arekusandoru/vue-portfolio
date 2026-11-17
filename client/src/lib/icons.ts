// Tech icons, monochrome. Rendered as a CSS mask so they take `color` (currentColor) and can be tinted by the design.
// The SVGs are bundled from src/assets/tech (fetched from Iconify by `npm run icons`, listed in scripts/tech-icons.json).
// Unknown tech falls back to a 2-letter text glyph, so nothing is ever blank.
import { esc, techKey, techName } from './data'

const files = import.meta.glob<string>('../assets/tech/*.svg', {
  eager: true,
  query: '?url',
  import: 'default',
})
const MAP = new Map<string, string>()
for (const [path, url] of Object.entries(files)) {
  const base = path
    .split('/')
    .pop()!
    .replace(/\.svg$/, '')
  MAP.set(base, url)
}
const urlFor = (key: string) => MAP.get(key.replace(/[^a-z0-9-]/g, '_'))

export const hasIcon = (name: string) => !!urlFor(techKey(name))

/**
 * Icon HTML for a technology. Size with `--ti-size` (default 22px), colour with `color`.
 * Always carries data-tech="<techKey>" so views can link/highlight the same tech across cards.
 * Has role="img" + aria-label, and title for a native tooltip.
 */
export function icon(name: string): string {
  const key = techKey(name)
  const label = techName(name)
  const url = urlFor(key)
  if (url)
    return `<span class="ti" data-tech="${esc(key)}" role="img" aria-label="${esc(label)}" title="${esc(label)}" style="--ti:url(&quot;${esc(url)}&quot;)"></span>`
  const glyph = label.replace(/[^a-z0-9]/gi, '').slice(0, 2)
  return `<span class="ti ti-txt" data-tech="${esc(key)}" role="img" aria-label="${esc(label)}" title="${esc(label)}">${esc(glyph)}</span>`
}
