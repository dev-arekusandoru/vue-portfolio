<script setup lang="ts">
import { onBeforeUnmount, onMounted, reactive, ref } from 'vue'
import InterestArt from '@/components/InterestArt.vue'
import { reduce, type Interest } from '@/lib/data'
import '@/lib/offclock.css'

// Off the clock: staggered glass cards, each with a small CSS illustration and an optional stat.
// Hover/focus adds the holographic wash and chromatic text split (CSS). Cards fade in as they scroll into view.
const props = defineProps<{ items: Interest[] }>()

const pad = (n: number) => String(n).padStart(2, '0')
const armed = ref(false)
const entered = reactive(props.items.map(() => false))
const grid = ref<HTMLElement>()
let io: IntersectionObserver | undefined

onMounted(() => {
  if (reduce || !('IntersectionObserver' in window)) return
  armed.value = true
  const cards = [...grid.value!.children]
  io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (!e.isIntersecting) continue
        entered[cards.indexOf(e.target)] = true
        io!.unobserve(e.target)
      }
    },
    { threshold: 0.15 },
  )
  cards.forEach((c) => io!.observe(c))
})
onBeforeUnmount(() => io?.disconnect())
</script>

<template>
  <div class="oc oc-shards" :class="{ 'is-armed': armed }">
    <ul ref="grid" class="sh-grid">
      <li
        v-for="(it, i) in items"
        :key="it.id"
        class="sh-card"
        :class="{ 'is-in': entered[i] }"
        :style="{ '--i': i }"
      >
        <span class="sh-wash" aria-hidden="true"></span
        ><span class="sh-edge" aria-hidden="true"></span
        ><span class="sh-tag">{{ pad(i + 1) }} / {{ pad(items.length) }}</span
        ><InterestArt :item="it" />
        <h3 class="sh-title">{{ it.title }}</h3>
        <p class="sh-line">{{ it.line }}</p>
        <div v-if="it.stat" class="sh-stat">
          <span v-if="it.stat.live" class="sh-live" aria-hidden="true"></span
          ><span class="sh-val">{{ it.stat.value }}</span
          ><span class="sh-lbl">{{ it.stat.label }}</span>
        </div>
      </li>
    </ul>
  </div>
</template>
