import { createRouter, createWebHashHistory } from 'vue-router'
import ProjectsRoute from '@/components/ProjectsRoute.vue'
import { authed } from '@/lib/admin'
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
    // Admin pages (superuser login). `meta.admin` renders them outside the site shell (see App.vue).
    {
      path: '/admin/login',
      name: 'AdminLogin',
      component: () => import('@/views/admin/AdminLogin.vue'),
      meta: { admin: true },
    },
    {
      path: '/admin',
      component: () => import('@/views/admin/AdminLayout.vue'),
      meta: { admin: true, auth: true },
      redirect: '/admin/projects',
      children: [
        {
          path: 'projects',
          name: 'AdminProjects',
          component: () => import('@/views/admin/AdminProjects.vue'),
        },
        {
          path: 'experience',
          name: 'AdminExperience',
          component: () => import('@/views/admin/AdminExperience.vue'),
        },
        {
          path: 'interests',
          name: 'AdminInterests',
          component: () => import('@/views/admin/AdminInterests.vue'),
        },
      ],
    },
    { path: '/:pathMatch(.*)*', redirect: '/' },
  ],
})

router.beforeEach((to) => {
  if (to.matched.some((r) => r.meta.auth) && !authed.value) return { name: 'AdminLogin' }
  if (to.name === 'AdminLogin' && authed.value) return '/admin'
})

router.afterEach((to, from) => {
  if (to.meta.admin) return
  if (to.name === 'Experience') page.value = 'experience'
  else if (to.name === 'Projects') page.value = 'projects'
  else if (to.name === 'ProjectDetail') {
    if (from.name !== 'ProjectDetail')
      page.value = window.history.state?.back === '/' ? 'home' : 'projects'
  } else page.value = 'home'
})

export default router
