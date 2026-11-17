<script setup lang="ts">
import { computed } from 'vue'
import { iconInfo } from '@/lib/icons'

// Monochrome tech icon: a CSS mask (`--ti`) so it takes `color`. Size with `--ti-size`. Unknown tech gets a 2-letter glyph.
const props = defineProps<{ name: string }>()
const info = computed(() => iconInfo(props.name))
</script>

<template>
  <span
    class="ti"
    :class="{ 'ti-txt': !info.url }"
    :data-tech="info.key"
    role="img"
    :aria-label="info.label"
    :title="info.label"
    :style="info.url ? { '--ti': `url(&quot;${info.url}&quot;)` } : undefined"
    >{{ info.url ? '' : info.glyph }}</span
  >
</template>
