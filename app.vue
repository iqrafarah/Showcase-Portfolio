<script setup lang="ts">
onMounted(async () => {
  await nextTick()
  try {
    initMotion()
  } catch {
    // if the animations fail, make sure nothing stays hidden
    document.documentElement.classList.remove('js')
  }
})
</script>

<template>
  <div>
    <LoadingScreen />
    <SiteNav />
    <AboutDrawer />

    <main>
      <HeroSection />
      <WorkSection />
      <PixelDissolve from="#121211" into="#efeee9" />
      <ContactSection />
    </main>
  </div>
</template>
