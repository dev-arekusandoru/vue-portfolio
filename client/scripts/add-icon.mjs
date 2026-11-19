// Usage: npm run add-icon -- "<tech>" [iconify-name] [iconify-set]
// Adds/updates the entry in tech-icons.json, then downloads the SVG (runs fetch-tech-icons.mjs).
// iconify-name defaults to the tech name, iconify-set to simple-icons.
import { readFile, writeFile, rm } from 'node:fs/promises'
import { spawnSync } from 'node:child_process'

const [tech, name, set = 'simple-icons'] = process.argv.slice(2)
if (!tech) {
  console.error('usage: npm run add-icon -- "<tech>" [iconify-name] [iconify-set]')
  process.exit(1)
}

const key = tech.trim().toLowerCase()
const iconName = (name ?? key).trim().toLowerCase().replace(/\s+/g, '')
const file = new URL('./tech-icons.json', import.meta.url)
const map = JSON.parse(await readFile(file, 'utf8'))
map[key] = [set, iconName]
await writeFile(file, JSON.stringify(map, null, 1) + '\n')
console.log(`+ "${key}": ["${set}", "${iconName}"]`)

// Drop any stale SVG so an updated mapping is re-fetched.
await rm(new URL(`../src/assets/tech/${key.replace(/[^a-z0-9-]/g, '_')}.svg`, import.meta.url), { force: true })

const r = spawnSync('node', [new URL('./fetch-tech-icons.mjs', import.meta.url).pathname], { stdio: 'inherit' })
process.exit(r.status ?? 1)
