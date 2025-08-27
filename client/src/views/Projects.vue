<script setup lang="ts">
import ProjectCard, { type ProjectProps } from '@/components/ProjectCard.vue'
import { ref } from 'vue'
import { dev } from '@/App.vue'
import manifest from '../config/manifest'

defineOptions({
  name: 'ProjectsView',
})

const projects = ref<ProjectProps[]>([])
const paginator = await manifest.from('projects').find()
projects.value = paginator.data as ProjectProps[]
projects.value.sort((a, b) => {
  return new Date(b.start_date).getTime() - new Date(a.start_date).getTime()
})
</script>

<template>
  <p v-if="dev">
    <span class="text-purple">export default function</span>
    <span class="text-blue"> ProjectsPage</span>
    <span class="text-orange">() {</span>
  </p>
  <div :class="dev ? 'indented' : ''">
    <p v-if="dev" class="text-purple">return (</p>
    <div :class="dev ? 'indented' : 'timeline-container'">
      <p v-if="dev" class="text-white">
        <span>{{ '<' }}</span>
        <span class="text-red">div</span>
        <span>{{ '>' }}</span>
      </p>
      <div :class="dev ? 'indented' : ''">
        <div v-for="(project, index) in projects" :key="project.id">
          <ProjectCard
            :id="project.id"
            :name="project.name"
            :start_date="project.start_date"
            :end_date="project.end_date"
            :current="project.current"
            :stack="(project.stack as string)?.split('\n')"
            :highlights="(project.highlights as string)?.split('\n')"
            :code_url="project.code_url"
            :demo_url="project.demo_url"
            :index="index"
          />
        </div>
      </div>
      <p v-if="dev" class="text-white">
        <span>&lt;/</span>
        <span class="text-red">div</span>
        <span>&gt;</span>
      </p>
    </div>
    <p v-if="dev" class="text-purple">)</p>
  </div>
  <p v-if="dev" class="text-orange">}</p>
</template>
