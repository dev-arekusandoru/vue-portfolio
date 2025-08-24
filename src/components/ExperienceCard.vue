<script setup lang="ts">
import SkillIcon from './SkillIcon.vue'
import { formatDate } from '../../functions/format'

defineProps<ExperienceCardProps>()

defineOptions({
  name: 'ExperienceCard',
})
</script>

<template>
  <div class="bg-background rounded-lg">
    <h3 class="text-md">
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
    <div class="indented">
      <div class="flex flex-row justify-start gap-2 items-center">
        <span class="text-red">tech_stack</span>
        <span class="text-white"> = </span>
        <span class="text-orange">[</span>
        <div
          v-for="skill in skills"
          :key="skill"
          class="text-green flex flex-row justify-end items-end"
        >
          <SkillIcon :icon="skill" />
          <span v-if="skill !== skills[skills.length - 1]" class="text-white">, </span>
        </div>
        <span class="text-orange">]</span>
      </div>
      <ul class="text-green">
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
    </div>
    <p class="text-purple">end</p>
    <br />
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
