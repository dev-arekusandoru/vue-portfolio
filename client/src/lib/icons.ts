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

/** What a tech icon needs: the key (for linking/highlighting), the label, the bundled SVG url (if any) and the 2-letter fallback glyph. */
export function iconInfo(name: string) {
  const key = techKey(name)
  const label = techName(name)
  const url = urlFor(key)
  return { key, label, url, glyph: label.replace(/[^a-z0-9]/gi, '').slice(0, 2) }
}

/** Icon HTML for the imperative graph (components use <TechIcon>). Same markup as TechIcon. */
export function icon(name: string): string {
  const { key, label, url, glyph } = iconInfo(name)
  if (url)
    return `<span class="ti" data-tech="${esc(key)}" role="img" aria-label="${esc(label)}" title="${esc(label)}" style="--ti:url(&quot;${esc(url)}&quot;)"></span>`
  return `<span class="ti ti-txt" data-tech="${esc(key)}" role="img" aria-label="${esc(label)}" title="${esc(label)}">${esc(glyph)}</span>`
}
