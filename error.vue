<script setup lang="ts">
import type { NuxtError } from '#app'

// THE ERROR PAGE: shown for an address that does not exist (404) and for any other error.
// Nuxt uses this file automatically because it is called error.vue in the main folder.
const props = defineProps<{ error: NuxtError }>()

const isNotFound = computed(() => props.error.statusCode === 404)

useHead({ title: isNotFound.value ? 'Page not found — Iqra Farah' : 'Something went wrong — Iqra Farah' })

// Go back to the home page and clear the error
function goHome() {
  clearError({ redirect: '/' })
}
</script>

<template>
  <main class="error-page">
    <p class="error-code">{{ error.statusCode }}</p>
    <h1 class="error-title">{{ isNotFound ? 'This page does not exist.' : 'Something went wrong.' }}</h1>
    <p class="error-text">
      {{ isNotFound ? 'The address may be wrong, or the project was moved.' : 'Please try again in a moment.' }}
    </p>
    <div class="pair">
      <button class="btn btn-light" @click="goHome"><RollText text="Back to home" /></button>
    </div>
  </main>
</template>

<style scoped>
/* Dark full-screen page with everything in the middle */
.error-page {
  @apply flex min-h-[100svh] flex-col items-center justify-center bg-ink px-6 text-center text-beige;
}
.error-code {
  @apply font-mono text-[clamp(90px,18vw,220px)] font-medium leading-none tracking-[-0.06em] text-orange;
}
.error-title {
  @apply mt-6 text-[clamp(24px,3vw,40px)] font-medium tracking-[-0.03em];
}
.error-text {
  @apply mb-9 mt-3 max-w-[28rem] text-[15px] leading-[1.55] text-beige/60;
}
</style>
