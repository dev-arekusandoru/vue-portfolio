<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted, useTemplateRef, watch } from 'vue'
import type { Page } from '@/lib/page'
import SiteHeader from './SiteHeader.vue'

const props = defineProps<{ page: Page }>()
const hero = useTemplateRef<HTMLElement>('hero')

/* hero glow warms on scroll */
let raf = 0
function onScroll() {
  cancelAnimationFrame(raf)
  raf = requestAnimationFrame(() => {
    const el = hero.value
    if (el) el.style.setProperty('--p', Math.min(1, scrollY / (el.offsetHeight || 1)).toFixed(3))
  })
}

onMounted(() => {
  addEventListener('scroll', onScroll, { passive: true })
  onScroll()
})
onBeforeUnmount(() => {
  cancelAnimationFrame(raf)
  removeEventListener('scroll', onScroll)
})
// the hero changes height between pages
watch(
  () => props.page,
  () => nextTick(onScroll),
)
</script>

<template>
  <div id="hero" ref="hero" class="hero-zone">
    <div class="glow" aria-hidden="true"></div>
    <div class="wrap">
      <SiteHeader :page="page" />
      <div v-if="page === 'home'" class="hero">
        <div class="frame">
          <h1>Alexandru<br />Muresan</h1>
          <p>
            Software engineer at SYSTOLIC who loves turning ideas into intuitive, user-friendly
            software. Right now that means web and mobile apps, including Ekklesia, which connects
            communities in fresh ways.
          </p>
        </div>
        <dl class="readout" aria-label="Current status">
          <div>
            <dt>Role</dt>
            <dd>Software engineer, SYSTOLIC</dd>
          </div>
          <div>
            <dt>Building</dt>
            <dd><span class="live-dot" aria-hidden="true"></span>Ekklesia</dd>
          </div>
          <div>
            <dt>Learning</dt>
            <dd>Romanian</dd>
          </div>
        </dl>
      </div>
    </div>
  </div>
</template>
