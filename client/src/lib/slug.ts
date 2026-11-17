/** URL slug for a project: lower-case name, non-alphanumerics collapsed to "-". `#/projects/<slug>` opens the project dialog. */
export const slugOf = (p: { name: string }) =>
  p.name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
