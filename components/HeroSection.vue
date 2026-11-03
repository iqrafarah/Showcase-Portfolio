<script setup lang="ts">
import gsap from 'gsap'

const about = useAbout()
const buttons = ref<HTMLElement>()


// buttons lean a little towards the pointer
onMounted(() => {
  if (matchMedia('(hover: none)').matches || prefersReducedMotion()) return
  buttons.value!.querySelectorAll<HTMLElement>('.btn').forEach((button) => {
    button.addEventListener('pointermove', (event) => {
      const box = button.getBoundingClientRect()
      const x = (event.clientX - box.left - box.width / 2) * 0.25
      const y = (event.clientY - box.top - box.height / 2) * 0.35
      gsap.to(button, { x, y, duration: 0.4, ease: 'power3.out' })
    })
    button.addEventListener('pointerleave', () => gsap.to(button, { x: 0, y: 0, duration: 0.7, ease: 'elastic.out(1, 0.4)' }))
  })
})
</script>

<template>
  <section id="top" class="relative isolate flex min-h-[100svh] flex-col items-center justify-center px-6 pb-44 pt-24 text-center">
    <HeroPixels />
    <p data-hero class="eyebrow text-mute">Web designer & developer / Noord-Brabant, NL</p>
    <h1 data-hero class="mt-5 max-w-[14ch] text-[clamp(40px,5.2vw,74px)] font-medium leading-[0.98] tracking-[-0.045em]">
      Websites people actually enjoy using.
    </h1>
    <p data-hero class="mt-6 max-w-[30rem] text-[clamp(16px,1.2vw,19px)] leading-[1.55] text-mute">
      Hello, I'm Iqra. I design everything myself in <ToolWord name="Figma" /> and build it in Next.js, <ToolWord name="React" /> and WordPress. A creative who codes, full stack with a frontend heart.
    </p>
    <div ref="buttons" data-hero class="mt-9 flex flex-wrap items-center justify-center gap-2">
      <div class="pair">
        <a href="#work" class="btn"><RollText text="See" /></a>
        <a href="#work" class="btn"><RollText text="Work" /><i class="dot" /></a>
      </div>
      <button class="btn btn-light" @click="about = true"><RollText text="About" /></button>
    </div>
  </section>
</template>

