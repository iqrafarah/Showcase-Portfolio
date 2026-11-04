<script setup lang="ts">
import gsap from 'gsap'
import work from '~/data/work.json'

// A full-screen case study. Text on the left (it stays put), pictures on the right (they scroll).
// It opens from a work card, lives in the URL as #case-slug and closes with Escape.
const current = useCase()
const asset = useAsset()
const page = ref<HTMLElement>()
const closeButton = ref<HTMLButtonElement>()

const index = computed(() => work.findIndex((project) => project.slug === current.value))
const project = computed<any>(() => (index.value >= 0 ? work[index.value] : null))
const next = computed<any>(() => (index.value >= 0 ? work[(index.value + 1) % work.length] : null))
// a project can list several screenshots in work.json ("images"); with only one, that one is shown
const pictures = computed<string[]>(() => (project.value ? project.value.images || [project.value.image] : []))
const open = computed(() => !!project.value)

// the text sections shown as accordion items (work.json: story = [{ title, text }])
const sections = computed<any[]>(() => project.value?.story?.length ? project.value.story : [{ title: 'The project', text: project.value?.description || '' }])
const openItem = ref(0) // which accordion item is open (-1: none)
function toggle(i: number) {
  openItem.value = openItem.value === i ? -1 : i
}

const pad = (n: number) => String(n).padStart(2, '0')

function show(slug: string) {
  current.value = slug
}
function close() {
  current.value = null
}

// keep the address bar in step with the open case study
watch(current, (slug, before) => {
  if (slug) location.hash = `case-${slug}`
  else if (location.hash.startsWith('#case-')) history.replaceState(null, '', location.pathname + location.search)

  document.body.classList.toggle('lock', open.value)
  document.documentElement.classList.toggle('drawer-open', open.value)
  open.value ? scroller.lenis?.stop() : scroller.lenis?.start()
  if (!slug) return
  openItem.value = 0

  nextTick(() => {
    page.value?.scrollTo({ top: 0 })
    if (!before) closeButton.value?.focus({ preventScroll: true })
    // text rises, pictures are wiped in with hard pixel steps
    gsap.fromTo(page.value!.querySelectorAll('[data-item]'), { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.8, stagger: 0.06, delay: 0.25, ease: 'power3.out' })
    gsap.fromTo(page.value!.querySelectorAll('[data-picture]'), { clipPath: 'inset(0 0 100% 0)' }, { clipPath: 'inset(0 0 0% 0)', duration: 0.9, stagger: 0.15, delay: 0.35, ease: 'steps(8)', clearProps: 'clipPath' })
  })
})

function fromHash() {
  const match = location.hash.match(/^#case-(.+)$/)
  if (match && work.some((p) => p.slug === match[1])) current.value = match[1]
  else if (current.value && !location.hash.startsWith('#case-')) current.value = null
}

onMounted(() => {
  fromHash()
  addEventListener('hashchange', fromHash)
  addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && current.value) close()
  })
})

defineExpose({ show })
</script>

<template>
  <div
    ref="page"
    data-lenis-prevent
    role="dialog"
    aria-modal="true"
    :aria-label="project ? `Case study: ${project.title}` : 'Case study'"
    :inert="!open"
    class="no-bar fixed inset-0 z-[85] overflow-y-auto bg-ink text-beige transition-[opacity,transform] duration-500 ease-out"
    :class="open ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-6 opacity-0'"
  >
    <template v-if="project">
      <!-- top bar: back, which project this is, and a link to the next one -->
      <header class="sticky top-0 z-20 flex items-center justify-end gap-4 px-6 py-5 sm:px-10">
        <div class="pair">
          <a v-for="link in project.links" :key="link.url" :href="link.url" target="_blank" rel="noopener" class="btn btn-light small"><RollText :text="link.label === 'Live' ? 'Visit site' : link.label" /></a>
          <button ref="closeButton" class="btn btn-light small" aria-label="Close" @click="close"><span class="text-[17px] leading-none" aria-hidden="true">✕</span></button>
        </div>
      </header>

      <div class="grid gap-10 px-6 pb-24 pt-4 sm:px-10 lg:pb-0 lg:pt-0 lg:grid-cols-[minmax(320px,3fr)_minmax(0,7fr)] lg:gap-12">
        <!-- left: the text. Always fits the screen and stays in view while the pictures scroll -->
        <div class="lg:sticky lg:top-[81px] lg:flex lg:h-[calc(100svh-107px)] lg:flex-col lg:self-start">
          <!-- category, then the title -->
          <p data-item class="font-mono text-[12px] uppercase text-beige/45">
            {{ project.group }}<template v-if="project.year"> / {{ project.year }}</template>
          </p>
          <h2 data-item class="mt-3 text-[clamp(34px,3.2vw,52px)] font-medium leading-[1.02] tracking-[-0.04em]">{{ project.title }}</h2>

          <!-- the story as an accordion (like an FAQ): one answer open at a time -->
          <div data-item class="no-bar mt-8 min-h-0 flex-1 overflow-y-auto border-b border-beige/15" data-lenis-prevent>
            <div v-for="(section, i) in sections" :key="section.title" class="border-t border-beige/15">
              <h3>
                <button
                  :id="`acc-${i}`"
                  class="group flex w-full items-center justify-between gap-4 py-3.5 text-left text-[clamp(15px,1.1vw,17px)] tracking-[-0.02em] transition-colors duration-200"
                  :class="openItem === i ? 'text-beige' : 'text-beige/70 hover:text-beige'"
                  :aria-expanded="openItem === i"
                  :aria-controls="`acc-panel-${i}`"
                  @click="toggle(i)"
                >
                  <span class="flex min-w-0 items-center">
                    <span class="h-[7px] shrink-0 bg-orange transition-all duration-300" :class="openItem === i ? 'mr-3 w-[7px] opacity-100' : 'mr-0 w-0 opacity-0'" aria-hidden="true"></span>
                    {{ section.title }}
                  </span>
                  <span class="relative h-[10px] w-[10px] shrink-0" aria-hidden="true">
                    <span class="absolute left-0 top-1/2 h-[1.5px] w-full -translate-y-1/2 bg-beige"></span>
                    <span class="absolute left-1/2 top-0 h-full w-[1.5px] -translate-x-1/2 bg-beige transition-transform duration-300" :class="openItem === i ? 'scale-y-0' : 'scale-y-100'"></span>
                  </span>
                </button>
              </h3>
              <div :id="`acc-panel-${i}`" role="region" :aria-labelledby="`acc-${i}`" class="acc-body" :class="{ open: openItem === i }">
                <div class="overflow-hidden">
                  <div class="max-w-[30rem] space-y-3 pb-5 text-[clamp(15px,1.05vw,17px)] leading-[1.6] text-beige/65">
                    <p v-for="paragraph in [].concat(section.text)" :key="paragraph">{{ paragraph }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- the facts, same style as the hover card on the work cards -->
          <dl data-item class="font-mono text-[12px] uppercase">
            <div class="flex items-baseline justify-between gap-6 border-b border-beige/15 py-3">
              <dt class="shrink-0 text-beige/45">{{ project.contribution ? 'My contribution' : 'Role' }}</dt>
              <dd class="flex items-center gap-2 text-right"><span class="h-[7px] w-[7px] shrink-0 bg-orange" aria-hidden="true"></span>{{ project.contribution || project.role }}</dd>
            </div>
            <div v-if="project.type" class="flex items-baseline justify-between gap-6 border-b border-beige/15 py-3">
              <dt class="shrink-0 text-beige/45">Project type</dt>
              <dd class="text-right">{{ project.type }}</dd>
            </div>
            <div class="flex items-baseline justify-between gap-6 py-3">
              <dt class="shrink-0 text-beige/45">Stack</dt>
              <dd class="flex flex-wrap justify-end gap-1.5">
                <span v-for="tech in project.techs" :key="tech" class="bg-ink-3 px-2 py-1 text-beige/80">{{ tech }}</span>
              </dd>
            </div>
          </dl>
        </div>

        <!-- right: only pictures -->
        <div class="flex min-w-0 flex-col gap-4 lg:pb-[26px]">
          <img
            v-for="(picture, i) in pictures"
            :key="picture"
            data-picture
            :src="asset(picture)"
            :alt="`${project.title}, screenshot ${i + 1}`"
            class="block h-auto w-full bg-ink-2"
            :loading="i === 0 ? 'eager' : 'lazy'"
            draggable="false"
          />
        </div>
      </div>
    </template>
  </div>
</template>

<style scoped>
/* accordion body slides open and closed */
.acc-body {
  display: grid;
  grid-template-rows: 0fr;
  transition: grid-template-rows 0.4s cubic-bezier(0.7, 0, 0.15, 1);
}
.acc-body.open {
  grid-template-rows: 1fr;
}
/* no visible scrollbars on the case study */
div[role='dialog'],
.no-bar {
  scrollbar-width: none;
}
div[role='dialog']::-webkit-scrollbar,
.no-bar::-webkit-scrollbar {
  display: none;
}
</style>
