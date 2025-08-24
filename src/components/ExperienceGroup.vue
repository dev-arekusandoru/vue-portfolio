<script setup lang="ts">
import type { ExperienceCardProps } from './ExperienceCard.vue'
import ExperienceCard from './ExperienceCard.vue'

defineProps<{
  experiences: ExperienceCardProps[]
  title: string
  description: string
}>()
</script>

<template>
  <div class="flex flex-col">
    <h3>
      <span class="text-purple">module </span>
      <span class="text-blue font-bold">{{ title.replace(' ', '_') }}</span>
    </h3>
    <div class="indented">
      <p>
        <span class="text-red">description</span>
        <span class="text-white"> = </span>
        "{{ description }}"
      </p>
      <br />
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
    <span class="text-purple">end</span>
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
