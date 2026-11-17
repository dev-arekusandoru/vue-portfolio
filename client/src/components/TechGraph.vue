<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { mount } from '@/lib/filters/graph'
import type { TechFilter } from '@/composables/useTechFilter'

// The interlinked tech graph. Canvas + roving-focus node buttons are drawn and animated by lib/filters/graph (imperative on purpose:
// a per-frame rAF loop over node/edge state); this just hosts it and hands it the shared filter state.
const props = defineProps<{ filter: TechFilter }>()
const host = ref<HTMLElement>()
let unmount: (() => void) | undefined
onMounted(() => (unmount = mount(props.filter.graphCtx(host.value!))))
onBeforeUnmount(() => unmount?.())
</script>

<template>
  <div ref="host" class="tf-g"></div>
</template>
