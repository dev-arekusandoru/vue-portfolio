<script setup lang="ts">
import ExperienceCard, { type ExperienceCardProps } from '@/components/ExperienceCard.vue'
import ExperienceGroup, { type ExperienceGroupProps } from '@/components/ExperienceGroup.vue'
import { ref } from 'vue'
import { dev } from '@/App.vue'
import { motion } from 'motion-v'
import manifest from '../config/manifest'

const experienceGroups = ref<ExperienceGroupProps[]>([])
const experienceGroupPaginator = await manifest
  .from('experience-groups')
  .with(['experiences'])
  .find()
experienceGroups.value = experienceGroupPaginator.data as ExperienceGroupProps[]

const experiences = ref<ExperienceCardProps[]>([])
const paginator = await manifest.from('experiences').find()
experiences.value = paginator.data as ExperienceCardProps[]
experiences.value = experiences.value.filter((experience) => !experience.group)

defineOptions({
  name: 'ExperienceView',
})
</script>

<template>
  <motion.div
    :initial="{ opacity: 0 }"
    :animate="{ opacity: 1 }"
    :transition="{ duration: 0.5, ease: 'easeInOut' }"
  >
    <h2 v-if="dev">
      <span class="text-purple">class </span>
      <span class="text-blue font-bold">ProfessionalExperience</span>
    </h2>
    <div :class="dev ? 'indented' : 'flex flex-col gap-6'">
      <br v-if="dev" />
      <p v-if="dev">
        <span class="text-red">@years_experience</span>
        <span class="text-white"> = </span>
        <span class="text-orange">1.6</span>
      </p>
      <br v-if="dev" />
      <div v-for="group in experienceGroups" :key="group.id">
        <ExperienceGroup
          :title="group.name"
          :description="group.description"
          :experiences="
            group.experiences.sort((a: ExperienceCardProps, b: ExperienceCardProps) => {
              if (a.start_date && b.start_date) {
                return new Date(b.start_date).getTime() - new Date(a.start_date).getTime()
              }
              return 0
            })
          "
        />
      </div>
      <div v-for="experience in experiences" :key="experience.id">
        <ExperienceCard
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
    </div>
    <span v-if="dev" class="font-bold mb-6 text-purple">end</span>
  </motion.div>
</template>
