<script setup lang="ts">
import SkillIcon from '@/components/SkillIcon.vue'
import { formatDate } from '../../functions/format'
import { dev } from '@/App.vue'
import { ExternalLink } from 'lucide-vue-next'
import { Icon } from '@iconify/vue'
import { motion } from 'motion-v'

defineProps<ProjectProps>()
</script>

<template>
  <div v-if="dev" :class="dev ? 'text-green' : ''">
    <span>
      <span class="text-white">{{ '<' }}</span>
      <span class="text-yellow">Project</span>
      <div class="indented">
        <p>
          <span class="text-orange">name</span>
          <span class="text-cyan">=</span>
          <span>"{{ name }}"</span>
        </p>
        <p>
          <span class="text-orange">date</span>
          <span class="text-cyan">=</span>
          <span
            >"{{ formatDate(start_date) }} - {{ current ? 'Present' : formatDate(end_date) }}"</span
          >
        </p>
        <p v-if="code_url">
          <span class="text-orange">code_url</span>
          <span class="text-cyan">=</span>
          <span
            >"<a class="text-blue" :href="code_url" target="_blank">{{ code_url }}</a
            >"</span
          >
        </p>
        <p v-if="demo_url">
          <span class="text-orange">demo_url</span>
          <span class="text-cyan">=</span>
          <span
            >"<a class="text-blue" :href="demo_url" target="_blank">{{ demo_url }}</a
            >"</span
          >
        </p>
        <div class="flex flex-row justify-start items-center">
          <p>
            <span class="text-orange">stack</span>
            <span class="text-cyan">={</span>
            <span class="text-orange">[</span>
          </p>
          <div
            v-for="skill in stack"
            :key="skill"
            class="flex flex-row flex-wrap justify-end items-end"
          >
            <SkillIcon :icon="skill" />
            <span v-if="skill !== stack[stack.length - 1]" class="text-white">, </span>
          </div>
          <p>
            <span class="text-orange">]</span>
            <span class="text-cyan">}</span>
          </p>
        </div>
        <p>
          <span class="text-orange">description</span>
          <span class="text-cyan">={</span>
          <span class="text-orange">[</span>
        </p>
        <div class="indented">
          <p v-for="(highlight, index) in highlights" :key="highlight">
            <span>"{{ index + 1 }}. {{ highlight }}"</span>
            <span v-if="highlight !== highlights[highlights.length - 1]" class="text-white"
              >,
            </span>
          </p>
        </div>
        <p>
          <span class="text-orange">]</span>
          <span class="text-cyan">}</span>
        </p>
      </div>
      <span class="text-white">/></span>
    </span>
  </div>
  <motion.div
    :initial="{ opacity: 0 }"
    :animate="{ opacity: 1 }"
    :transition="{ duration: 0.5, ease: 'easeInOut' }"
    :key="index"
    v-else
    class="project-container flex gap-4"
    :id="name.toLowerCase().replace(/ /g, '-')"
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
        {{ formatDate(start_date) }} - {{ current ? 'Present' : formatDate(end_date) }}
      </p>
      <div
        class="flex flex-col gap-2 rounded-2xl p-2 pr-4 mt-2 border-2 border-border"
        style="background-color: #222"
      >
        <div class="flex flex-row gap-2">
          <SkillIcon v-for="skill in stack" :key="skill" :icon="skill" />
        </div>
        <ul class="ml-4 highlight-list">
          <li v-for="highlight in highlights" class="leading-6" :key="highlight">
            {{ highlight }}
          </li>
        </ul>
      </div>
    </div>
  </motion.div>
</template>

<style scoped>
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
}
</script>
