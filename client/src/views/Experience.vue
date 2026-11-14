<script setup lang="ts">
import ExperienceCard, { type ExperienceCardProps } from '@/components/ExperienceCard.vue'
import ExperienceGroup, { type ExperienceGroupProps } from '@/components/ExperienceGroup.vue'
import { dev } from '@/App.vue'
import { motion } from 'motion-v'
import pb from '@/config/pocketbase'

defineOptions({
  name: 'ExperienceView',
})

const [groups, experiences] = await Promise.all([
  pb.collection('experience_groups').getFullList({ sort: 'created' }),
  pb.collection('experiences').getFullList<ExperienceCardProps>({ sort: '-start_date,created' }),
])

const experienceGroups: ExperienceGroupProps[] = groups
  .map((group) => ({
    id: group.id,
    name: group.name,
    description: group.description,
    experiences: experiences.filter((experience) => experience.group === group.id),
  }))
  .filter((group) => group.experiences.length > 0)

const ungroupedExperiences = experiences.filter((experience) => !experience.group)
</script>

<template>
  <motion.div
    :initial="{ opacity: 0 }"
    :animate="{ opacity: 1 }"
    :transition="{ duration: 0.5, ease: 'easeInOut' }"
    class="w-full"
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
          :experiences="group.experiences"
        />
      </div>
      <div v-for="experience in ungroupedExperiences" :key="experience.id">
        <ExperienceCard
          :id="experience.id"
          :company="experience.company"
          :title="experience.title"
          :start_date="experience.start_date"
          :end_date="experience.end_date"
          :current="experience.current"
          :skills="experience.skills"
          :description="experience.description"
        />
      </div>
    </div>
    <span v-if="dev" class="font-bold mb-6 text-purple">end</span>
  </motion.div>
</template>
