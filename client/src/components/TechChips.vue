<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import TechIcon from '@/components/TechIcon.vue'
import type { TechFilter } from '@/composables/useTechFilter'
import '@/lib/filters/chips.css'

// Compact chip bar. One line collapsed (top 10 + "+N more"), wraps + search when expanded.
// Chip count = results you'd get with that chip on; chips that would give 0 are dimmed, not hidden.
// Selection and counts are reactive; the collapse/expand height animation and the "what fits on one line" measurement
// read and write layout directly (refs below), since they are about geometry, not state.
const TOP = 10
const props = defineProps<{ filter: TechFilter }>()
const { techs, sel, visible } = props.filter
const total = techs.length

const root = ref<HTMLElement>()
const vp = ref<HTMLElement>()
const input = ref<HTMLInputElement>()
const chipsEl = ref<HTMLElement>()

const open = ref(false)
const busy = ref(false)
const query = ref('')
/** how many chips fit on the first line when collapsed */
const shown = ref(Math.min(TOP, total))
const offSel = ref(false)
let settleNow: (() => void) | null = null

const label = computed(() => `+${total - shown.value}`)
const visSet = computed(() => new Set(visible.value))
const count = (t: (typeof techs)[number]) =>
  sel.has(t.key)
    ? visible.value.length
    : t.projects.reduce((a, p) => a + (visSet.value.has(p) ? 1 : 0), 0)

const q = computed(() => query.value.trim().toLowerCase())
const hit = (t: (typeof techs)[number]) =>
  !q.value || t.name.toLowerCase().includes(q.value) || t.key.includes(q.value)
const hits = computed(() => techs.filter(hit).length)
const hitsText = computed(() =>
  q.value ? (hits.value ? `${hits.value} / ${total}` : 'no match') : '',
)

// ---- collapsed-mode measurement ------------------------------------
// Chips that wrap off the first line (desktop) are hidden (data-off) and the "+N more" count is derived from what is visible.
const chipEls = () => Array.from(chipsEl.value?.children ?? []) as HTMLElement[]
const measure = () => {
  if (open.value || busy.value || !vp.value) return
  let n = 0
  let off = 0
  let top: number | null = null
  for (const c of chipEls()) {
    c.removeAttribute('data-off')
    if (c.offsetParent === null) continue
    if (top === null) top = c.offsetTop
    if (c.offsetTop > top + 4) {
      c.setAttribute('data-off', '')
      if (c.getAttribute('aria-pressed') === 'true') off++
    } else n++
  }
  shown.value = n
  offSel.value = off > 0
  edges()
}
const edges = () => {
  const el = vp.value
  if (open.value || !el) return
  const max = el.scrollWidth - el.clientWidth
  el.style.setProperty('--fl', max > 1 && el.scrollLeft > 4 ? '28px' : '0px')
  el.style.setProperty('--fr', max > 1 && el.scrollLeft < max - 4 ? '28px' : '0px')
}

// ---- animated height -----------------------------------------------
const settle = (done: () => void) => {
  const el = vp.value!
  let fin = false
  const end = () => {
    if (fin) return
    fin = true
    el.removeEventListener('transitionend', onEnd)
    clearTimeout(timer)
    settleNow = null
    busy.value = false
    done()
  }
  const onEnd = (e: TransitionEvent) => {
    if (e.target === el && e.propertyName === 'height') end()
  }
  const timer = setTimeout(end, 900)
  el.addEventListener('transitionend', onEnd)
  settleNow = end
  busy.value = true
}
const grow = async () => {
  const el = vp.value!
  settleNow?.()
  await nextTick()
  const from = el.offsetHeight
  el.style.height = 'auto'
  const to = el.offsetHeight
  el.style.height = from + 'px'
  void el.offsetHeight // reflow
  settle(() => {
    el.style.height = open.value ? 'auto' : ''
    if (!open.value) void nextTick(measure)
  })
  el.style.height = to + 'px'
}
const setOpen = async (on: boolean) => {
  if (on === open.value) return
  const el = vp.value!
  settleNow?.()
  open.value = on
  el.scrollLeft = 0
  await nextTick()
  if (on) {
    el.style.setProperty('--fl', '0px')
    el.style.setProperty('--fr', '0px')
    for (const c of chipEls()) c.removeAttribute('data-off')
    offSel.value = false
    grow()
  } else {
    if (query.value) query.value = ''
    const from = el.offsetHeight
    el.style.height = from + 'px'
    void el.offsetHeight
    settle(() => {
      el.style.height = ''
      void nextTick(measure)
    })
    el.style.height = ''
  }
}

// ---- events ----------------------------------------------------------
const onInput = () => {
  if (open.value) void nextTick(grow)
}
const onKey = (e: KeyboardEvent) => {
  if (e.key !== 'Escape') return
  if (query.value) {
    e.preventDefault()
    e.stopPropagation()
    query.value = ''
  } else if (open.value) {
    e.preventDefault()
    e.stopPropagation()
    void setOpen(false)
    root.value?.querySelector<HTMLElement>('.cb-more')?.focus()
  }
}

// counts change chip widths, so re-measure after they render; a pinned chip is shown even when the query hides it
watch(
  () => [...sel],
  () => {
    if (query.value && open.value) void nextTick(grow)
  },
  { flush: 'post' },
)
watch(visible, () => measure(), { flush: 'post' })

let ro: ResizeObserver | undefined
let dead = false
onMounted(() => {
  measure()
  ro = new ResizeObserver(() => {
    if (!open.value && !busy.value) measure()
  })
  ro.observe(vp.value!)
  void document.fonts?.ready.then(() => {
    if (!dead) measure()
  })
})
onBeforeUnmount(() => {
  dead = true
  ro?.disconnect()
  settleNow?.()
})
</script>

<template>
  <div class="tf-c">
    <div
      ref="root"
      class="cb"
      role="group"
      aria-label="Filter by technology"
      :data-open="open ? '' : null"
      :data-busy="busy ? '' : null"
      :data-none="q && !hits ? '' : null"
    >
      <div id="cb-tools" class="cb-tools">
        <div>
          <div class="cb-find">
            <label class="cb-q"
              ><span
                class="cb-sr"
                style="
                  position: absolute;
                  width: 1px;
                  height: 1px;
                  overflow: hidden;
                  clip: rect(0 0 0 0);
                "
                >Find tech</span
              ><input
                ref="input"
                v-model="query"
                class="cb-input"
                type="text"
                inputmode="search"
                enterkeyhint="search"
                autocomplete="off"
                autocapitalize="off"
                spellcheck="false"
                placeholder="find tech"
                aria-controls="cb-chips"
                :tabindex="open ? 0 : -1"
                @input="onInput"
                @keydown="onKey"
            /></label>
            <span class="cb-hits" aria-live="polite">{{ hitsText }}</span>
          </div>
        </div>
      </div>
      <div class="cb-row">
        <div ref="vp" class="cb-vp" @scroll.passive="edges">
          <div id="cb-chips" ref="chipsEl" class="cb-chips">
            <button
              v-for="(t, i) in techs"
              :key="t.key"
              type="button"
              class="cb-chip"
              :data-k="t.key"
              :data-x="i >= TOP ? '' : null"
              :data-zero="count(t) === 0 ? '' : null"
              :aria-pressed="sel.has(t.key)"
              :aria-label="`${t.name}, ${count(t)} project${count(t) === 1 ? '' : 's'}`"
              :hidden="!(hit(t) || sel.has(t.key))"
              @click="filter.toggle(t.key)"
            >
              <span aria-hidden="true"><TechIcon :name="t.name" /></span
              ><span class="cb-t">{{ t.name }}</span
              ><span class="cb-n">{{ count(t) }}</span>
            </button>
          </div>
        </div>
        <button
          type="button"
          class="cb-more"
          :aria-expanded="open"
          aria-controls="cb-tools"
          @click="setOpen(!open)"
        >
          <span class="cb-more-i" aria-hidden="true"></span
          ><span class="cb-more-t">{{ open ? 'Show less' : label }}</span
          ><span class="cb-mw">more</span
          ><span class="cb-dot" :hidden="!offSel || open" aria-hidden="true"></span>
        </button>
      </div>
      <p class="cb-empty" role="status">No tech matches.</p>
    </div>
  </div>
</template>
