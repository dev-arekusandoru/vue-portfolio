import { ref } from 'vue'

export type Page = 'home' | 'projects' | 'experience'

/** The page actually shown, set by the router on every navigation. A project dialog (`/projects/:slug`) keeps the page it was
 *  opened from: home when reached from `#/`, else the projects page (also on a direct load). Prev/next inside the dialog keeps it. */
export const page = ref<Page>('home')
