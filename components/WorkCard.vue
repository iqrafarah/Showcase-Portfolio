<script setup lang="ts">
// ONE PROJECT CARD in the Work section.
//
//   - Scrolls into view  → the screenshot appears as big pixels that get sharper   (composables/usePixelReveal.ts)
//   - Mouse over it      → a small info panel follows the pointer                  (composables/useHoverPanel.ts)
//   - Click              → the case study opens                                    (components/CaseStudy.vue)
//
// The project data comes from data/work.json. `ratio` is the shape of the card (set in WorkSection.vue).
const props = defineProps<{ project: any; index: number; ratio: string }>()

const asset = useAsset()
const openSlug = useCase()

const frame = ref<HTMLElement>() // the picture area
const canvas = ref<HTMLCanvasElement>() // lies over the picture and draws the pixels
const panel = ref<HTMLElement>() // the hover info panel

const { isSharp } = usePixelReveal(frame, canvas, asset(props.project.image))
const { isHovering, onEnter, onMove, onLeave } = useHoverPanel(frame, panel)

// A normal click opens the case study. Ctrl/Cmd/Shift + click still opens the live site in a new tab.
function onClick(event: MouseEvent) {
  if (event.metaKey || event.ctrlKey || event.shiftKey) return
  event.preventDefault()
  openSlug.value = props.project.slug
}
</script>

<template>
  <a :href="project.links[0].url" target="_blank" rel="noopener" class="work-card" :aria-label="`Open case study: ${project.title}`" @click="onClick">
    <!-- the picture area. On top of each other: the pixel canvas, the real screenshot, the hover panel -->
    <div ref="frame" class="picture" :class="ratio" @pointerenter="onEnter" @pointermove="onMove" @pointerleave="onLeave">
      <canvas ref="canvas" class="layer" aria-hidden="true" />

      <img
        class="layer screenshot"
        :class="{ 'is-sharp': isSharp, 'is-zoomed': isHovering }"
        :src="asset(project.image)"
        :alt="`Screenshot of ${project.title}`"
        loading="lazy"
        draggable="false"
      />

      <dl ref="panel" class="hover-panel" :class="{ 'is-visible': isHovering }">
        <div class="panel-card">
          <div class="panel-top">
            <dt class="sr-only">Role</dt>
            <dd class="role"><span class="orange-square" aria-hidden="true"></span><span>{{ project.role }}</span></dd>
            <template v-if="project.year"><dt class="sr-only">Year</dt><dd class="year">{{ project.year }}</dd></template>
          </div>
          <dt class="sr-only">Stack</dt>
          <dd class="tags">
            <span v-for="tech in project.techs" :key="tech" class="tag">{{ tech }}</span>
          </dd>
        </div>
      </dl>
    </div>

    <!-- under the picture: title, number and the short summary -->
    <div class="title-row">
      <h3 class="title">{{ project.title }}</h3>
      <span class="number">{{ String(index + 1).padStart(2, '0') }}</span>
    </div>
    <p class="summary">{{ project.summary }}</p>
  </a>
</template>

<style scoped>
.work-card {
  @apply block;
}

/* ---- the picture area ---- */
.picture {
  @apply relative overflow-hidden bg-ink-2;
}
/* the canvas and the screenshot both fill the whole picture area */
.layer {
  @apply absolute inset-0 h-full w-full;
}
/* the real screenshot: invisible until the pixels are sharp, zooms in a little on hover */
.screenshot {
  @apply object-cover opacity-0 transition-[opacity,transform] duration-700 ease-out;
}
.screenshot.is-sharp {
  @apply opacity-100;
}
.screenshot.is-zoomed {
  @apply scale-[1.04];
}

/* ---- the hover panel (black card with role, year and tech tags) ---- */
.hover-panel {
  @apply pointer-events-none absolute left-0 top-0 w-[min(86%,320px)] opacity-0 transition-opacity duration-200;
}
.hover-panel.is-visible {
  @apply opacity-100;
}
.panel-card {
  @apply rounded-xl bg-ink-2 p-4 font-mono text-[10.5px] uppercase text-beige;
}
.panel-top {
  @apply flex items-center justify-between gap-3;
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
  @apply mt-3 flex flex-wrap gap-1.5;
}
.tag {
  @apply bg-ink-3 px-2 py-1 text-beige/80;
}

/* ---- under the picture ---- */
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
