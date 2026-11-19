<script setup lang="ts">
import { nextTick, onBeforeUnmount, onErrorCaptured, ref } from 'vue'
import { START_LOCATION, useRouter } from 'vue-router'
import ProjectModalHost from '@/components/ProjectModalHost.vue'
import SiteBoot from '@/components/SiteBoot.vue'
import SiteHero from '@/components/SiteHero.vue'
import { holdEntry, playEntry } from '@/lib/entry'
import { page, type Page } from '@/lib/page'
import '@/lib/entry.css'

const titles: Record<Page, string> = {
  home: 'Alexandru Muresan',
  projects: 'Projects — Alexandru Muresan',
  experience: 'Experience — Alexandru Muresan',
}

const router = useRouter()
const error = ref<unknown>(null)

/* `html[data-route]` and the title follow the page actually shown; a switch between pages starts at the top
   (opening or closing the project dialog stays on the same page). The router sets `page` before this runs.
   A switch is applied after the new view has rendered (data is cached after the first load, so that is within a frame):
   while the old page is still on screen, the new page's route rules (scroll snap) would act on it and leave the
   scroll position somewhere in the middle. */
let shown: Page | null = null

/* page fade (lib/entry.ts): the first load is hidden until the first view is on screen (and the boot is over).
   A switch between pages fades the old one out before the router swaps the view, and the new one in once it is
   applied. When the site index is still folding away, the fade-in waits for it. Opening the project dialog is not a switch. */
holdEntry(6000)
let entered = false
const onResolve = async () => {
  if (entered) return
  entered = true
  await new Promise(requestAnimationFrame)
  playEntry()
}
const apply = () => {
  if (page.value === shown) return
  document.documentElement.dataset.route = page.value
  document.title = titles[page.value]
  if (shown) scrollTo({ top: 0, behavior: 'instant' })
  shown = page.value
}
// Mounted after the first navigation finished (coming back from the admin pages): the router hooks below missed it.
if (router.currentRoute.value !== START_LOCATION) apply()
const target = (name: unknown): Page | null =>
  name === 'Experience'
    ? 'experience'
    : name === 'Projects'
      ? 'projects'
      : name === 'Home'
        ? 'home'
        : null
const unguard = router.beforeEach(async (to, from) => {
  if (from === START_LOCATION) return
  const next = target(to.name)
  if (next && next !== page.value) await holdEntry()
})
const stop = router.afterEach(async () => {
  error.value = null
  if (shown === null) return apply()
  if (page.value === shown) return
  await nextTick()
  await new Promise(requestAnimationFrame)
  apply()
  playEntry(document.querySelector('.nv-index[data-closing]') ? 480 : 0)
})
onBeforeUnmount(() => {
  stop()
  unguard()
})

/* a failed data load (PocketBase unreachable) replaces the page with a readable message instead of a blank page */
onErrorCaptured((err) => {
  console.error(err)
  error.value = err
  playEntry()
  return false
})
const reload = () => location.reload()
</script>

<template>
  <div id="site" class="site">
    <div class="grain" aria-hidden="true"></div>
    <SiteBoot />
    <SiteHero :page="page" />
    <div class="wrap">
      <div v-if="error" class="page-error" role="alert">
        <strong>Couldn’t load this page.</strong>
        <p>The data service isn’t reachable right now. Check your connection and try again.</p>
        <button type="button" @click="reload">Reload</button>
      </div>
      <Suspense v-else @resolve="onResolve">
        <RouterView />
        <template #fallback>
          <p class="page-status" role="status">Loading…</p>
        </template>
      </Suspense>
      <footer class="foot"><span>© 2025 Alexandru Muresan</span></footer>
    </div>
    <ProjectModalHost />
  </div>
</template>
