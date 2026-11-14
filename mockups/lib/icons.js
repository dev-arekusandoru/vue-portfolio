// Tech icons, monochrome. Rendered as a CSS mask so they take `color` (currentColor) and can be tinted by the design.
// Source: Iconify (api.iconify.design) sets simple-icons > devicon-plain > logos, plus local SVGs in ./icons.
// Unknown tech falls back to a 2-letter text glyph, so nothing is ever blank.
import { esc, techKey, techName } from './data.js'

const I = (set, name) => `https://api.iconify.design/${set}/${name}.svg`
const MAP = {
  ruby: I('simple-icons', 'ruby'), rails: I('simple-icons', 'rubyonrails'), postgresql: I('simple-icons', 'postgresql'),
  docker: I('simple-icons', 'docker'), git: I('simple-icons', 'git'), java: I('devicon-plain', 'java'), jquery: I('simple-icons', 'jquery'),
  html: I('simple-icons', 'html5'), css: I('simple-icons', 'css3'), javascript: I('simple-icons', 'javascript'), typescript: I('simple-icons', 'typescript'),
  firebase: I('simple-icons', 'firebase'), maven: I('simple-icons', 'apachemaven'), polymer: I('logos', 'polymer'), rspec: I('devicon-plain', 'rspec'),
  activerecord: new URL('../icons/activerecord.svg', import.meta.url).href,
  react: I('simple-icons', 'react'), 'react-native': I('simple-icons', 'react'), vue: I('simple-icons', 'vuedotjs'), tailwindcss: I('simple-icons', 'tailwindcss'),
  expo: I('simple-icons', 'expo'), supabase: I('simple-icons', 'supabase'), nextjs: I('simple-icons', 'nextdotjs'), github: I('simple-icons', 'github'),
  gitlab: I('simple-icons', 'gitlab'), linux: I('simple-icons', 'linux'), aws: I('simple-icons', 'amazonaws'), python: I('simple-icons', 'python'),
}

export const hasIcon = (name) => techKey(name) in MAP

/**
 * Icon HTML for a technology. Size with `--ti-size` (default 22px), colour with `color`.
 * Always carries data-tech="<techKey>" so variants can link/highlight the same tech across cards.
 * Has role="img" + aria-label, and title for a native tooltip.
 */
export function icon(name) {
  const key = techKey(name), label = techName(name), url = MAP[key]
  if (url) return `<span class="ti" data-tech="${esc(key)}" role="img" aria-label="${esc(label)}" title="${esc(label)}" style="--ti:url('${url}')"></span>`
  const glyph = label.replace(/[^a-z0-9]/gi, '').slice(0, 2)
  return `<span class="ti ti-txt" data-tech="${esc(key)}" role="img" aria-label="${esc(label)}" title="${esc(label)}">${esc(glyph)}</span>`
}
