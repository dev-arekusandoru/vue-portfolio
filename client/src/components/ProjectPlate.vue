<script setup lang="ts">
import { computed } from 'vue'
import { icon } from '@/lib/icons'
import { slugOf } from '@/lib/slug'
import type { Project } from '@/lib/data'
import '@/assets/plates.css'

const props = defineProps<{ project: Project }>()
const style = computed(() => {
  const p = props.project
  return { '--a1': p.pal[0], '--a2': p.pal[1], '--a3': p.pal[2], '--pa': p.accent }
})
const icons = computed(() => props.project.stack.slice(0, 6).map(icon).join(''))
</script>

<template>
  <RouterLink class="spec" :to="`/projects/${slugOf(project)}`" :style="style">
    <div class="spec-art">
      <img v-if="project.cover" :src="project.cover" alt="" loading="lazy" decoding="async" />
      <span v-else aria-hidden="true">{{ project.name[0] }}</span>
    </div>
    <div class="spec-body">
      <header class="spec-head">
        <span class="yr">{{ project.start.getUTCFullYear() }}</span>
        <h3>{{ project.name }}</h3>
        <span class="st" :class="project.current ? 'live' : 'off'">{{
          project.current ? 'Active' : 'Shipped'
        }}</span>
      </header>
      <p>{{ project.headline }}</p>
      <div class="plate-ic" v-html="icons"></div>
    </div>
  </RouterLink>
</template>
