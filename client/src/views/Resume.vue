<template>
  <h2 class="text-3xl font-bold mb-6">Resume</h2>
  <div class="w-full">
    <!-- PDF Viewer -->
    <div class="pdf-container">
      <iframe :src="pdfUrl" class="pdf-viewer" title="Resume PDF" frameborder="0"></iframe>
    </div>

    <!-- Download Button -->
    <div class="text-center mt-6">
      <a
        :href="pdfUrl"
        download="Muresan_Alexandru_Resume_2025.pdf"
        class="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
      >
        Download PDF
      </a>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

defineOptions({
  name: 'ResumeView',
})

// Get the PDF URL from the assets folder
const pdfUrl = computed(() => {
  return new URL('../assets/Muresan_Alexandru_Resume_2025.pdf', import.meta.url).href
})
</script>

<style scoped>
.pdf-container {
  flex: 1;
  height: 80vh;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  overflow: hidden;
}

.pdf-viewer {
  width: 100%;
  height: 100%;
  border: none;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .pdf-container {
    height: 60vh;
  }

  .resume {
    padding: 1rem;
  }
}
</style>
