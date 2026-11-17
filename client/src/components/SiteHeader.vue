<script setup lang="ts">
import type { Page } from '@/lib/page'

defineProps<{ page: Page }>()

const nav = [
  { to: '/experience', page: 'experience', label: 'Experience' },
  { to: '/projects', page: 'projects', label: 'Projects' },
] as const
</script>

<template>
  <header class="top">
    <RouterLink v-slot="{ href, navigate }" to="/" custom>
      <a :href="href" @click="navigate">Alexandru Muresan</a>
    </RouterLink>
    <nav aria-label="Primary">
      <RouterLink v-for="n in nav" :key="n.to" v-slot="{ href, navigate }" :to="n.to" custom>
        <a :href="href" :aria-current="page === n.page ? 'page' : undefined" @click="navigate">{{
          n.label
        }}</a>
      </RouterLink>
      <a href="/Muresan_Alexandru_Resume_2025.pdf" target="_blank" rel="noopener">Resume</a>
    </nav>
  </header>
</template>
