<script setup lang="ts">
import { onBeforeUnmount, onMounted, reactive, ref } from 'vue'
import ExperienceFrame from '@/components/ExperienceFrame.vue'
import { reduce, type Employer } from '@/lib/data'
import * as emanator from '@/lib/emanator'
import type { FlatItem, RailState } from '@/lib/emanator'
import '@/lib/experience.css'

// Monolith: one contract per frame, an establishing shot each. The rail (lib/emanator) follows the scroll.
// Frames, their entrance and the details toggles are Vue; scroll geometry (progress shared with the rail, animated rail
// jumps) and the rail itself are imperative, as they are per-frame measurements.
const props = defineProps<{ employers: Employer[]; compact?: boolean }>()

const flat: FlatItem[] = []
props.employers.forEach((e) =>
  e.contracts.forEach((c, ci) => flat.push({ e, c, ci, i: flat.length })),
)
const n = flat.length

const root = ref<HTMLElement>()
const gut = ref<HTMLElement>()
const bar = ref<HTMLElement>()
const frameRefs = ref<{ $el: HTMLElement }[]>([])

/* entrance: frames start hidden and play once as they scroll into view. Frames already in view when the page loads
   (`still`) just appear: the page entry (lib/entry.ts) is their entrance. While the boot overlay is up the entrance
   waits, so frames settle as the overlay lifts instead of behind it. */
const armed = !reduce
const entered = reactive(flat.map(() => false))
const still = reactive(flat.map(() => false))

const doc = document.documentElement
const cleanups: (() => void)[] = []
onBeforeUnmount(() => cleanups.reverse().forEach((fn) => fn()))

onMounted(() => {
  if (!n) return
  const frames = frameRefs.value.map((f) => f.$el)

  if (armed) {
    let io: IntersectionObserver | undefined
    const observe = () => {
      io?.disconnect()
      frames.forEach((f, i) => {
        if (f.getBoundingClientRect().top < innerHeight * 0.84) {
          still[i] = true
          entered[i] = true
        }
      })
      const obs = new IntersectionObserver(
        (entries) => {
          entries.forEach((en) => {
            if (!en.isIntersecting) return
            entered[frames.indexOf(en.target as HTMLElement)] = true
            obs.unobserve(en.target)
          })
        },
        { rootMargin: '0px 0px -16% 0px', threshold: 0.1 },
      )
      io = obs
      frames.forEach((f, i) => {
        if (!entered[i]) obs.observe(f)
      })
    }
    if (doc.dataset.boot === 'running') addEventListener('boot-done', observe, { once: true })
    else observe()
    cleanups.push(() => {
      io?.disconnect()
      removeEventListener('boot-done', observe)
    })
  }
  if (props.compact) return

  /* animated scroll for rail jumps. Native scroll-snap is suspended while it runs and restored after (the target is a
     snap point, so nothing moves). Any user input cancels it. */
  const inOutCubic = (p: number) => (p < 0.5 ? 4 * p ** 3 : 1 - (-2 * p + 2) ** 3 / 2)
  let glideRaf = 0
  let gliding = false
  const endGlide = () => {
    cancelAnimationFrame(glideRaf)
    if (!gliding) return
    gliding = false
    doc.style.removeProperty('scroll-snap-type')
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
    doc.style.scrollSnapType = 'none'
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

  /* progress shared with the rail. q is 0 when frame 0's top is at the top of the screen and n-1 at the last frame's top,
     linear in between, so a rail marker stays aligned however tall a frame grows. idx is the frame under the middle of the screen. */
  const el = root.value!
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
  cleanups.push(
    emanator.mount({
      el,
      gut: gut.value ?? null,
      bar: bar.value ?? null,
      flat,
      employers: props.employers,
      n,
      frames,
      goTo,
      subscribe,
    }),
  )
  queue()

  /* any user input cancels a rail jump and hands control back to native snapping */
  const inputs = ['wheel', 'touchstart', 'keydown', 'pointerdown']
  inputs.forEach((t) => addEventListener(t, endGlide, { passive: true }))
  cleanups.push(() => inputs.forEach((t) => removeEventListener(t, endGlide)))
})
</script>

<template>
  <div
    v-if="n"
    ref="root"
    class="xv xv-monolith"
    :class="{ 'xv-compact': compact, 'mo-armed': armed, [`rail-${emanator.id}`]: !compact }"
  >
    <div v-if="!compact" ref="gut" class="mo-gut"></div>
    <div class="mo-frames">
      <ExperienceFrame
        v-for="item in flat"
        :key="item.i"
        ref="frameRefs"
        :item="item"
        :total="item.e.contracts.length"
        :compact="!!compact"
        :entered="entered[item.i]"
        :still="still[item.i]"
      >
        <footer v-if="!compact && item.i === n - 1" class="mo-foot">
          <span>© 2025 Alexandru Muresan</span>
        </footer>
      </ExperienceFrame>
    </div>
    <div v-if="!compact" ref="bar" class="mo-bar"></div>
  </div>
</template>
