<script setup lang="ts">
import { formatDate } from '../../functions/format'
import type { ExperienceCardProps } from './ExperienceCard.vue'
import ExperienceCard from './ExperienceCard.vue'
import { dev } from '@/App.vue'

defineProps<{
  experiences: ExperienceCardProps[]
  title: string
  description: string
}>()
</script>

<template>
  <div class="flex flex-col">
    <h3 v-if="dev">
      <span class="text-purple">module </span>
      <span class="text-blue font-bold">{{ title.replace(' ', '_') }}</span>
    </h3>
    <div v-else>
      <h3 class="text-lg">{{ title }}</h3>
      <p class="text-md text-gray-500">
        {{ formatDate(experiences[experiences.length - 1].start_date) }} -
        {{ experiences[0].current ? 'Present' : formatDate(experiences[0].end_date) }}
      </p>
    </div>
    <div :class="dev ? 'indented' : 'indented flex flex-col gap-4'">
      <p v-if="dev">
        <span class="text-red">description</span>
        <span class="text-white"> = </span>
        "{{ description }}"
      </p>
      <p v-else class="p-2 mt-2 rounded-lg text-gray-300" style="background-color: #222">
        {{ description }}
      </p>

      <br v-if="dev" />
      <ExperienceCard
        v-for="experience in experiences"
        :key="experience.company"
        :id="experience.id"
        :company="experience.company"
        :title="experience.title"
        :start_date="experience.start_date"
        :end_date="experience.end_date"
        :current="experience.current"
        :skills="JSON.parse(experience.skills as string)"
        :description="JSON.parse(experience.description as string)"
      />
    </div>
    <span v-if="dev" class="text-purple">end</span>
  </div>
</template>

<script lang="ts">
export type ExperienceGroupProps = {
  id: string
  name: string
  description: string
  experiences: ExperienceCardProps[]
}
</script>
