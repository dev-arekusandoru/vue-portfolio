<script setup lang="ts">
defineOptions({ inheritAttrs: false })
defineProps<{ to: string; current?: boolean }>()
</script>

<template>
  <RouterLink v-slot="{ href, navigate }" :to="to" custom>
    <a v-bind="$attrs" :href="href" :aria-current="current ? 'page' : undefined" @click="navigate"
      ><slot
    /></a>
  </RouterLink>
</template>
