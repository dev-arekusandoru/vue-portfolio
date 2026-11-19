<script setup lang="ts">
import { onBeforeUnmount, ref } from 'vue'
import { useRouter } from 'vue-router'
import SiteShell from '@/SiteShell.vue'

// The admin pages render bare (no hero, boot, nav or page fades); everything else lives in the site shell.
// The first render happens before the initial navigation resolves, so it goes by the URL; later switches go by the route.
const router = useRouter()
const admin = ref(location.hash.startsWith('#/admin'))
const stop = router.afterEach((to) => {
  admin.value = !!to.meta.admin
})
onBeforeUnmount(stop)
</script>

<template>
  <RouterView v-if="admin" />
  <SiteShell v-else />
</template>
