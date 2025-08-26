import { createRouter, createWebHashHistory } from 'vue-router'
import HomePage from '../views/HomePage.vue'
import Experience from '../views/Experience.vue'
import Projects from '../views/Projects.vue'
import Resume from '../views/Resume.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: HomePage,
  },
  {
    path: '/experience',
    name: 'Experience',
    component: Experience,
  },
  {
    path: '/projects',
    name: 'Projects',
    component: Projects,
  },
  {
    path: '/resume',
    name: 'Resume',
    component: Resume,
  },
]

const router = createRouter({
  history: createWebHashHistory(),
  routes,
})

export default router
