// Project detail dialog, drafting-table treatment: faint grid, cover plate and figure captions, a title block for the at-a-glance facts,
// and a boot build-up when it opens.
import { esc, techName, type Project } from './data'
import { icon } from './icons'
import './detail.css'

const mon = (d: Date) =>
  d.toLocaleDateString('en-US', { month: 'short', year: 'numeric', timeZone: 'UTC' })
export const period = (p: Project) =>
  `${mon(p.start)} – ${p.current ? 'Present' : p.end ? mon(p.end) : mon(p.start)}`
const link = (u: string, t: string) =>
  `<a class="pj-lk" href="${esc(u)}" target="_blank" rel="noopener noreferrer">${t}<span aria-hidden="true"> ↗</span></a>`
export const links = (p: Project) =>
  [
    p.demo_url && link(/^https?:/.test(p.demo_url) ? p.demo_url : `https://${p.demo_url}`, 'Demo'),
    p.code_url && link(p.code_url, 'Code'),
  ]
    .filter(Boolean)
    .join('')
export const status = (p: Project) =>
  `<span class="pj-st ${p.status}">${p.status === 'active' ? 'Active' : 'Shipped'}</span>`

const caption = (k: number, name: string) => `FIG. ${String(k).padStart(2, '0')} — ${name}`

function titleBlock(p: Project, i: number, n: number) {
  const dwg = `${[...p.name]
    .filter((c) => /[a-z0-9]/i.test(c))
    .slice(0, 3)
    .join('')
    .toUpperCase()}-${String(p.start.getUTCFullYear() % 100).padStart(2, '0')}${String(i + 1).padStart(2, '0')}`
  let ci = 0
  const cell = (cls: string, label: string, body: string) =>
    `<div class="${cls}" style="--ci:${ci++}"><dt>${label}</dt><dd>${body}</dd></div>`
  return `<dl class="bp-tbk">
    ${cell('', 'Role', esc(p.role))}
    ${cell('', 'Kind', esc(p.kind))}
    ${cell('', 'Period', esc(period(p)))}
    ${p.metric ? cell('res s2', 'Result', `<b>${esc(p.metric.value)}</b><span>${esc(p.metric.label)}</span>`) : ''}
    ${cell('', 'State', p.current ? 'In service' : 'Released')}
    ${cell(p.metric ? 'dw s2' : 'dw', 'Dwg no.', esc(dwg))}
    ${cell('', 'Sheet', `${i + 1} / ${n}`)}
  </dl>`
}

export interface DialogOptions {
  /** The list prev/next walk (the Projects page's filtered list, or all projects). */
  getVisible: () => Project[]
  /** Prev/next picked another project. */
  onNav: (p: Project) => void
  /** The dialog closed by itself (Esc, close button, backdrop). */
  onClose: () => void
}
export interface ProjectDialog {
  isOpen(): boolean
  current(): Project | null
  open(p: Project): void
  close(): void
  destroy(): void
}

/** Detail dialog: one per mount, content swapped per project. Prev/next walk the currently visible list. */
export function dialog(
  root: HTMLElement,
  { getVisible, onNav, onClose }: DialogOptions,
): ProjectDialog {
  const d = document.createElement('dialog')
  d.setAttribute('aria-labelledby', 'pj-dt')
  root.append(d)
  d.className = 'pj-dlg bp-grid bp-fig'
  let shots: string[] = []
  let si = 0
  let cur: Project | null = null
  let tPlay = 0
  let tType = 0
  const reduce = () => matchMedia('(prefers-reduced-motion: reduce)').matches
  const stop = () => {
    clearTimeout(tPlay)
    clearTimeout(tType)
    d.classList.remove('bp-play', 'bp-typing')
  }
  const play = () => {
    stop()
    if (reduce()) return
    const ty = d.querySelector<HTMLElement>('.bp-ty')
    const full = ty ? ty.dataset.t! : ''
    if (ty) ty.textContent = ''
    void d.offsetWidth
    d.classList.add('bp-play', 'bp-typing')
    let k = 0
    const step = () => {
      k++
      ty!.textContent = full.slice(0, k)
      if (k < full.length) tType = window.setTimeout(step, (1000 / Math.max(full.length, 12)) * 0.7)
      else tType = window.setTimeout(() => d.classList.remove('bp-typing'), 500)
    }
    if (ty) tType = window.setTimeout(step, 350)
    tPlay = window.setTimeout(() => d.classList.remove('bp-play'), 3600)
  }

  const lightbox = () => d.querySelector<HTMLElement>('.pj-lb')

  const fill = (p: Project) => {
    cur = p
    const v = getVisible()
    const i = v.indexOf(p)
    const pv = i > 0 ? v[i - 1] : null
    const nx = i >= 0 ? v[i + 1] : null
    let s = 0
    const sec = (cls: string, title: string, body: string) =>
      `<section class="${cls}" style="--si:${s++}"><h4>${title}</h4>${body}</section>`
    d.setAttribute('style', `--a1:${p.pal[0]};--a2:${p.pal[1]};--a3:${p.pal[2]};--pa:${p.accent}`)
    d.innerHTML = `
      <button type="button" class="pj-dx" aria-label="Close"></button>
      <div class="pj-sc">
        <header class="pj-dh">
          ${p.cover ? `<img class="pj-cv" src="${esc(p.cover)}" alt="" decoding="async">` : ''}
          <div class="pj-k"><span>${esc(p.kind)}</span><span>${esc(period(p))}</span>${status(p)}</div>
          <h2 id="pj-dt" aria-label="${esc(p.name)}"><span class="bp-gh" aria-hidden="true">${esc(p.name)}</span><span class="bp-ty" data-t="${esc(p.name)}" aria-hidden="true">${esc(p.name)}</span></h2>
          <p>${esc(p.summary || p.headline)}</p>
        </header>
        ${titleBlock(p, Math.max(i, 0), v.length)}
        ${p.cover ? `<figure class="bp-plate"><div class="bp-pf"><img src="${esc(p.cover)}" alt="" decoding="async"><i class="bp-sl"></i></div><figcaption><span>${esc(caption(0, `${p.name} · cover plate`))}</span><span>Scale 1 : 1</span></figcaption></figure>` : ''}
        <div class="pj-db">
          ${sec('', 'Highlights', `<ul class="pj-pts">${(p.highlights.length ? p.highlights : [p.headline]).map((h) => `<li>${esc(h)}</li>`).join('')}</ul>`)}
          ${p.challenges ? sec('', 'The hard part', `<p>${esc(p.challenges)}</p>`) : ''}
          ${p.screenshots.length ? sec('', 'Screens', `<div class="pj-shots">${p.screenshots.map((sh, k) => `<figure class="pj-fg"><button type="button" class="pj-shot" data-i="${k}" aria-label="View screenshot ${k + 1} of ${p.screenshots.length}"><img src="${esc(sh)}" alt="${esc(p.name)} screenshot ${k + 1}" loading="lazy" decoding="async"></button><figcaption aria-hidden="true">${esc(caption(k + 1, `${p.name} · view ${k + 1}`))}</figcaption></figure>`).join('')}</div>`) : ''}
          ${sec('', 'Built with', `<ul class="pj-tech">${p.stack.map((t) => `<li>${icon(t)}<span>${esc(techName(t))}</span></li>`).join('')}</ul>`)}
          ${links(p) ? `<section style="--si:${s++}"><div class="pj-act">${links(p)}</div></section>` : ''}
        </div>
      </div>
      <nav class="pj-dn" aria-label="Project navigation">
        <button type="button" data-nav="${pv ? i - 1 : ''}" ${pv ? '' : 'disabled'}>${pv ? `← ${esc(pv.name)}` : ''}</button>
        <button type="button" data-nav="${nx ? i + 1 : ''}" ${nx ? '' : 'disabled'}>${nx ? `${esc(nx.name)} →` : ''}</button>
      </nav>
      ${p.screenshots.length ? `<div class="pj-lb${p.screenshots.length < 2 ? ' one' : ''}" hidden><figure class="pj-lbf"><img alt=""><figcaption></figcaption></figure><button type="button" data-lb="-1" aria-label="Previous screenshot">←</button><button type="button" data-lb="1" aria-label="Next screenshot">→</button><button type="button" data-lb="0" aria-label="Close screenshot">×</button></div>` : ''}`
    shots = p.screenshots
    d.querySelector('.pj-sc')!.scrollTop = 0
    play()
  }
  const showShot = (k: number) => {
    const L = lightbox()
    if (!L || !shots.length || !cur) return
    si = (k + shots.length) % shots.length
    L.querySelector('img')!.src = shots[si]
    L.querySelector('figcaption')!.innerHTML =
      `<span>${esc(caption(si + 1, `${cur.name} · view ${si + 1}`))}</span><span>${si + 1} / ${shots.length}</span>`
    L.hidden = false
  }
  d.addEventListener('click', (ev) => {
    const t = ev.target as Element
    const lbBtn = t.closest<HTMLElement>('[data-lb]')
    if (lbBtn) {
      const k = +lbBtn.dataset.lb!
      if (k) showShot(si + k)
      else lightbox()!.hidden = true
      return
    }
    if (t.classList.contains('pj-lb') || t.closest('.pj-lbf img')) {
      lightbox()!.hidden = true
      return
    }
    const sh = t.closest<HTMLElement>('.pj-shot')
    if (sh) return showShot(+sh.dataset.i!)
    if (t === d || t.closest('.pj-dx')) return d.close()
    const b = t.closest<HTMLElement>('[data-nav]')
    if (b && b.dataset.nav !== '') {
      const p = getVisible()[+b.dataset.nav!]
      fill(p)
      onNav(p)
    }
  })
  d.addEventListener('close', () => {
    document.documentElement.classList.remove('pj-lock')
    stop()
    onClose()
  })
  d.addEventListener('cancel', (ev) => {
    const L = lightbox()
    if (L && !L.hidden) {
      ev.preventDefault()
      L.hidden = true
    }
  })
  d.addEventListener('keydown', (ev) => {
    const L = lightbox()
    if (L && !L.hidden && (ev.key === 'ArrowLeft' || ev.key === 'ArrowRight'))
      showShot(si + (ev.key === 'ArrowRight' ? 1 : -1))
  })
  return {
    isOpen: () => d.open,
    current: () => cur,
    open(p) {
      fill(p)
      document.documentElement.classList.add('pj-lock')
      if (!d.open) d.showModal()
    },
    close() {
      if (d.open) d.close()
    },
    destroy() {
      stop()
      d.close()
      d.remove()
      document.documentElement.classList.remove('pj-lock')
    },
  }
}
