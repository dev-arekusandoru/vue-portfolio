<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { reduce } from '@/lib/data'

/* Boot overlay: ~1.8s of typed lines, once per session (first load). Click or any key skips. Sets `html[data-boot=running]`
   while it runs and dispatches `window` event `boot-done` when it is over, or right away when there is no boot. */
const lines = ['Constantly scanning.', 'Interlinked.', 'Baseline established.']
const SEEN = 'boot-seen'

const seen = () => {
  try {
    return sessionStorage.getItem(SEEN) === '1'
  } catch {
    return false
  }
}
const markSeen = () => {
  try {
    sessionStorage.setItem(SEEN, '1')
  } catch {
    /* storage unavailable: the boot just plays again on the next load */
  }
}

const skipped = reduce || new URLSearchParams(location.search).get('boot') === '0' || seen()
const hidden = ref(true)
const out = ref(false)
const text = ref('')

const root = document.documentElement
let token = 0
const timers = new Set<number>()
const sleep = (ms: number) =>
  new Promise<void>((resolve) => {
    const t = window.setTimeout(() => {
      timers.delete(t)
      resolve()
    }, ms)
    timers.add(t)
  })
const later = (fn: () => void, ms: number) => {
  const t = window.setTimeout(() => {
    timers.delete(t)
    fn()
  }, ms)
  timers.add(t)
}

function done() {
  if (!root.dataset.boot) return
  delete root.dataset.boot
  dispatchEvent(new Event('boot-done'))
}

function end() {
  out.value = true
  later(() => {
    if (out.value) hidden.value = true
  }, 600)
  later(done, 220)
  removeEventListener('keydown', skip)
}
function skip() {
  token++
  end()
}

async function run() {
  const my = ++token
  markSeen()
  root.dataset.boot = 'running'
  text.value = ''
  out.value = false
  hidden.value = false
  addEventListener('keydown', skip, { once: true })
  for (const l of lines) {
    for (const ch of l) {
      if (my !== token) return
      text.value += ch
      await sleep(14)
    }
    text.value += '\n'
    await sleep(160)
  }
  if (my === token) {
    await sleep(250)
    if (my === token) end()
  }
}

onMounted(() => {
  if (skipped) dispatchEvent(new Event('boot-done'))
  else void run()
})
onBeforeUnmount(() => {
  token++
  timers.forEach(clearTimeout)
  timers.clear()
  removeEventListener('keydown', skip)
  delete root.dataset.boot
})
</script>

<template>
  <div id="boot" :hidden="hidden" :class="{ out }" role="status" aria-live="polite" @click="skip">
    <pre id="boot-text">{{ text }}</pre>
    <small>click or press any key to skip</small>
  </div>
</template>
