<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import ExperienceTimeline from '@/components/ExperienceTimeline.vue'
import ProjectPlate from '@/components/ProjectPlate.vue'
import { loadPortfolio } from '@/lib/data'
import { mount } from '@/lib/offclock'

const data = await loadPortfolio()
const recent = data.projects.slice(0, 3)
const current = data.currentEmployers()
const oc = ref<HTMLElement | null>(null)
let unmount: (() => void) | void

onMounted(() => {
  if (oc.value) unmount = mount(oc.value, { items: data.interests })
})
onBeforeUnmount(() => unmount?.())
</script>

<template>
  <div>
    <section class="sec" aria-labelledby="h-recent">
      <div class="sec-head">
        <h2 id="h-recent">Recent projects</h2>
        <RouterLink class="more" to="/projects"
          >All projects ({{ data.projects.length }})</RouterLink
        >
      </div>
      <div class="specs plates">
        <ProjectPlate v-for="p in recent" :key="p.id" :project="p" />
      </div>
    </section>
    <section class="sec" aria-labelledby="h-now">
      <div class="sec-head">
        <h2 id="h-now">Current role</h2>
        <RouterLink class="more" to="/experience">Full experience</RouterLink>
      </div>
      <ExperienceTimeline compact :employers="current" />
    </section>
    <section class="sec" aria-labelledby="h-off">
      <div class="sec-head"><h2 id="h-off">Off the clock</h2></div>
      <div ref="oc" class="oc oc-shards"></div>
    </section>
  </div>
</template>
