<script setup lang="ts">
import work from '~/data/work.json';
import profile from '~/data/profile.json';

// THE WORK SECTION: one <WorkCard /> for every project in data/work.json.
//
// The SHAPE of a card comes from the project itself: "card" in work.json.
//   "wide"    a wide picture      (16/10)
//   "medium"  a bit smaller       (16/11)
//   "tall"    a tall picture      (4/5)    good for phone screenshots
//   "square"  a small square
// Without "card" a project is "wide". Pick the shape that fits the thumbnail, so it is not cropped badly.
//
// The SIDE comes from the order: the first card is on the left, the second on the right, and so on.
// So you can put the projects in any order and the page still looks balanced.
// Every card also has its own gap above it, so the page feels loose but never crowded.
// On small screens every card is full width. (Only the "lg:" classes are for large screens.)
const shapes: Record<string, { width: string; ratio: string }> = {
  wide: { width: 'lg:w-[56%]', ratio: 'aspect-[16/10]' },
  medium: { width: 'lg:w-[46%]', ratio: 'aspect-[16/11]' },
  tall: { width: 'lg:w-[30%]', ratio: 'aspect-[4/5]' },
  square: { width: 'lg:w-[27%]', ratio: 'aspect-square' },
};
const left = 'lg:ml-[5%]';
const right = 'lg:ml-auto lg:mr-[4%]';
const gapsAbove = [
  '',
  'lg:mt-[7vw]',
  'lg:mt-[9vw]',
  'lg:mt-[4vw]',
  'lg:mt-[10vw]',
  'lg:mt-[4vw]',
]; // starts over after the last one

function shapeOf(project: any) {
  return shapes[project.card] ?? shapes.wide;
}
function placeOf(project: any, i: number) {
  return [
    shapeOf(project).width,
    i % 2 === 0 ? left : right,
    gapsAbove[i % gapsAbove.length],
  ];
}
</script>

<template>
  <section
    id="work"
    class="relative bg-ink px-6 pb-24 pt-8 text-beige sm:px-12 lg:px-16"
  >
    <div class="mb-14 grid gap-6 lg:grid-cols-2 lg:items-end">
      <h2
        data-stagger
        class="text-[clamp(38px,4.6vw,76px)] font-medium leading-[1.03] tracking-[-0.03em]"
      >
        Things I've worked on.
      </h2>
      <p
        data-reveal
        class="max-w-[30rem] text-[clamp(17px,1.3vw,20px)] leading-relaxed text-beige/60"
      >
        A mix of internship assignments, school projects and ideas I've built in
        my free time.
      </p>
    </div>
    <!-- one card per row, each with its own width and side (on small screens: full width) -->
    <div class="flex flex-col gap-y-24 lg:gap-y-0">
      <div
        v-for="(project, i) in work"
        :key="project.slug"
        :class="placeOf(project, i)"
        data-reveal
      >
        <WorkCard
          :project="project"
          :index="i"
          :ratio="shapeOf(project).ratio"
        />
      </div>
    </div>

    <div data-reveal class="mt-32 flex justify-center">
      <a
        :href="profile.github + '?tab=repositories'"
        target="_blank"
        rel="noopener"
        class="btn btn-light"
        ><RollText text="More on GitHub"
      /></a>
    </div>
  </section>
</template>
