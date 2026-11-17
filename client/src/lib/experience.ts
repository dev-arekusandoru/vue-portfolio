// Monolith: one contract per frame, an establishing shot each. A rail module (emanator.ts) follows the scroll.
import './experience.css'
import { esc, reduce, range, dur, grpMeta, techName } from '@/lib/data'
import type { Employer } from '@/lib/data'
import { icon } from '@/lib/icons'
import type { FlatItem, Rail, RailState } from '@/lib/emanator'

let uid = 0

export interface ExperienceOptions {
  employers: Employer[]
  compact?: boolean
  rail: Rail
  foot?: string
}

export function mount(
  el: HTMLElement,
  { employers, compact = false, rail, foot = '' }: ExperienceOptions,
): () => void {
  const u = ++uid
  const flat: FlatItem[] = []
  employers.forEach((e) => e.contracts.forEach((c, ci) => flat.push({ e, c, ci, i: flat.length })))
  const n = flat.length
  if (!n) return () => {}

  const H = compact ? 'h3' : 'h2'
  const frameHTML = ({ e, c, ci, i }: FlatItem) => {
    const group = e.kind === 'group'
    const hid = `mo${u}-${i}-h`
    const live = c.current
    const total = e.contracts.length
    const dots = e.contracts
      .map((_, k) => `<i class="mo-ld${k <= ci ? ' past' : ''}${k === ci ? ' on' : ''}"></i>`)
      .join('')
    const plate =
      group && !compact
        ? `<div class="mo-lin mo-x" style="--d:0" role="group" aria-label="Employer: ${esc(e.name)}, contract ${ci + 1} of ${total}"><span class="mo-lk">Employer</span><span class="mo-lv">${esc(e.name)}</span><span class="mo-lg" aria-hidden="true"><span class="mo-dts">${dots}</span></span><span class="mo-ln"><span class="mo-cw">Contract </span>${ci + 1} of ${total}</span></div>${ci === 0 ? `<p class="mo-emp-meta mo-x" style="--d:40">${esc(grpMeta(e))}</p>${e.desc ? `<p class="mo-emp-desc mo-x" style="--d:60">${esc(e.desc)}</p>` : ''}` : ''}`
        : ''
    const strap =
      group && compact
        ? `<p class="mo-strap mo-x" style="--d:0"><span class="mo-sk">Employer</span><span class="mo-sv">${esc(e.name)}</span>${total > 1 ? `<span class="mo-sn"><span class="mo-cw">Contract </span>${ci + 1} of ${total}</span>` : ''}</p>`
        : ''
    const stack = c.skills
      .map(
        (s, k) =>
          `<li class="mo-x" style="--d:${300 + k * 45}"><span aria-hidden="true">${icon(s)}</span><span class="mo-cap">${esc(techName(s))}</span></li>`,
      )
      .join('')
    const pts = c.pts.length
      ? `<div class="mo-dtl mo-x" style="--d:${420 + c.skills.length * 45}"><button type="button" class="mo-more" aria-expanded="false" aria-controls="mo${u}-${i}-p"><span class="mo-pm" aria-hidden="true"></span><span class="mo-more-t">Show details<span class="sr"> for ${esc(c.co)}</span></span></button><div class="mo-panel" id="mo${u}-${i}-p"><div class="mo-pin"><ul class="mo-pts">${c.pts.map((p) => `<li>${esc(p)}</li>`).join('')}</ul></div></div></div>`
      : ''
    return `<article class="mo-frame${live ? ' mo-live' : ''}" data-i="${i}" aria-labelledby="${hid}">
      ${live ? '<div class="mo-scan" aria-hidden="true"></div>' : ''}
      <div class="mo-body">
        ${plate}${strap}
        <${H} class="mo-name mo-x" id="${hid}" tabindex="-1" data-t="${esc(c.co)}" style="--d:100">${esc(c.co)}</${H}>
        <p class="mo-meta mo-x" style="--d:220"><span class="mo-title">${esc(c.title)}</span><span>${esc(range(c))}</span><span>${esc(dur(c.start, c.end))}</span>${live ? '<span class="badge">Live</span>' : ''}</p>
        <p class="mo-lede mo-x" style="--d:300">${esc(c.headline)}</p>
        <ul class="mo-stack" aria-label="Technologies used at ${esc(c.co)}">${stack}</ul>
        ${pts}
      </div>
      ${!compact && i === n - 1 ? foot : ''}
    </article>`
  }

  el.innerHTML = `${compact ? '' : '<div class="mo-gut"></div>'}<div class="mo-frames">${flat.map(frameHTML).join('')}</div>${compact ? '' : '<div class="mo-bar"></div>'}`

  const frames = [...el.querySelectorAll<HTMLElement>('.mo-frame')]
  const cleanups: (() => void)[] = [() => (el.innerHTML = '')]

  /* animated scroll for rail jumps. Native scroll-snap is suspended while it runs and restored after (the target is a snap point, so nothing moves). Any user input cancels it. */
  const root = document.documentElement
  const inOutCubic = (p: number) => (p < 0.5 ? 4 * p ** 3 : 1 - (-2 * p + 2) ** 3 / 2)
  let glideRaf = 0
  let gliding = false
  const endGlide = () => {
    cancelAnimationFrame(glideRaf)
    if (!gliding) return
    gliding = false
    root.style.removeProperty('scroll-snap-type')
  }
  const glide = (to: number, ms: number) => {
    endGlide()
    const from = scrollY
    const dist = to - from
    if (reduce || Math.abs(dist) < 2) {
      scrollTo({ top: to, behavior: 'instant' })
      return
    }
    gliding = true
    root.style.scrollSnapType = 'none'
    let t0: number | undefined
    const step = (now: number) => {
      t0 ??= now
      const p = Math.min(1, (now - t0) / ms)
      scrollTo({ top: from + dist * inOutCubic(p), behavior: 'instant' })
      if (p < 1 && gliding) glideRaf = requestAnimationFrame(step)
      else endGlide()
    }
    glideRaf = requestAnimationFrame(step)
  }
  cleanups.push(endGlide)

  /* entrance: frames start hidden and play once as they scroll into view. While the boot overlay is up the entrance waits, so it plays as the overlay lifts instead of behind it. */
  if (!reduce) {
    el.classList.add('mo-armed')
    let io: IntersectionObserver | undefined
    const observe = () => {
      io?.disconnect()
      const obs = new IntersectionObserver(
        (entries) => {
          entries.forEach((en) => {
            if (!en.isIntersecting) return
            en.target.classList.add('mo-in')
            obs.unobserve(en.target)
          })
        },
        { rootMargin: '0px 0px -16% 0px', threshold: 0.1 },
      )
      io = obs
      frames.forEach((f) => obs.observe(f))
    }
    if (root.dataset.boot === 'running') addEventListener('boot-done', observe, { once: true })
    else observe()
    cleanups.push(() => {
      io?.disconnect()
      removeEventListener('boot-done', observe)
      el.classList.remove('mo-armed')
    })
  }

  /* details: collapsed on narrow screens until opened (wide screens show them always, see CSS) */
  const onClick = (ev: Event) => {
    const more = (ev.target as Element).closest<HTMLElement>('.mo-more')
    if (!more || !el.contains(more)) return
    const open = more.getAttribute('aria-expanded') !== 'true'
    more.setAttribute('aria-expanded', String(open))
    const label = more.querySelector('.mo-more-t')?.firstChild
    if (label) label.textContent = open ? 'Hide details' : 'Show details'
    el.querySelector(`#${more.getAttribute('aria-controls')}`)?.classList.toggle('mo-open', open)
  }
  el.addEventListener('click', onClick)
  cleanups.push(() => el.removeEventListener('click', onClick))

  /* progress shared with the rail. q is 0 when frame 0's top is at the top of the screen and n-1 at the last frame's top, linear in between, so a rail marker stays aligned however tall a frame grows. idx is the frame under the middle of the screen. */
  if (!compact) {
    const subs = new Set<(s: RailState) => void>()
    let state: RailState | null = null
    let raf = 0
    const compute = () => {
      raf = 0
      if (!el.getClientRects().length) return
      const y = scrollY
      const ref = innerHeight * 0.5
      const rects = frames.map((f) => f.getBoundingClientRect())
      let q = n - 1
      if (rects[0]!.top >= 0) q = 0
      else
        for (let k = 0; k < n - 1; k++) {
          const a = rects[k]!.top + y
          const b = rects[k + 1]!.top + y
          if (y < b) {
            q = k + Math.max(0, y - a) / (b - a || 1)
            break
          }
        }
      let idx = rects.findIndex((r) => ref < r.bottom)
      if (idx < 0) idx = n - 1
      const s = { q, idx }
      state = s
      subs.forEach((fn) => fn(s))
    }
    const queue = () => {
      if (!raf) raf = requestAnimationFrame(compute)
    }
    addEventListener('scroll', queue, { passive: true })
    addEventListener('resize', queue)
    const ro = new ResizeObserver(queue)
    ro.observe(el)
    cleanups.push(() => {
      removeEventListener('scroll', queue)
      removeEventListener('resize', queue)
      ro.disconnect()
      cancelAnimationFrame(raf)
    })

    const goTo = (i: number) => {
      const f = frames[i]
      if (!f) return
      const top = f.getBoundingClientRect().top + scrollY
      glide(top, Math.min(1000, 450 + Math.abs(top - scrollY) * 0.25))
      f.querySelector<HTMLElement>('.mo-name')?.focus({ preventScroll: true })
    }
    const subscribe = (fn: (s: RailState) => void) => {
      subs.add(fn)
      if (state) fn(state)
      return () => {
        subs.delete(fn)
      }
    }
    el.classList.add(`rail-${rail.id}`)
    const stop = rail.mount({
      el,
      gut: el.querySelector<HTMLElement>('.mo-gut'),
      bar: el.querySelector<HTMLElement>('.mo-bar'),
      flat,
      employers,
      n,
      frames,
      goTo,
      subscribe,
    })
    cleanups.push(() => {
      stop()
      el.classList.remove(`rail-${rail.id}`)
    })
    queue()

    /* any user input cancels a rail jump and hands control back to native snapping */
    const inputs = ['wheel', 'touchstart', 'keydown', 'pointerdown']
    inputs.forEach((t) => addEventListener(t, endGlide, { passive: true }))
    cleanups.push(() => inputs.forEach((t) => removeEventListener(t, endGlide)))
  }

  return () => cleanups.reverse().forEach((fn) => fn())
}
