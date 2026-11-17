<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { loadPortfolio } from '@/lib/data'
import { slugOf } from '@/lib/slug'
import { visibleProjects } from '@/lib/projectNav'
import { mount } from '@/lib/projects'
import * as tech from '@/lib/filters/tech'

defineOptions({ name: 'ProjectsView' })

const { projects } = await loadPortfolio()
const router = useRouter()
const host = ref<HTMLElement>()
let unmount: (() => void) | undefined

onMounted(() => {
  unmount = mount(host.value!, {
    projects,
    filter: tech,
    open: (p) => void router.push(`/projects/${slugOf(p)}`),
    onVisible: (v) => (visibleProjects.value = v),
  })
})
onBeforeUnmount(() => {
  unmount?.()
  visibleProjects.value = []
})
</script>

<template>
  <h1 class="sr">Projects</h1>
  <section class="sec tight" aria-label="All projects"><div ref="host"></div></section>
</template>
