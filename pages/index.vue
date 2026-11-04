<script setup lang="ts">
// THE HOME PAGE  (address: /)
// All the sections, from top to bottom. To change the order, move the lines in the template.

// Start the "slide up when scrolled into view" animations for this page,
// and switch them off again when the visitor leaves the page (see composables/useMotion.ts).
let stopRevealAnimations: (() => void) | undefined
onMounted(async () => {
  await nextTick()
  stopRevealAnimations = initRevealAnimations()
})
onBeforeUnmount(() => stopRevealAnimations?.())
</script>

<template>
  <div>
    <SiteNav />         <!-- the menu at the top: Work, About, Contact -->
    <AboutDrawer />     <!-- the About panel that slides in from the right -->

    <main>
      <HeroSection />
      <WorkSection />
      <PixelDissolve from="#121211" into="#efeee9" />
      <ContactSection />
    </main>
  </div>
</template>
