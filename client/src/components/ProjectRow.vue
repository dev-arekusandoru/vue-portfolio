<script setup lang="ts">
import { computed } from 'vue'
import TechIcon from '@/components/TechIcon.vue'
import StatusPill from '@/components/StatusPill.vue'
import { techKey, type Project } from '@/lib/data'

const MAX_ICONS = 6
const props = defineProps<{
  project: Project
  /** tech keys currently selected in the filter */
  selected: Set<string>
  hidden: boolean
}>()
defineEmits<{ open: [] }>()

const style = computed(() => {
  const p = props.project
  return { '--a1': p.pal[0], '--a2': p.pal[1], '--a3': p.pal[2], '--pa': p.accent }
})
const shown = computed(() => props.project.stack.slice(0, MAX_ICONS))
const rest = computed(() => props.project.stack.length - shown.value.length)
</script>

<template>
  <article class="pj" :data-hide="hidden ? '' : null" :inert="hidden">
    <div class="pj-in">
      <button
        type="button"
        class="pj-row"
        aria-haspopup="dialog"
        :style="style"
        @click="$emit('open')"
      >
        <span class="pj-art" aria-hidden="true"></span>
        <span class="pj-yr">{{ project.start.getUTCFullYear() }}</span>
        <span class="pj-tile" aria-hidden="true"
          ><img
            v-if="project.cover"
            :src="project.cover"
            alt=""
            loading="lazy"
            decoding="async"
          /><b v-else>{{ [...project.name][0] }}</b></span
        >
        <span class="pj-t"
          ><h3>{{ project.name }}</h3>
          <span class="pj-hl">{{ project.headline }}</span></span
        >
        <span class="pj-ic" aria-label="Technologies"
          ><TechIcon
            v-for="t in shown"
            :key="t"
            :name="t"
            :data-hit="selected.has(techKey(t)) ? '' : null"
          /><span v-if="rest > 0" class="pj-more-n" :aria-label="`${rest} more technologies`"
            >+{{ rest }}</span
          ></span
        >
        <StatusPill :status="project.status" />
        <span class="pj-go" aria-hidden="true">→</span>
      </button>
    </div>
  </article>
</template>
