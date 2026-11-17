<script setup lang="ts">
// ONE PROJECT CARD in the Work section.
//
//   - Scrolls into view  → the screenshot appears as big pixels that get sharper   (composables/usePixelReveal.ts)
//   - Mouse over it      → a small info panel follows the pointer                  (composables/useHoverPanel.ts)
//   - Click              → opens the project's own page, /work/<slug>              (pages/work/[slug].vue)
//
// The project data comes from data/work.json. `ratio` is the shape of the card (set in WorkSection.vue).
// Only `slug` and `title` are required. Anything else you leave out (image, summary, role, year, techs)
// is simply not shown, and nothing breaks.
const props = defineProps<{ project: any; index: number; ratio: string }>()

const asset = useAsset()

const frame = ref<HTMLElement>()
const canvas = ref<HTMLCanvasElement>()
const panel = ref<HTMLElement>()

const hasThumbnail = !!props.project.thumbnail
const { isSharp } = usePixelReveal(frame, canvas, hasThumbnail ? asset(props.project.thumbnail) : '')
const { isHovering, onEnter, onMove, onLeave } = useHoverPanel(frame, panel)
</script>

<template>
  <NuxtLink :to="`/work/${project.slug}`" class="work-card" :aria-label="`Open case study: ${project.title}`">
    <div ref="frame" class="picture" :class="ratio" @pointerenter="onEnter" @pointermove="onMove" @pointerleave="onLeave">
      <canvas ref="canvas" class="layer" aria-hidden="true" />

      <img
        v-if="hasThumbnail"
        class="layer screenshot"
        :class="{ 'is-sharp': isSharp, 'is-zoomed': isHovering }"
        :src="asset(project.thumbnail)"
        :alt="`Screenshot of ${project.title}`"
        loading="lazy"
        draggable="false"
      />

      <dl v-if="project.role || project.year || project.techs?.length" ref="panel" class="hover-panel" :class="{ 'is-visible': isHovering }">
        <div v-if="project.role" class="panel-item role-item"><dt class="sr-only">Role</dt><dd class="role"><span class="orange-square" aria-hidden="true"></span><span>{{ project.role }}</span></dd></div>
        <div v-if="project.year" class="panel-item year-item"><dt class="sr-only">Year</dt><dd class="year">{{ project.year }}</dd></div>
        <div v-if="project.techs?.length" class="panel-item tags-item"><dt class="sr-only">Stack</dt>
          <dd class="tags">
            <span v-for="tech in project.techs" :key="tech" class="tag">{{ tech }}</span>
          </dd>
        </div>
      </dl>
    </div>

    <div class="title-row">
      <h3 class="title">{{ project.title }}</h3>
      <span class="number">{{ String(index + 1).padStart(2, '0') }}</span>
    </div>
    <p v-if="project.summary" class="summary">{{ project.summary }}</p>
  </NuxtLink>
</template>

<style scoped>
.work-card {
  @apply block;
}

.picture {
  @apply relative overflow-hidden bg-ink-2;
}
.layer {
  @apply absolute inset-0 h-full w-full;
}
.screenshot {
  @apply object-cover opacity-0 transition-[opacity,transform] duration-500 ease-out;
}
.screenshot.is-sharp {
  @apply opacity-100;
}
.screenshot.is-zoomed {
  @apply scale-[1.04];
}

.hover-panel {
  @apply pointer-events-none absolute left-0 top-0 w-[min(86%,320px)] opacity-0 transition-opacity duration-200;
}
.hover-panel.is-visible {
  @apply opacity-100;
}
.hover-panel {
  @apply flex flex-wrap items-center justify-between gap-x-3 gap-y-4 rounded-xl bg-ink-2 p-4 font-mono text-[10.5px] uppercase text-beige;
}
.role-item {
  @apply min-w-0 flex-1;
}
.year-item {
  @apply ml-auto;
}
.tags-item {
  @apply basis-full;
}
.role {
  @apply flex min-w-0 items-center gap-2;
}
.role > span:last-child {
  @apply min-w-0;
}
.orange-square {
  @apply h-[7px] w-[7px] shrink-0 bg-orange;
}
.year {
  @apply shrink-0 text-[#8c8b86];
}
.tags {
  @apply flex flex-wrap gap-1.5;
}
.tag {
  @apply bg-ink-3 px-2 py-1 text-beige/80;
}

.title-row {
  @apply mt-4 flex items-baseline justify-between gap-4;
}
.title {
  @apply font-mono text-[20px] uppercase text-beige;
}
.number {
  @apply font-mono text-[13px] uppercase text-beige/50;
}
.summary {
  @apply mt-1 max-w-[34rem] text-[16px] leading-snug text-beige/65;
}
</style>
