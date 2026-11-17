import { createRouter, createWebHashHistory } from 'vue-router'
import ProjectsRoute from '@/components/ProjectsRoute.vue'
import { page } from '@/lib/page'

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    // `/`, `/projects` and `/projects/:slug` share one component so that opening the dialog over the home page
    // patches the page behind it instead of remounting it. It renders the home or the projects view from `page`.
    { path: '/', name: 'Home', component: ProjectsRoute },
    { path: '/projects', name: 'Projects', component: ProjectsRoute },
    { path: '/projects/:slug', name: 'ProjectDetail', component: ProjectsRoute },
    { path: '/experience', name: 'Experience', component: () => import('@/views/Experience.vue') },
    { path: '/:pathMatch(.*)*', redirect: '/' },
  ],
})

router.afterEach((to, from) => {
  if (to.name === 'Experience') page.value = 'experience'
  else if (to.name === 'Projects') page.value = 'projects'
  else if (to.name === 'ProjectDetail') {
    if (from.name !== 'ProjectDetail')
      page.value = window.history.state?.back === '/' ? 'home' : 'projects'
  } else page.value = 'home'
})

export default router
