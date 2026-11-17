<script setup lang="ts">
import { ref, watch } from 'vue'
import { page } from '@/lib/page'
import HomePage from '@/views/HomePage.vue'
import Projects from '@/views/Projects.vue'

// Host for `/`, `/projects` and `/projects/:slug`: the dialog route renders the page it was opened from (see `page` in the router).
// While the route is being left for the experience page the last view stays, so it is not remounted as the other one.
const shown = ref<'home' | 'projects'>(page.value === 'home' ? 'home' : 'projects')
watch(page, (p) => {
  if (p !== 'experience') shown.value = p
})
</script>

<template>
  <HomePage v-if="shown === 'home'" />
  <Projects v-else />
</template>
