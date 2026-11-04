<script setup lang="ts">
import work from '~/data/work.json'
import profile from '~/data/profile.json'

// THE WORK SECTION: one <WorkCard /> for every project in data/work.json.
//
// Every card has its own width, side and gap above it, so the page feels loose but never crowded.
// Nothing overlaps. On small screens every card is full width.
//   place = the width and position of the card (only on large screens, the "lg:" part)
//   ratio = the shape of the picture (16/10 is wide, 4/5 is tall, square is square)
// The first card uses the first line, the second card the second line, and so on. It starts over after the last line.
const places = [
  { place: 'lg:w-[62%]', ratio: 'aspect-[16/10]' },
  { place: 'lg:w-[30%] lg:ml-auto lg:mr-[4%] lg:mt-[7vw]', ratio: 'aspect-[4/5]' },
  { place: 'lg:w-[46%] lg:ml-[14%] lg:mt-[9vw]', ratio: 'aspect-[16/11]' },
  { place: 'lg:w-[27%] lg:ml-auto lg:mt-[4vw]', ratio: 'aspect-square' },
  { place: 'lg:w-[54%] lg:ml-[5%] lg:mt-[10vw]', ratio: 'aspect-[16/10]' }
]
</script>

<template>
  <section id="work" class="relative bg-ink px-6 pb-24 pt-8 text-beige sm:px-12 lg:px-16">
    <div class="mb-14 grid gap-6 lg:grid-cols-2 lg:items-end">
      <h2 data-stagger class="text-[clamp(38px,4.6vw,76px)] font-medium leading-[1.03] tracking-[-0.03em]">
        <span class="block">Work I built,</span><span class="block">start to finish.</span>
      </h2>
      <p data-reveal class="max-w-[30rem] text-[clamp(17px,1.3vw,20px)] leading-relaxed text-beige/60">
        Each project starts as a few big pixels and sharpens into the real thing.
      </p>
    </div>
    <!-- one card per row, each with its own width and side (on small screens: full width) -->
    <div class="flex flex-col gap-y-24 lg:gap-y-0">
      <div v-for="(project, i) in work" :key="project.slug" :class="places[i % places.length].place" data-reveal>
        <WorkCard :project="project" :index="i" :ratio="places[i % places.length].ratio" />
      </div>
    </div>

    <div data-reveal class="mt-32 flex justify-center">
      <div class="pair">
        <a :href="profile.github + '?tab=repositories'" target="_blank" rel="noopener" class="btn btn-light"><RollText text="More code" /></a>
        <a :href="profile.github + '?tab=repositories'" target="_blank" rel="noopener" class="btn btn-light"><RollText text="on GitHub" /></a>
      </div>
    </div>
  </section>
</template>
