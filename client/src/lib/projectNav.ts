import { shallowRef } from 'vue'
import type { Project } from './data'

/** The Projects page's currently visible (filtered) list, for prev/next in the dialog. Empty means "all projects". */
export const visibleProjects = shallowRef<Project[]>([])
