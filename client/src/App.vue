<script setup lang="ts">
// import HelloWorld from './components/HelloWorld.vue'
import { Briefcase, FolderGit, File, Menu } from 'lucide-vue-next'
import { ref } from 'vue'

const isMenuOpen = ref(false)

const toggleMenu = () => {
  isMenuOpen.value = !isMenuOpen.value
  console.log('toggleMenu', isMenuOpen.value)
}
</script>

<script lang="ts">
export const dev = false
</script>

<template>
  <header class="flex justify-between items-center h-20 px-4 md:px-0 w-full mx-auto">
    <RouterLink to="/">
      <h1 class="text-lg">Alexandru Muresan</h1>
    </RouterLink>

    <!-- Mobile menu button -->
    <button
      @click="toggleMenu"
      class="md:hidden p-2 rounded-md cursor-pointer"
      :aria-expanded="isMenuOpen"
    >
      <Menu class="w-6 h-6" />
    </button>

    <!-- Desktop navigation -->
    <ul :class="`nav-list hidden md:flex ${dev ? 'dev' : ''}`">
      <li class="nav-item">
        <RouterLink to="/experience" class="nav-link" active-class="active">
          <Briefcase :size="20" />
          <span>experience{{ dev ? '.rb' : '' }}</span>
        </RouterLink>
      </li>
      <li class="nav-item">
        <RouterLink to="/projects" class="nav-link" active-class="active">
          <FolderGit :size="20" />
          <span>projects{{ dev ? '.ts' : '' }}</span>
        </RouterLink>
      </li>
      <li class="nav-item">
        <a
          class="nav-link"
          href="../public/Muresan_Alexandru_Resume_2025.pdf"
          target="_blank"
          rel="noopener noreferrer"
        >
          <File :size="20" />
          <span>resume{{ dev ? '.pdf' : '' }}</span>
        </a>
      </li>
    </ul>

    <!-- Mobile navigation -->
    <transition name="expand">
      <div
        v-show="isMenuOpen"
        :class="`overflow-hidden md:hidden absolute top-20 left-0 right-0 shadow-lg z-20 ${dev ? 'bg-background' : 'bg-blackground'}`"
      >
        <ul>
          <li class="border-t border-gray">
            <router-link
              to="/experience"
              class="block px-6 py-3 hover:bg-gray nav-link"
              @click="isMenuOpen = false"
            >
              <div class="flex items-center gap-3">
                <Briefcase class="w-5 h-5" />
                <span>Experience</span>
              </div>
            </router-link>
          </li>
          <li class="border-t border-gray">
            <router-link
              to="/projects"
              class="block px-6 py-3 hover:bg-gray"
              @click="isMenuOpen = false"
            >
              <div class="flex items-center gap-3">
                <FolderGit class="w-5 h-5" />
                <span>Projects</span>
              </div>
            </router-link>
          </li>
          <li class="border-t border-gray">
            <a
              href="../public/Muresan_Alexandru_Resume_2025.pdf"
              target="_blank"
              rel="noopener noreferrer"
              class="block px-6 py-3 hover:bg-gray"
            >
              <div class="flex items-center gap-3">
                <File class="w-5 h-5" />
                <span>Resume</span>
              </div>
            </a>
          </li>
        </ul>
      </div>
    </transition>
  </header>

  <main class="px-4 pb-4 md:px-0 flex flex-col min-h-[90dvh]" style="justify-content: flex-start">
    <Suspense>
      <RouterView />
      <template #fallback>
        <div class="flex justify-center items-center py-8">
          <div class="text-gray-500">Loading...</div>
        </div>
      </template>
    </Suspense>
  </main>
  <footer class="mt-auto text-center text-sm text-gray-500 pb-3">
    <p>
      <span class="text-white">© 2025 Alexandru Muresan</span>
    </p>
  </footer>
</template>

<style scoped>
.header {
  background-color: blue;
  width: 100%;
  max-width: 800px;
}

.nav-list {
  gap: 2px;
}

.nav-item .nav-link {
  display: flex;
  align-items: center;
  gap: 0px;
  border-radius: 8px;
  transition: all 0.3s ease;
  transition-delay: 0.15s;
  overflow: hidden;
  text-decoration: none;
  color: inherit;
  padding: 4px 6px;
  color: var(--color-white);
  transition: all 0.3s ease-in-out;
}

.dev .nav-item .nav-link {
  background-color: var(--color-gray);
}

.nav-item .nav-link:hover {
  gap: 6px;
}

.nav-item .nav-link.active {
  gap: 6px;
}
.dev .nav-item .nav-link.active {
  background-color: var(--color-gray);
  color: var(--color-green);
}

.nav-item .nav-link span {
  display: inline-block;
  max-width: 0;
  transition: all 0.3s ease-in-out;
  transition-delay: 0.15s;
  opacity: 0;
}
.nav-item .nav-link:hover span {
  display: inline-block;
  max-width: 200px;
  opacity: 1;
}
.nav-item .nav-link.active span {
  max-width: 200px;
  opacity: 1;
}
</style>
