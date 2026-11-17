<script setup lang="ts">
import { onBeforeUnmount, watch } from 'vue'
import { useRouter } from 'vue-router'
import ProjectRow from '@/components/ProjectRow.vue'
import TechChips from '@/components/TechChips.vue'
import TechGraph from '@/components/TechGraph.vue'
import { useTechFilter } from '@/composables/useTechFilter'
import { loadPortfolio } from '@/lib/data'
import { slugOf } from '@/lib/slug'
import { visibleProjects } from '@/lib/projectNav'
import '@/lib/projects.css'
import '@/lib/filters/tech.css'

defineOptions({ name: 'ProjectsView' })

const { projects } = await loadPortfolio()
const router = useRouter()
const filter = useTechFilter(projects)
const { sel, visible } = filter

// The dialog's prev/next walks what is visible here.
watch(visible, (v) => (visibleProjects.value = v), { immediate: true })
onBeforeUnmount(() => (visibleProjects.value = []))
</script>

<template>
  <h1 class="sr">Projects</h1>
  <section class="sec tight" aria-label="All projects">
    <div>
      <div class="pj-wrap f-graph f-chips">
        <div class="pj-filter">
          <TechGraph :filter="filter" />
          <TechChips :filter="filter" />
        </div>
        <div class="pj-main">
          <div class="pj-bar">
            <span class="pj-lbl" aria-live="polite"
              >Projects<i aria-hidden="true">·</i
              ><b>{{
                sel.size ? `${visible.length} of ${projects.length}` : projects.length
              }}</b></span
            >
            <button :hidden="!sel.size" type="button" class="pj-clear" @click="filter.clear()">
              Clear filter
            </button>
          </div>
          <div class="pj-list">
            <ProjectRow
              v-for="p in projects"
              :key="p.id"
              :project="p"
              :selected="sel"
              :hidden="!visible.includes(p)"
              @open="router.push(`/projects/${slugOf(p)}`)"
            />
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
