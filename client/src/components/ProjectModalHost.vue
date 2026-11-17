<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { loadPortfolio, type Project } from '@/lib/data'
import { slugOf } from '@/lib/slug'
import { visibleProjects } from '@/lib/projectNav'
import { dialog, type ProjectDialog } from '@/lib/detail'

// The one project dialog. Driven only by the route param `slug` (/projects/:slug); opening is a pushed history entry
// (made by the link that was clicked), so Back closes it. Closing the dialog itself returns to where it was opened from.
const route = useRoute()
const router = useRouter()
const host = ref<HTMLElement>()

let all: Project[] = []
let modal: ProjectDialog | undefined
let closingFromRoute = false
let dead = false

const visible = () => (visibleProjects.value.length ? visibleProjects.value : all)

const sync = () => {
  if (!modal) return
  const s = route.params.slug
  const slug = typeof s === 'string' ? s : null
  const p = slug ? all.find((x) => slugOf(x) === slug) : undefined
  if (p) {
    if (modal.current() !== p || !modal.isOpen()) modal.open(p)
  } else if (modal.isOpen()) {
    closingFromRoute = true
    modal.close()
  }
}

onMounted(async () => {
  all = (await loadPortfolio()).projects
  if (dead) return
  modal = dialog(host.value!, {
    getVisible: visible,
    onNav: (p) => void router.replace(`/projects/${slugOf(p)}`),
    onClose: () => {
      if (dead || closingFromRoute) {
        closingFromRoute = false
        return
      }
      if (!route.params.slug) return
      // opened from inside the app: the previous history entry is the page it came from
      if (history.state?.back) router.back()
      else void router.replace('/projects')
    },
  })
  sync()
})
watch(() => route.params.slug, sync)
onBeforeUnmount(() => {
  dead = true
  modal?.destroy()
  modal = undefined
})
</script>

<template>
  <div ref="host"></div>
</template>
