import { esc, type Interest } from '@/lib/data'
import './offclock.css'

// Off the clock: staggered glass cards. Each card has a small CSS illustration (chosen by the record's `art`) and an optional stat.
// Hover/focus adds the holographic wash and chromatic text split.

const art = (it: Interest): string => {
  switch (it.art) {
    case 'language': {
      const p = it.phrase || ''
      const w = p.replace(/[.!?]+$/, '').split(/\s+/)
      return `<div class="sh-art a-lang" aria-hidden="true"><span>${esc(p)}</span><span>${esc(w[w.length - 1] || p)}</span><span>${esc((w[0] || p).toLowerCase())}…</span></div>`
    }
    case 'f1':
      return '<div class="sh-art a-f1" aria-hidden="true"><i style="--w:72%"></i><i style="--w:38%"></i><i style="--w:56%"></i></div>'
    case 'vinyl':
      return '<div class="sh-art a-vinyl" aria-hidden="true"><i></i></div>'
    case 'print': {
      const ws = [92, 88, 90, 84, 86, 80, 82, 76]
      return `<div class="sh-art a-print" aria-hidden="true">${ws.map((w, n) => `<i style="--w:${w}%;--n:${n}"></i>`).join('')}</div>`
    }
    case 'tech': {
      const nodes: [number, number][] = [
        [1, 0],
        [3, 0],
        [2, 1],
        [5, 1],
        [4, 2],
      ]
      const cols = 8
      const rows = 3
      const step = 1.05 * 16
      const cells = Array.from({ length: cols * rows }, (_, k) =>
        nodes.some(([c, r]) => r * cols + c === k) ? '<i class="n"></i>' : '<i></i>',
      ).join('')
      const pt = ([c, r]: [number, number]) => [c * step + 4, r * step + 4]
      const links = [
        [0, 2],
        [1, 2],
        [2, 3],
        [3, 4],
      ]
        .map(([a, b]) => {
          const [x1, y1] = pt(nodes[a])
          const [x2, y2] = pt(nodes[b])
          return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}"/>`
        })
        .join('')
      return `<div class="sh-art a-tech" aria-hidden="true">${cells}<svg aria-hidden="true">${links}</svg></div>`
    }
    default:
      return ''
  }
}

export function mount(host: HTMLElement, { items }: { items: Interest[] }): (() => void) | void {
  const card = (it: Interest, i: number) => {
    const s = it.stat
    const stat = s
      ? `<div class="sh-stat">${s.live ? '<span class="sh-live" aria-hidden="true"></span>' : ''}<span class="sh-val">${esc(s.value)}</span><span class="sh-lbl">${esc(s.label)}</span></div>`
      : ''
    return `<li class="sh-card" style="--i:${i}"><span class="sh-wash" aria-hidden="true"></span><span class="sh-edge" aria-hidden="true"></span><span class="sh-tag">${String(i + 1).padStart(2, '0')} / ${String(items.length).padStart(2, '0')}</span>${art(it)}<h3 class="sh-title">${esc(it.title)}</h3><p class="sh-line">${esc(it.line)}</p>${stat}</li>`
  }
  host.innerHTML = `<ul class="sh-grid">${items.map(card).join('')}</ul>`

  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches
  if (reduced || !('IntersectionObserver' in window)) return
  const cards = [...host.querySelectorAll('.sh-card')]
  host.classList.add('is-armed')
  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (!e.isIntersecting) continue
        e.target.classList.add('is-in')
        io.unobserve(e.target)
      }
    },
    { threshold: 0.15 },
  )
  cards.forEach((c) => io.observe(c))
  return () => {
    io.disconnect()
    host.classList.remove('is-armed')
  }
}
