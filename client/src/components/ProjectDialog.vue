<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import StatusPill from '@/components/StatusPill.vue'
import TechIcon from '@/components/TechIcon.vue'
import { reduce, techName, type Project } from '@/lib/data'
import '@/lib/detail.css'

// Project detail dialog, drafting-table treatment: faint grid, cover plate and figure captions, a title block for the
// at-a-glance facts, and a boot build-up when it opens. One native <dialog>; its content is swapped per project.
// The parent decides what is open (`project`); this reports prev/next picks and a close the user made.
const props = defineProps<{
  /** open while set */
  project: Project | null
  /** the list prev/next walk (the Projects page's filtered list, or all projects) */
  list: Project[]
}>()
const emit = defineEmits<{
  /** prev/next picked another project */
  nav: [p: Project]
  /** the dialog closed (Esc, close button, backdrop, or because `project` was cleared) */
  closed: []
}>()

const dlg = ref<HTMLDialogElement>()

/* ---- derived facts ---- */
const mon = (d: Date) =>
  d.toLocaleDateString('en-US', { month: 'short', year: 'numeric', timeZone: 'UTC' })
const period = (p: Project) =>
  `${mon(p.start)} – ${p.current ? 'Present' : p.end ? mon(p.end) : mon(p.start)}`
const caption = (k: number, name: string) => `FIG. ${String(k).padStart(2, '0')} — ${name}`
const demoUrl = (u: string) => (/^https?:/.test(u) ? u : `https://${u}`)

const index = computed(() => (props.project ? props.list.indexOf(props.project) : -1))
const prev = computed(() => (index.value > 0 ? props.list[index.value - 1]! : null))
const next = computed(() => (index.value >= 0 ? (props.list[index.value + 1] ?? null) : null))

const style = computed(() => {
  const p = props.project
  return p ? { '--a1': p.pal[0], '--a2': p.pal[1], '--a3': p.pal[2], '--pa': p.accent } : undefined
})

interface Cell {
  cls: string
  label: string
  text?: string
  metric?: { value: string; label: string }
}
const cells = computed<Cell[]>(() => {
  const p = props.project
  if (!p) return []
  const i = Math.max(index.value, 0)
  const dwg = `${[...p.name]
    .filter((c) => /[a-z0-9]/i.test(c))
    .slice(0, 3)
    .join('')
    .toUpperCase()}-${String(p.start.getUTCFullYear() % 100).padStart(2, '0')}${String(i + 1).padStart(2, '0')}`
  return [
    { cls: '', label: 'Role', text: p.role },
    { cls: '', label: 'Kind', text: p.kind },
    { cls: '', label: 'Period', text: period(p) },
    ...(p.metric ? [{ cls: 'res s2', label: 'Result', metric: p.metric }] : []),
    { cls: '', label: 'State', text: p.current ? 'In service' : 'Released' },
    { cls: p.metric ? 'dw s2' : 'dw', label: 'Dwg no.', text: dwg },
    { cls: '', label: 'Sheet', text: `${i + 1} / ${props.list.length}` },
  ]
})

/** body sections in order; their index is the stagger (`--si`) of the build-up */
const sections = computed(() => {
  const p = props.project
  if (!p) return []
  return [
    'highlights',
    ...(p.challenges ? ['hard'] : []),
    ...(p.screenshots.length ? ['screens'] : []),
    'tech',
    ...(p.demo_url || p.code_url ? ['links'] : []),
  ] as ('highlights' | 'hard' | 'screens' | 'tech' | 'links')[]
})

/* ---- build-up: the title types in while the sheet draws ---- */
const playing = ref(false)
const typing = ref(false)
const typed = ref('')
let tPlay = 0
let tType = 0
const stopPlay = () => {
  clearTimeout(tPlay)
  clearTimeout(tType)
  playing.value = false
  typing.value = false
}
const typewriter = (full: string) => {
  let k = 0
  const step = () => {
    k++
    typed.value = full.slice(0, k)
    if (k < full.length) tType = window.setTimeout(step, (1000 / Math.max(full.length, 12)) * 0.7)
    else tType = window.setTimeout(() => (typing.value = false), 500)
  }
  tType = window.setTimeout(step, 350)
  tPlay = window.setTimeout(() => (playing.value = false), 3600)
}

/* ---- screenshot lightbox ---- */
const lb = ref<number | null>(null)
const shots = computed(() => props.project?.screenshots ?? [])
const showShot = (k: number) => {
  if (!shots.value.length) return
  lb.value = (k + shots.value.length) % shots.value.length
}
const lbStep = (k: number) => showShot((lb.value ?? 0) + k)
const onCancel = (ev: Event) => {
  if (lb.value === null) return
  ev.preventDefault() // Esc closes the lightbox first
  lb.value = null
}
const onKeydown = (ev: KeyboardEvent) => {
  if (lb.value !== null && (ev.key === 'ArrowLeft' || ev.key === 'ArrowRight'))
    lbStep(ev.key === 'ArrowRight' ? 1 : -1)
}

/* ---- open / swap / close ---- */
const lock = (on: boolean) => document.documentElement.classList.toggle('pj-lock', on)
let dead = false
const onClose = () => {
  lock(false)
  stopPlay()
  if (!dead) emit('closed')
}
const present = async (p: Project) => {
  const d = dlg.value!
  stopPlay()
  lb.value = null
  typed.value = p.name
  await nextTick() // the new content is in, with the build-up classes off
  if (props.project !== p) return
  if (!d.open) lock(true)
  void d.offsetWidth // restart the build-up
  if (!reduce) {
    typed.value = ''
    playing.value = true
    typing.value = true
  }
  await nextTick()
  if (props.project !== p) return
  if (!d.open) d.showModal()
  if (!reduce) typewriter(p.name)
}
onMounted(() => {
  if (props.project) void present(props.project)
})
watch(
  () => props.project,
  (p) => {
    if (p) void present(p)
    else if (dlg.value?.open) dlg.value.close()
  },
)
onBeforeUnmount(() => {
  dead = true
  stopPlay()
  if (dlg.value?.open) dlg.value.close()
  lock(false)
})
</script>

<template>
  <dialog
    ref="dlg"
    class="pj-dlg bp-grid bp-fig"
    :class="{ 'bp-play': playing, 'bp-typing': typing }"
    aria-labelledby="pj-dt"
    :style="style"
    @click.self="dlg!.close()"
    @close="onClose"
    @cancel="onCancel"
    @keydown="onKeydown"
  >
    <!-- keyed per project so the content (and its CSS build-up) starts fresh on prev/next -->
    <template v-for="p in project ? [project] : []" :key="p.id">
      <button type="button" class="pj-dx" aria-label="Close" @click="dlg!.close()"></button>
      <div class="pj-sc">
        <header class="pj-dh">
          <img v-if="p.cover" class="pj-cv" :src="p.cover" alt="" decoding="async" />
          <div class="pj-k">
            <span>{{ p.kind }}</span
            ><span>{{ period(p) }}</span
            ><StatusPill :status="p.status" />
          </div>
          <h2 id="pj-dt" :aria-label="p.name">
            <span class="bp-gh" aria-hidden="true">{{ p.name }}</span
            ><span class="bp-ty" aria-hidden="true">{{ typed }}</span>
          </h2>
          <p>{{ p.summary || p.headline }}</p>
        </header>
        <dl class="bp-tbk">
          <div
            v-for="(cell, k) in cells"
            :key="cell.label"
            :class="cell.cls"
            :style="{ '--ci': k }"
          >
            <dt>{{ cell.label }}</dt>
            <dd>
              <template v-if="cell.metric"
                ><b>{{ cell.metric.value }}</b
                ><span>{{ cell.metric.label }}</span></template
              ><template v-else>{{ cell.text }}</template>
            </dd>
          </div>
        </dl>
        <figure v-if="p.cover" class="bp-plate">
          <div class="bp-pf">
            <img :src="p.cover" alt="" decoding="async" /><i class="bp-sl"></i>
          </div>
          <figcaption>
            <span>{{ caption(0, `${p.name} · cover plate`) }}</span
            ><span>Scale 1 : 1</span>
          </figcaption>
        </figure>
        <div class="pj-db">
          <template v-for="(s, k) in sections" :key="s">
            <section v-if="s === 'highlights'" :style="{ '--si': k }">
              <h4>Highlights</h4>
              <ul class="pj-pts">
                <li v-for="h in p.highlights.length ? p.highlights : [p.headline]" :key="h">
                  {{ h }}
                </li>
              </ul>
            </section>
            <section v-else-if="s === 'hard'" :style="{ '--si': k }">
              <h4>The hard part</h4>
              <p>{{ p.challenges }}</p>
            </section>
            <section v-else-if="s === 'screens'" :style="{ '--si': k }">
              <h4>Screens</h4>
              <div class="pj-shots">
                <figure v-for="(sh, j) in p.screenshots" :key="sh" class="pj-fg">
                  <button
                    type="button"
                    class="pj-shot"
                    :aria-label="`View screenshot ${j + 1} of ${p.screenshots.length}`"
                    @click="showShot(j)"
                  >
                    <img
                      :src="sh"
                      :alt="`${p.name} screenshot ${j + 1}`"
                      loading="lazy"
                      decoding="async"
                    />
                  </button>
                  <figcaption aria-hidden="true">
                    {{ caption(j + 1, `${p.name} · view ${j + 1}`) }}
                  </figcaption>
                </figure>
              </div>
            </section>
            <section v-else-if="s === 'tech'" :style="{ '--si': k }">
              <h4>Built with</h4>
              <ul class="pj-tech">
                <li v-for="t in p.stack" :key="t">
                  <TechIcon :name="t" /><span>{{ techName(t) }}</span>
                </li>
              </ul>
            </section>
            <section v-else :style="{ '--si': k }">
              <div class="pj-act">
                <a
                  v-if="p.demo_url"
                  class="pj-lk"
                  :href="demoUrl(p.demo_url)"
                  target="_blank"
                  rel="noopener noreferrer"
                  >Demo<span aria-hidden="true"> ↗</span></a
                ><a
                  v-if="p.code_url"
                  class="pj-lk"
                  :href="p.code_url"
                  target="_blank"
                  rel="noopener noreferrer"
                  >Code<span aria-hidden="true"> ↗</span></a
                >
              </div>
            </section>
          </template>
        </div>
      </div>
      <nav class="pj-dn" aria-label="Project navigation">
        <button type="button" :disabled="!prev" @click="prev && emit('nav', prev)">
          {{ prev ? `← ${prev.name}` : '' }}
        </button>
        <button type="button" :disabled="!next" @click="next && emit('nav', next)">
          {{ next ? `${next.name} →` : '' }}
        </button>
      </nav>
      <div
        v-if="p.screenshots.length"
        class="pj-lb"
        :class="{ one: p.screenshots.length < 2 }"
        :hidden="lb === null"
        @click.self="lb = null"
      >
        <figure class="pj-lbf">
          <img :src="lb === null ? undefined : p.screenshots[lb]" alt="" @click="lb = null" />
          <figcaption>
            <template v-if="lb !== null"
              ><span>{{ caption(lb + 1, `${p.name} · view ${lb + 1}`) }}</span
              ><span>{{ lb + 1 }} / {{ p.screenshots.length }}</span></template
            >
          </figcaption>
        </figure>
        <button type="button" aria-label="Previous screenshot" @click="lbStep(-1)">←</button>
        <button type="button" aria-label="Next screenshot" @click="lbStep(1)">→</button>
        <button type="button" aria-label="Close screenshot" @click="lb = null">×</button>
      </div>
    </template>
  </dialog>
</template>
