<script setup lang="ts">
defineProps<{ status: 'active' | 'shipped' }>()
</script>

<template>
  <span class="pj-st" :class="status">{{ status === 'active' ? 'Active' : 'Shipped' }}</span>
</template>
