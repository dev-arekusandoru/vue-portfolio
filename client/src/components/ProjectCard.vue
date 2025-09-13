<script setup lang="ts">
import SkillIcon from '@/components/SkillIcon.vue'
import { formatDate } from '../../functions/format'
import { ChevronDown, ExternalLink } from 'lucide-vue-next'
import { Icon } from '@iconify/vue'
import { motion } from 'motion-v'
import { ref, onMounted, nextTick, computed } from 'vue'

const props = defineProps<ProjectProps>()

const open = ref(false)
const firstBulletHeight = ref('')

const id = props.name.toLowerCase().replace(/[^a-z0-9]/g, '')

onMounted(() => {
  nextTick(() => {
    const firstBullet = document.querySelector(`#${id} .highlight-list li`)
    if (firstBullet) {
      firstBulletHeight.value = `${firstBullet.clientHeight}px`
    }
  })
})

const photosLength = computed(() => {
  return props.photos?.filter((photo) => photo !== null).length
})
</script>

<template>
  <motion.div
    :initial="{ opacity: 0 }"
    :animate="{ opacity: 1 }"
    :transition="{ duration: 0.5, ease: 'easeInOut' }"
    :key="index"
    class="project-container flex gap-4"
    :id="id"
  >
    <div class="timeline-display">
      <div class="timeline-line"></div>
      <div class="timeline-marker"></div>
    </div>
    <div class="project-card">
      <div class="flex flex-row justify-between items-center">
        <h2 class="text-lg">{{ name }}</h2>
        <div class="flex flex-row gap-2">
          <a v-if="demo_url" :href="demo_url" target="_blank">
            <ExternalLink class="w-4 h-4" />
          </a>
          <a v-if="code_url" :href="code_url" target="_blank">
            <Icon icon="mdi:github" class="w-4 h-4" />
          </a>
        </div>
      </div>
      <p class="text-sm text-gray-500">
        {{ formatDate(start_date) }}
        <span v-if="current"> - Present</span>
        <span v-else-if="formatDate(start_date) !== formatDate(end_date)">{{
          '- ' + formatDate(end_date)
        }}</span>
      </p>
      <div class="my-2 flex flex-row relative" v-if="photosLength === 1">
        <img
          :src="photos?.[0]?.large"
          class="w-full object-cover rounded-2xl border-2 border-border hover:w-full hover:z-10 transition-all"
        />
      </div>
      <div class="w-full my-2 flex flex-row gap-1" v-if="photosLength && photosLength > 1">
        <div v-for="photo in photos" :key="photo.large" class="flex-1">
          <img :src="photo.large" class="rounded-3xl border-2 border-border" />
        </div>
      </div>
      <div
        class="flex flex-col rounded-2xl p-2 pr-4 mt-2 border-2 border-border cursor-pointer"
        style="background-color: #222"
        @click="open = !open"
      >
        <div class="flex flex-row flex-wrap gap-2 mb-2">
          <SkillIcon v-for="skill in stack" :key="skill" :icon="skill" />
        </div>
        <motion.div
          class="overflow-hidden"
          :initial="{ height: firstBulletHeight }"
          :animate="{ height: open ? 'auto' : firstBulletHeight }"
          :transition="{ duration: 0.3, ease: 'easeInOut' }"
        >
          <motion.ul class="ml-4 highlight-list">
            <li v-for="highlight in highlights" class="leading-6" :key="highlight">
              {{ highlight }}
            </li>
          </motion.ul></motion.div
        >
        <button
          v-if="highlights.length > 1"
          class="text-gray-500 text-sm transition-colors rounded-lg cursor-pointer justify-center flex"
        >
          <ChevronDown
            :style="{
              transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
              transition: 'transform 0.3s ease-in-out',
            }"
          />
        </button>
      </div>
    </div>
  </motion.div>
</template>

<style>
.project-card {
  border-radius: 8px;
  padding: 0 0 8px 10px;
  margin-bottom: 16px;
}

.highlight-list {
  list-style-type: '-  ';
}

.timeline-display {
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  position: relative;
}
.timeline-line {
  width: 2px;
  top: 5px;
  bottom: -8px;
  background-color: var(--color-gray);
  position: absolute;
  border-radius: 100px;
  transition: background-color 0.3s ease;
}
.timeline-marker {
  width: 15px;
  height: 15px;
  border-radius: 50%;
  border: 2px solid var(--color-gray);
  background-color: var(--color-blackground);
  position: absolute;
  top: 5px;
  transition: border-color 0.3s ease;
}
.project-container:hover {
  .timeline-line {
    background-color: var(--color-white);
  }
  .timeline-marker {
    border-color: var(--color-white);
  }
}
</style>

<script lang="ts">
export type ProjectProps = {
  id: string
  name: string
  start_date: string
  end_date: string | null
  current: boolean
  stack: string[] | string
  highlights: string[] | string
  code_url?: string
  demo_url?: string
  index: number
  photos: { large: string }[] | null
}
</script>
