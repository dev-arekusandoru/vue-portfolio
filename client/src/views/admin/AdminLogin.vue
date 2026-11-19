<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { describe, login } from '@/lib/admin'
import '@/assets/admin.css'

const router = useRouter()
const email = ref('')
const password = ref('')
const error = ref('')
const busy = ref(false)

onMounted(() => {
  delete document.documentElement.dataset.route
  document.title = 'Admin sign in'
})

async function submit() {
  busy.value = true
  error.value = ''
  try {
    await login(email.value, password.value)
    await router.replace('/admin')
  } catch (e) {
    error.value = describe(e)
  } finally {
    busy.value = false
  }
}
</script>

<template>
  <div class="adm adm-login">
    <form class="adm-form" @submit.prevent="submit">
      <h1>Admin sign in</h1>
      <label class="adm-field">
        <span>PocketBase superuser email</span>
        <input v-model="email" type="email" autocomplete="username" required autofocus />
      </label>
      <label class="adm-field">
        <span>Password</span>
        <input v-model="password" type="password" autocomplete="current-password" required />
      </label>
      <p v-if="error" class="adm-err" role="alert">{{ error }}</p>
      <div class="adm-actions">
        <button class="adm-btn primary" :disabled="busy">
          {{ busy ? 'Signing in…' : 'Sign in' }}
        </button>
        <RouterLink to="/">Back to site</RouterLink>
      </div>
    </form>
  </div>
</template>
