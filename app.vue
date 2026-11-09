<script setup lang="ts">
// THE SHELL AROUND EVERY PAGE.
// The pages themselves are in the pages/ folder:
//   pages/index.vue         the home page (hero, work, contact)         address:  /
//   pages/work/[slug].vue   one page per project (case study)          address:  /work/rooster
// <NuxtPage /> below shows the page that belongs to the current address.

onMounted(async () => {
  await nextTick()
  try {
    initSmoothScroll()
  } catch {
    // if the animations fail, make sure nothing stays hidden
    document.documentElement.classList.remove('js')
  }
})
</script>

<template>
  <div>
    <LoadingScreen />
    <NuxtPage />
  </div>
</template>
