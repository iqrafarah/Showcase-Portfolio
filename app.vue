<script setup lang="ts">
// THE WHOLE PAGE, from top to bottom.
// Each <Component /> below is one file in the components/ folder.
// To change the order of the sections, move the lines in the template.

// Start the scroll animations (composables/useMotion.ts) once the page is on screen
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
    <!-- these sit on top of the page -->
    <LoadingScreen />   <!-- the black pixel wall when the site opens -->
    <SiteNav />         <!-- the menu at the top: Work, About, Contact -->
    <AboutDrawer />     <!-- the About panel that slides in from the right -->
    <CaseStudy />       <!-- the full-screen page of a project -->

    <!-- the page itself -->
    <main>
      <HeroSection />
      <WorkSection />
      <PixelDissolve from="#121211" into="#efeee9" />
      <ContactSection />
    </main>
  </div>
</template>
