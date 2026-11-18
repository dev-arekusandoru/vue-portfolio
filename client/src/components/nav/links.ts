import type { Page } from '@/lib/page'

export type Route = { to: string; page: Page; label: string; idx: string }

export const home: Route = { to: '/', page: 'home', label: 'Home', idx: '00' }

export const links: Route[] = [
  { to: '/experience', page: 'experience', label: 'Experience', idx: '01' },
  { to: '/projects', page: 'projects', label: 'Projects', idx: '02' },
]

export const resume = { href: '/Muresan_Alexandru_Resume_2025.pdf', label: 'Resume', idx: '03' }
