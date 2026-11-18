<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, useTemplateRef } from 'vue'
import type { Page } from '@/lib/page'
import NavLink from './NavLink.vue'
import NavMark from './NavMark.vue'
import NavReadout from './NavReadout.vue'
import { home, links, resume } from './links'

const props = defineProps<{ page: Page; time: string }>()

const routes = [home, ...links]
const here = computed(() => routes.find((r) => r.page === props.page) ?? home)
const dlg = useTemplateRef<HTMLDialogElement>('dlg')

/* native modal <dialog>: focus trap, Esc and inert page come with it; focus returns to the toggle on close.
   Closing plays the exit first: `data-closing` starts it, and `--nv-out` (ms, set in menu.css) says how long it runs. */
const closing = ref(false)
let timer = 0
const reduce = matchMedia('(prefers-reduced-motion: reduce)')
const show = () => {
  closing.value = false
  dlg.value?.showModal()
}
const shut = () => {
  clearTimeout(timer)
  dlg.value?.close()
}
const hide = () => {
  const d = dlg.value
  if (!d?.open || closing.value) return
  const out = parseFloat(getComputedStyle(d).getPropertyValue('--nv-out')) || 0
  if (reduce.matches || !out) return shut()
  closing.value = true
  timer = window.setTimeout(shut, out)
}

/* the toggle disappears at desktop width; an open index would otherwise strand the inert page */
const wide = matchMedia('(min-width: 961px)')
const onWide = () => wide.matches && shut()
onMounted(() => wide.addEventListener('change', onWide))
onBeforeUnmount(() => {
  wide.removeEventListener('change', onWide)
  clearTimeout(timer)
})
</script>

<template>
  <button type="button" class="nv-toggle" aria-haspopup="dialog" @click="show">
    <span class="nv-here"
      ><i>{{ here.idx }}</i
      >{{ here.label }}</span
    ><span class="sr"> — open site index</span>
    <svg viewBox="0 0 12 12" width="14" height="14" fill="currentColor" aria-hidden="true">
      <path d="M1 1h3v3H1zM8 1h3v3H8zM1 8h3v3H1zM8 8h3v3H8zM4.5 4.5h3v3h-3z" />
    </svg>
  </button>

  <dialog
    ref="dlg"
    class="nv-index"
    aria-label="Site index"
    :data-closing="closing || undefined"
    @close="closing = false"
    @cancel.prevent="hide"
  >
    <!-- same geometry as the bar, so opening and closing swap content in place -->
    <div class="nv">
      <div class="nv-box">
        <span class="nv-cell nv-brand" aria-hidden="true"><NavMark /></span>
        <button type="button" class="nv-toggle" @click="hide">
          <span class="nv-here">// Site index</span><span class="sr"> — close</span>
          <svg
            viewBox="0 0 12 12"
            width="14"
            height="14"
            fill="none"
            stroke="currentColor"
            stroke-width="1.4"
            aria-hidden="true"
          >
            <path pathLength="1" d="m2 2 8 8" />
            <path pathLength="1" d="M10 2l-8 8" />
          </svg>
        </button>
      </div>
    </div>

    <nav class="nv-list" aria-label="Primary">
      <ol>
        <li v-for="(r, n) in routes" :key="r.to" :style="{ '--n': n }">
          <NavLink :to="r.to" :current="page === r.page" class="nv-row" @click="hide"
            ><i>{{ r.idx }}</i
            ><span>{{ r.label }}</span
            ><em aria-hidden="true">{{ page === r.page ? '◂ now' : '' }}</em></NavLink
          >
        </li>
        <li :style="{ '--n': routes.length }">
          <a :href="resume.href" target="_blank" rel="noopener" class="nv-row" @click="hide"
            ><i>{{ resume.idx }}</i
            ><span>{{ resume.label }}</span
            ><em aria-hidden="true">↗</em><span class="sr"> (PDF, opens in a new tab)</span></a
          >
        </li>
      </ol>
    </nav>

    <div class="nv-foot"><NavReadout :time="time" /></div>
  </dialog>
</template>
