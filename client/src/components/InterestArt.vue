<script setup lang="ts">
import { computed } from 'vue'
import type { Interest } from '@/lib/data'

// The small CSS illustration on an Off the clock card, chosen by the record's `art`.
const props = defineProps<{ item: Interest }>()

const phrase = computed(() => props.item.phrase || '')
const words = computed(() => phrase.value.replace(/[.!?]+$/, '').split(/\s+/))
const last = computed(() => words.value[words.value.length - 1] || phrase.value)
const first = computed(() => (words.value[0] || phrase.value).toLowerCase())

const printWidths = [92, 88, 90, 84, 86, 80, 82, 76]

// a small node graph on a grid
const nodes: [number, number][] = [
  [1, 0],
  [3, 0],
  [2, 1],
  [5, 1],
  [4, 2],
]
const COLS = 8
const ROWS = 3
const STEP = 1.05 * 16
const isNode = (k: number) => nodes.some(([c, r]) => r * COLS + c === k)
const pt = ([c, r]: [number, number]) => [c * STEP + 4, r * STEP + 4] as const
const links = [
  [0, 2],
  [1, 2],
  [2, 3],
  [3, 4],
].map(([a, b]) => {
  const [x1, y1] = pt(nodes[a]!)
  const [x2, y2] = pt(nodes[b]!)
  return { x1, y1, x2, y2 }
})
</script>

<template>
  <div v-if="item.art === 'language'" class="sh-art a-lang" aria-hidden="true">
    <span>{{ phrase }}</span
    ><span>{{ last }}</span
    ><span>{{ first }}…</span>
  </div>
  <div v-else-if="item.art === 'f1'" class="sh-art a-f1" aria-hidden="true">
    <i style="--w: 72%"></i><i style="--w: 38%"></i><i style="--w: 56%"></i>
  </div>
  <div v-else-if="item.art === 'vinyl'" class="sh-art a-vinyl" aria-hidden="true"><i></i></div>
  <div v-else-if="item.art === 'print'" class="sh-art a-print" aria-hidden="true">
    <i v-for="(w, n) in printWidths" :key="n" :style="{ '--w': `${w}%`, '--n': n }"></i>
  </div>
  <div v-else-if="item.art === 'tech'" class="sh-art a-tech" aria-hidden="true">
    <i v-for="k in COLS * ROWS" :key="k" :class="{ n: isNode(k - 1) }"></i>
    <svg aria-hidden="true">
      <line v-for="(l, k) in links" :key="k" :x1="l.x1" :y1="l.y1" :x2="l.x2" :y2="l.y2" />
    </svg>
  </div>
</template>
