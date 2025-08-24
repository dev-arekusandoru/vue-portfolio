<script setup lang="ts">
import ProjectCard, { type ProjectProps } from '@/components/ProjectCard.vue'
import Manifest from '@mnfst/sdk'
import { ref } from 'vue'

defineOptions({
  name: 'ProjectsView',
})

const manifest = new Manifest()

const projects = ref<ProjectProps[]>([])
const paginator = await manifest.from('projects').find()
projects.value = paginator.data as ProjectProps[]
projects.value.sort((a, b) => {
  return new Date(b.start_date).getTime() - new Date(a.start_date).getTime()
})
</script>

<template>
  <p>
    <span class="text-purple">export default function</span>
    <span class="text-blue"> ProjectsPage</span>
    <span class="text-orange">() {</span>
  </p>
  <div class="indented">
    <p class="text-purple">return (</p>
    <div class="indented">
      <p class="text-white">
        <span>{{ '<' }}</span>
        <span class="text-red">div</span>
        <span>{{ '>' }}</span>
      </p>
      <div class="indented">
        <div v-for="project in projects" :key="project.id">
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
          />
        </div>
      </div>
      <p class="text-white">
        <span>&lt;/</span>
        <span class="text-red">div</span>
        <span>&gt;</span>
      </p>
    </div>
    <p class="text-purple">)</p>
  </div>
  <p class="text-orange">}</p>
</template>

<style scoped></style>
