<script setup lang="ts">
import ExperienceTimeline from '@/components/ExperienceTimeline.vue'
import { loadPortfolio } from '@/lib/data'

defineOptions({
  name: 'ExperienceView',
})

const data = await loadPortfolio()
</script>

<template>
  <h1 class="sr">Experience</h1>
  <section class="sec flush" aria-label="All experience">
    <ExperienceTimeline :employers="data.employers" />
  </section>
</template>
