<script setup lang="ts">
defineProps<{ time: string }>()
</script>

<template>
  <div class="nv-readout">
    <span class="live-dot" aria-hidden="true"></span><time>Local {{ time }}</time>
  </div>
</template>
