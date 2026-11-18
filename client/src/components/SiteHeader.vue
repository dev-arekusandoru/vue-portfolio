<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import NavLink from '@/components/nav/NavLink.vue'
import NavMark from '@/components/nav/NavMark.vue'
import NavMenu from '@/components/nav/NavMenu.vue'
import NavReadout from '@/components/nav/NavReadout.vue'
import { links, resume } from '@/components/nav/links'
import { useClock } from '@/components/nav/useClock'
import type { Page } from '@/lib/page'
import '@/lib/nav/nav.css'
import '@/lib/nav/menu.css'

defineProps<{ page: Page }>()

const time = useClock()

/* the bar is fixed and compacts once the page has scrolled; `.top-slot` keeps its row so the layout never shifts */
const compact = ref(false)
let raf = 0
const onScroll = () => {
  cancelAnimationFrame(raf)
  raf = requestAnimationFrame(() => (compact.value = scrollY > 40))
}
onMounted(() => {
  addEventListener('scroll', onScroll, { passive: true })
  onScroll()
})
onBeforeUnmount(() => {
  cancelAnimationFrame(raf)
  removeEventListener('scroll', onScroll)
})
</script>

<template>
  <div class="top-slot"></div>
  <!-- the fixed bar sits outside the page's stacking contexts, so it stays above the content -->
  <Teleport to="#site" defer>
    <header class="top-bar" :data-compact="compact || undefined">
      <div class="nv">
        <div class="nv-box">
          <NavLink to="/" class="nv-cell nv-brand" aria-label="Home" :current="page === 'home'"
            ><NavMark
          /></NavLink>
          <nav aria-label="Primary">
            <NavLink
              v-for="l in links"
              :key="l.to"
              :to="l.to"
              class="nv-cell"
              :current="page === l.page"
              ><i>{{ l.idx }}</i
              >{{ l.label }}</NavLink
            >
            <a :href="resume.href" target="_blank" rel="noopener" class="nv-cell"
              ><i>{{ resume.idx }}</i
              >{{ resume.label }}<span aria-hidden="true">↗</span
              ><span class="sr"> (PDF, opens in a new tab)</span></a
            >
          </nav>
          <NavReadout :time="time" />
          <NavMenu :page="page" :time="time" />
        </div>
      </div>
    </header>
  </Teleport>
</template>
