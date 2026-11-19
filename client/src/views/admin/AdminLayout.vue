<script setup lang="ts">
import { onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { authed, logout, refreshSession } from '@/lib/admin'
import '@/assets/admin.css'

const router = useRouter()

onMounted(() => {
  delete document.documentElement.dataset.route
  document.title = 'Admin'
  void refreshSession()
})
// signed out here (button, expired token, 401): back to the login page
watch(authed, (ok) => {
  if (!ok) void router.replace({ name: 'AdminLogin' })
})
</script>

<template>
  <div class="adm">
    <header class="adm-bar">
      <strong>Admin</strong>
      <nav aria-label="Admin sections">
        <RouterLink to="/admin/projects">Projects</RouterLink>
        <RouterLink to="/admin/experience">Experience</RouterLink>
        <RouterLink to="/admin/interests">Interests</RouterLink>
      </nav>
      <RouterLink to="/">View site</RouterLink>
      <button type="button" class="adm-btn small" @click="logout">Sign out</button>
    </header>
    <RouterView />
  </div>
</template>
