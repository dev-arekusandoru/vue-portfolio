<script setup lang="ts">
import ProjectCard, { type ProjectProps } from '@/components/ProjectCard.vue'
import { dev } from '@/App.vue'
import pb from '@/config/pocketbase'

defineOptions({
  name: 'ProjectsView',
})

const projects = await pb
  .collection('projects')
  .getFullList<ProjectProps>({ sort: '-start_date,created' })
</script>

<template>
  <div class="w-full">
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
              :stack="project.stack"
              :highlights="project.highlights"
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
  </div>
</template>
