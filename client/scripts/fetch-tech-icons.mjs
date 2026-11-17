// Downloads the monochrome tech icons listed in tech-icons.json from Iconify into src/assets/tech/<key>.svg.
// Run when adding a technology (`npm run icons`); the files are committed, so the build never calls Iconify.
// One request per icon set (the JSON endpoint), only for icons not on disk yet.
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { existsSync } from 'node:fs'

const dir = new URL('../src/assets/tech/', import.meta.url)
const map = JSON.parse(await readFile(new URL('./tech-icons.json', import.meta.url), 'utf8'))
await mkdir(dir, { recursive: true })
const fileOf = (key) => new URL(`${key.replace(/[^a-z0-9-]/g, '_')}.svg`, dir)

const bySet = {}
for (const [key, [set, name]] of Object.entries(map)) if (!existsSync(fileOf(key))) (bySet[set] ??= []).push([key, name])

let failed = 0
for (const [set, entries] of Object.entries(bySet)) {
  const res = await fetch(`https://api.iconify.design/${set}.json?icons=${entries.map(([, n]) => n).join(',')}`)
  if (!res.ok) { console.error(`✗ ${set} ${res.status}`); failed += entries.length; continue }
  const data = await res.json()
  for (const [key, name] of entries) {
    const i = data.icons?.[name]
    if (!i) { console.error(`✗ ${key} (${set}:${name}) not found`); failed++; continue }
    const w = i.width ?? data.width ?? 16
    const h = i.height ?? data.height ?? 16
    await writeFile(fileOf(key), `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}">${i.body}</svg>\n`)
    console.log(`✓ ${key}`)
  }
}
process.exit(failed ? 1 : 0)
