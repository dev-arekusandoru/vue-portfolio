<script setup lang="ts">
import SkillIcon from '@/components/SkillIcon.vue'
import { formatDate } from '../../functions/format'

defineProps<ProjectProps>()
</script>

<template>
  <div class="project-card">
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
</template>

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
}
</script>
