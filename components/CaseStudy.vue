<script setup lang="ts">
import gsap from 'gsap'
import work from '~/data/work.json'

// THE CASE STUDY PAGE
// A full-screen page that opens when you click a project card.
//
//   left side   the text. It stays in place while you scroll.   (<CaseAccordion> and <CaseFacts>)
//   right side  the screenshots. They scroll.
//
// How it knows which project to show:
//   `openSlug` (from composables/useUi.ts) holds the slug of the open project, for example "rooster", or null.
//   A work card sets it when you click it. This page reads it.
//   The slug is also written in the address bar as #case-rooster, so a case study can be linked to.
//
// All the text comes from data/work.json.

const openSlug = useCase()
const asset = useAsset()
const page = ref<HTMLElement>()
const closeButton = ref<HTMLButtonElement>()

// the project that is open (or null)
const project = computed<any>(() => work.find((item) => item.slug === openSlug.value) ?? null)
const isOpen = computed(() => project.value !== null)

// The screenshots. A project lists them in work.json under "images". With only one, "image" is used.
const pictures = computed<string[]>(() => project.value?.images ?? [project.value?.image])

function close() {
  openSlug.value = null
}

// ---- When a project opens or closes ------------------------------------------------------

watch(openSlug, (slug, previousSlug) => {
  updateAddressBar(slug)
  lockPageScroll(isOpen.value) // see composables/usePanel.ts
  if (!slug) return

  nextTick(() => {
    page.value?.scrollTo({ top: 0 }) // always start at the top
    if (!previousSlug) closeButton.value?.focus({ preventScroll: true })
    playIntro()
  })
})

// Shows  #case-rooster  in the address bar while open, and removes it again when closed.
function updateAddressBar(slug: string | null) {
  if (slug) {
    location.hash = `case-${slug}`
  } else if (location.hash.startsWith('#case-')) {
    history.replaceState(null, '', location.pathname + location.search)
  }
}

// The text rises one line after another and the screenshots are wiped in with hard pixel steps.
function playIntro() {
  const textBlocks = page.value!.querySelectorAll('[data-item]')
  const screenshots = page.value!.querySelectorAll('[data-picture]')

  gsap.fromTo(textBlocks, { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.8, stagger: 0.06, delay: 0.25, ease: 'power3.out' })
  gsap.fromTo(
    screenshots,
    { clipPath: 'inset(0 0 100% 0)' },
    { clipPath: 'inset(0 0 0% 0)', duration: 0.9, stagger: 0.15, delay: 0.35, ease: 'steps(8)', clearProps: 'clipPath' }
  )
}

// ---- The address bar: open a case study from a link like  yoursite.nl/#case-rooster ------------

function openFromAddressBar() {
  const match = location.hash.match(/^#case-(.+)$/)
  const slug = match?.[1]

  if (slug && work.some((item) => item.slug === slug)) openSlug.value = slug
  else if (openSlug.value && !location.hash.startsWith('#case-')) openSlug.value = null
}

onMounted(() => {
  openFromAddressBar()
  addEventListener('hashchange', openFromAddressBar)
  closeOnEscape(() => isOpen.value, close) // see composables/usePanel.ts
})
</script>

<template>
  <div
    ref="page"
    class="case-page"
    :class="{ 'is-open': isOpen }"
    data-lenis-prevent
    role="dialog"
    aria-modal="true"
    :aria-label="project ? `Case study: ${project.title}` : 'Case study'"
    :inert="!isOpen"
  >
    <template v-if="project">
      <!-- top right: a link to the live site (or the code) and the close button -->
      <header class="case-header">
        <div class="pair">
          <a v-for="link in project.links" :key="link.url" :href="link.url" target="_blank" rel="noopener" class="btn btn-light small">
            <RollText :text="link.label === 'Live' ? 'Visit site' : link.label" />
          </a>
          <button ref="closeButton" class="btn btn-light small" aria-label="Close" @click="close">
            <span class="close-cross" aria-hidden="true">✕</span>
          </button>
        </div>
      </header>

      <div class="case-layout">
        <!-- LEFT: category, title, accordion, facts. (data-item = animated in by playIntro) -->
        <div class="case-text">
          <p data-item class="case-category">
            {{ project.group }}<template v-if="project.year"> / {{ project.year }}</template>
          </p>
          <h2 data-item class="case-title">{{ project.title }}</h2>

          <!-- :key makes the accordion start fresh (first item open) for every project -->
          <CaseAccordion :key="project.slug" data-item :sections="project.story" />
          <CaseFacts data-item :project="project" />
        </div>

        <!-- RIGHT: only screenshots -->
        <div class="case-pictures">
          <img
            v-for="(picture, i) in pictures"
            :key="picture"
            data-picture
            :src="asset(picture)"
            :alt="`${project.title}, screenshot ${i + 1}`"
            :loading="i === 0 ? 'eager' : 'lazy'"
            draggable="false"
          />
        </div>
      </div>
    </template>
  </div>
</template>

<style scoped>
/* The page itself: covers the whole screen, scrolls inside itself, no visible scrollbar.
   Closed = invisible and slightly lower. Open = slides up and fades in. */
.case-page {
  @apply pointer-events-none fixed inset-0 z-[85] translate-y-6 overflow-y-auto bg-ink text-beige opacity-0 transition-[opacity,transform] duration-500 ease-out;
  scrollbar-width: none;
}
.case-page::-webkit-scrollbar {
  display: none;
}
.case-page.is-open {
  @apply pointer-events-auto translate-y-0 opacity-100;
}

/* The buttons stay at the top while you scroll. They have no background, so the screenshots show behind them. */
.case-header {
  @apply sticky top-0 z-20 flex items-center justify-end gap-4 px-6 py-5 sm:px-10;
}
.close-cross {
  @apply text-[17px] leading-none;
}

/* Two columns on a large screen: text (3 parts) and screenshots (7 parts). On a phone they stack. */
.case-layout {
  @apply grid gap-10 px-6 pb-24 pt-4 sm:px-10 lg:grid-cols-[minmax(320px,3fr)_minmax(0,7fr)] lg:gap-12 lg:pb-0 lg:pt-0;
}

/* The text column sticks to the top while the screenshots scroll,
   and is exactly as tall as the screen (minus the header at the top and a small gap at the bottom). */
.case-text {
  @apply lg:sticky lg:top-[81px] lg:flex lg:h-[calc(100svh-107px)] lg:flex-col lg:self-start;
}
.case-category {
  @apply font-mono text-[12px] uppercase text-beige/45;
}
.case-title {
  @apply mt-3 text-[clamp(34px,3.2vw,52px)] font-medium leading-[1.02] tracking-[-0.04em];
}

/* The screenshots. The bottom gap makes the last screenshot end level with the bottom of the text column. */
.case-pictures {
  @apply flex min-w-0 flex-col gap-4 lg:pb-[26px];
}
.case-pictures img {
  @apply block h-auto w-full bg-ink-2;
}
</style>
