<script setup lang="ts">
import gsap from 'gsap';

// THE FIRST SCREEN: small title, headline, short intro and two buttons.
// The text is written directly in the template below. Change it there.
// The black pixels in the background come from <HeroPixels />.
const about = useAbout();
const buttons = ref<HTMLElement>();

// The buttons lean a little towards the mouse pointer (not on touch screens)
onMounted(() => {
  if (matchMedia('(hover: none)').matches || prefersReducedMotion()) return;
  buttons.value!.querySelectorAll<HTMLElement>('.btn').forEach((button) => {
    button.addEventListener('pointermove', (event) => {
      const box = button.getBoundingClientRect();
      const x = (event.clientX - box.left - box.width / 2) * 0.25;
      const y = (event.clientY - box.top - box.height / 2) * 0.35;
      gsap.to(button, { x, y, duration: 0.4, ease: 'power3.out' });
    });
    button.addEventListener('pointerleave', () =>
      gsap.to(button, {
        x: 0,
        y: 0,
        duration: 0.7,
        ease: 'elastic.out(1, 0.4)',
      }),
    );
  });
});
</script>

<template>
  <section
    id="top"
    class="relative isolate flex min-h-[100svh] flex-col items-center justify-center px-6 pb-44 pt-24 text-center"
  >
    <HeroPixels />
    <p data-hero class="eyebrow text-mute">
      Frontend developer who likes design
    </p>
    <h1
      data-hero
      class="mt-5 sm:max-w-none max-w-[18ch] text-[clamp(40px,5.2vw,74px)] font-medium leading-[0.98] tracking-[-0.045em]"
    >
      I design and build things<br class="hidden sm:block" />
      for the web.
    </h1>
    <p
      data-hero
      class="mt-6 max-w-[34rem] text-[clamp(16px,1.2vw,19px)] leading-[1.55] text-mute"
    >
      Hi, I'm Iqra, a second-year ICT student at Fontys in Tilburg. I enjoy
      turning designs into working websites and applications. Frontend is my
      favorite part, but I'm getting more into backend development too.
    </p>
    <div
      ref="buttons"
      data-hero
      class="mt-9 flex flex-wrap items-center justify-center gap-2"
    >
      <a href="#work" class="btn"
        ><RollText text="See my work" /><i class="dot"
      /></a>
      <button class="btn btn-light" @click="about = true">
        <RollText text="About me" />
      </button>
    </div>
  </section>
</template>
