<!-- eslint-disable vue/multi-word-component-names -->
<script setup lang="ts">
import { ref } from 'vue'
import { formatLinks } from '../../functions/format'

defineProps<{
  title: string
  content: string
}>()

const isOpen = ref(true)
</script>

<template>
  <div>
    <div class="bg-blackground border-t border-gray flex flex-row justify-between items-center">
      <p class="pt-3 pb-2 font-bold leading-relaxed">{{ title }}</p>
      <!-- <motion.div
        :initial="{ rotate: 0 }"
        :animate="{ rotate: isOpen ? 180 : 0 }"
        :transition="{ duration: 0.3, ease: 'easeInOut' }"
      >
        <Icon icon="mdi:chevron-down" class="w-4 h-4" />
      </motion.div> -->
    </div>
    <transition name="expand">
      <p v-show="isOpen" class="mb-4 leading-relaxed" v-html="formatLinks(content)"></p>
    </transition>
  </div>
</template>

<style scoped>
.collapsible {
  display: flex;
}
</style>
