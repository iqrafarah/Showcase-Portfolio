<script setup lang="ts">
import type { NuxtError } from '#app';

// THE ERROR PAGE: shown for an address that does not exist (404) and for any other error.
// Nuxt uses this file automatically because it is called error.vue in the main folder.
// It looks like the first screen of the home page: light page, black pixels around the edges.
const props = defineProps<{ error: NuxtError }>();

const isNotFound = computed(() => props.error.statusCode === 404);

useHead({
  title: isNotFound.value
    ? 'Page not found — Iqra Farah'
    : 'Something went wrong — Iqra Farah',
});

function goHome() {
  clearError({ redirect: '/' });
}
</script>

<template>
  <div>
    <SiteNav />
    <AboutDrawer />

    <main class="error-page">
      <HeroPixels />
      <p class="eyebrow text-mute">Error {{ error.statusCode }}</p>
      <h1 class="error-code">{{ error.statusCode }}</h1>
      <p class="error-title">
        {{ isNotFound ? "This page doesn't exist." : 'Something went wrong.' }}
      </p>
      <p class="error-text">
        {{
          isNotFound
            ? "The link may be wrong, or the page has moved. Let's get you back to my work."
            : 'Please try again in a moment.'
        }}
      </p>
      <button class="btn" @click="goHome">
        <RollText text="Back to home" /><i class="dot" />
      </button>
    </main>
  </div>
</template>

<style scoped>
.error-page {
  @apply relative isolate flex min-h-[100svh] flex-col items-center justify-center px-6 pb-44 pt-24 text-center;
}
.error-code {
  @apply mt-3 font-medium leading-none tracking-[-0.06em] text-[clamp(110px,20vw,260px)];
}
.error-title {
  @apply mt-6 text-[clamp(22px,2.4vw,34px)] font-medium tracking-[-0.03em];
}
.error-text {
  @apply mb-9 mt-3 max-w-[28rem] text-[clamp(15px,1.2vw,18px)] leading-[1.55] text-mute;
}
</style>
