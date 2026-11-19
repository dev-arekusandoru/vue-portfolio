import { reduce } from '@/lib/data'

/* Page fade. While `html[data-entry='hold']` the page region (hero + routed view) is transparent (lib/entry.css);
   removing it fades the page back in. The header stays. Nothing runs under `prefers-reduced-motion`: the page just swaps.
   A page that never gets revealed (failed load) is shown by the failsafe timer, so it can never stay hidden. */
export const FADE_OUT = 220

const root = document.documentElement
let failsafe = 0
let delayed = 0

/** Fade the page out. Resolves once it is gone. `within` is the longest it may stay hidden waiting for `playEntry` (ms). */
export function holdEntry(within = 1500): Promise<void> {
  if (reduce) return Promise.resolve()
  clearTimeout(failsafe)
  clearTimeout(delayed)
  root.dataset.entry = 'hold'
  failsafe = window.setTimeout(() => playEntry(), within)
  return new Promise((done) => setTimeout(done, FADE_OUT))
}

/** Fade the page in, `delay` ms from now. Waits for the boot overlay if it is still running. */
export function playEntry(delay = 0) {
  if (root.dataset.entry !== 'hold') return
  if (root.dataset.boot) {
    addEventListener('boot-done', () => playEntry(delay), { once: true })
    return
  }
  clearTimeout(failsafe)
  clearTimeout(delayed)
  delayed = window.setTimeout(() => delete root.dataset.entry, delay)
}
