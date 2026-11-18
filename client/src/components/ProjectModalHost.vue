<script setup lang="ts">
import { computed, onMounted, shallowRef } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import ProjectDialog from '@/components/ProjectDialog.vue'
import { loadPortfolio, type Project } from '@/lib/data'
import { slugOf } from '@/lib/slug'
import { visibleProjects } from '@/lib/projectNav'

// The one project dialog. Driven only by the route param `slug` (/projects/:slug); opening is a pushed history entry
// (made by the link that was clicked), so Back closes it. Closing the dialog itself returns to where it was opened from.
const route = useRoute()
const router = useRouter()

const all = shallowRef<Project[]>([])
onMounted(async () => (all.value = (await loadPortfolio()).projects))

const project = computed(() => {
  const s = route.params.slug
  return typeof s === 'string' ? (all.value.find((x) => slugOf(x) === s) ?? null) : null
})
const list = computed(() => (visibleProjects.value.length ? visibleProjects.value : all.value))

const onClosed = () => {
  // closed by the route (Back, or a link elsewhere): nothing to do
  if (!route.params.slug) return
  // closed by the user: opened from inside the app, the previous history entry is the page it came from
  if (history.state?.back) router.back()
  else void router.replace('/projects')
}
</script>

<template>
  <ProjectDialog
    :project="project"
    :list="list"
    @nav="(p) => router.replace(`/projects/${slugOf(p)}`)"
    @closed="onClosed"
  />
</template>
