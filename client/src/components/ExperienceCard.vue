<script setup lang="ts">
import SkillIcon from './SkillIcon.vue'
import { formatDate } from '../../functions/format'
import { dev } from '@/App.vue'

defineProps<ExperienceCardProps>()

defineOptions({
  name: 'ExperienceCard',
})
</script>

<template>
  <div class="rounded-lg">
    <h3 v-if="dev" class="text-md">
      <span class="text-purple">def </span>
      <span class="text-blue font-semibold">{{ company.replace(/\s+/g, '_') }}</span>
      <span class="text-orange"> (</span>
      <br />
      <span class="text-white ml-3">title</span>
      <span class="text-orange">: </span>
      <span class="text-green opacity-90">'{{ title }}'</span>
      <span class="text-white">
        <span>,</span>
        <br />
        <span class="ml-3">date</span>
      </span>
      <span class="text-orange">: </span>
      <span class="text-green opacity-90"
        >'{{ formatDate(start_date) }} - {{ current ? 'Present' : formatDate(end_date) }}'</span
      >
      <span class="text-orange"><br />)</span>
      <span class="text-purple"> do</span>
    </h3>
    <div v-else>
      <h3 class="text-lg font-semibold">{{ company }}</h3>
      <p class="text-md text-gray-300">{{ title }}</p>
      <p class="text-sm text-gray-500">
        {{ formatDate(start_date) }} - {{ current ? 'Present' : formatDate(end_date) }}
      </p>
    </div>

    <div
      :class="dev ? 'indented' : 'flex flex-col gap-2 rounded-2xl p-2 mt-2 border-2 border-border'"
      style="background-color: #222"
    >
      <div class="flex flex-row flex-wrap justify-start gap-2 items-center">
        <span v-if="dev" class="text-red">tech_stack</span>
        <span v-if="dev" class="text-white"> = </span>
        <span v-if="dev" class="text-orange">[</span>
        <div
          v-for="skill in skills"
          :key="skill"
          class="text-green flex flex-row justify-end items-end"
        >
          <SkillIcon :icon="skill" />
          <span v-if="dev && skill !== skills[skills.length - 1]" class="text-white">, </span>
        </div>
        <span v-if="dev" class="text-orange">]</span>
      </div>
      <ul v-if="dev" class="text-green">
        <span class="text-white">
          <span class="text-red">job_description</span>
          <span class="text-white"> = </span>
          <span class="text-orange">[</span>
        </span>
        <div class="indented">
          <li v-for="item in description" :key="item" class="">
            "{{ item }}"
            <span v-if="item !== description[description.length - 1]" class="text-white">,</span>
          </li>
        </div>
        <span class="text-orange">]</span>
      </ul>
      <ul v-else class="ml-4" style="list-style-type: '-  '">
        <li v-for="item in description" :key="item">{{ item }}</li>
      </ul>
    </div>
    <p v-if="dev" class="text-purple">end</p>
    <br v-if="dev" />
  </div>
</template>

<script lang="ts">
export type ExperienceCardProps = {
  id: string
  company: string
  title: string
  start_date: string
  end_date: string | null
  current: boolean
  description: string[] | string
  skills: string[] | string
  group?: string
}
</script>
