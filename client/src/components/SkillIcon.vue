<script setup lang="ts">
import { Icon } from '@iconify/vue'
import RSpec from '@/assets/RSpec.svg'
import ActiveRecord from '@/assets/ActiveRecord.svg'
import Maven from '@/assets/Maven.svg'
import jQuery from '@/assets/jQuery.svg'
import Kamal from '@/assets/kamal.png'
import { computed } from 'vue'
import { dev } from '@/App.vue'

const props = defineProps<{
  icon: string
}>()

const iconMap = {
  typescript: 'logos:typescript-icon',
  css: 'logos:css-3',
  html: 'logos:html-5',
  git: 'logos:git-icon',
  firebase: 'logos:firebase-icon',
  'polymer (js)': 'logos:polymer',
  'ruby on rails': 'logos:rails',
  docker: 'logos:docker-icon',
  tailwindcss: 'logos:tailwindcss-icon',
  nativewind: 'logos:tailwindcss-icon',
  'react native': 'logos:react',
  'aws s3': 'logos:aws',
  expo: 'logos:expo-icon',
  'github actions': 'logos:github-actions',
  github: 'mdi:github',
  gitlab: 'logos:gitlab-icon',
  'app store connect': 'logos:apple-app-store',
  linux: 'logos:linux-tux',
  windows: 'logos:microsoft-windows-icon',
  spring: 'logos:spring-icon',
  nextjs: 'logos:nextjs-icon',
  macos: 'mdi:apple',
}
const customIconMap = {
  rspec: RSpec,
  activerecord: ActiveRecord,
  maven: Maven,
  jquery: jQuery,
  kamal: Kamal,
}

const icon = props.icon.toLowerCase()

const currentCustomIcon = computed(
  () => customIconMap[icon.toLowerCase() as keyof typeof customIconMap],
)
const currentIcon = computed(
  () => iconMap[icon.toLowerCase() as keyof typeof iconMap] || `logos:${icon}`,
)
</script>

<template>
  <div class="group flex flex-row justify-center items-center p-1 rounded-md cursor-help">
    <img
      v-if="currentCustomIcon"
      :src="currentCustomIcon"
      class="rounded-sm object-cover w-6 h-6"
    />
    <Icon v-else :icon="currentIcon" width="26" height="26" class="rounded-sm" />
    <div
      :class="`absolute bg-gray text-xs rounded-md p-1 translate-y-8 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none ${dev ? 'text-green' : 'text-white'}`"
    >
      <p class="text-center">{{ props.icon }}</p>
    </div>
  </div>
</template>
