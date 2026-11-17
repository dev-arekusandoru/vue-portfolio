<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import type { Employer } from '@/lib/data'
import * as experience from '@/lib/experience'
import * as emanator from '@/lib/emanator'

const props = defineProps<{ employers: Employer[]; compact?: boolean }>()

const host = ref<HTMLElement | null>(null)
let unmount: (() => void) | null = null

const foot = '<footer class="mo-foot"><span>© 2025 Alexandru Muresan</span></footer>'

function remount() {
  unmount?.()
  unmount = null
  if (!host.value) return
  unmount = experience.mount(host.value, {
    employers: props.employers,
    compact: props.compact,
    rail: emanator,
    foot: props.compact ? '' : foot,
  })
}

onMounted(remount)
watch(() => [props.employers, props.compact], remount)
onBeforeUnmount(() => {
  unmount?.()
  unmount = null
})
</script>

<template>
  <div ref="host" :class="['xv', 'xv-monolith', { 'xv-compact': compact }]"></div>
</template>
