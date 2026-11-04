<script setup lang="ts">
import gsap from 'gsap'
import profile from '~/data/profile.json'

// THE ABOUT DRAWER
// A panel that slides in from the right when you click "About" in the menu.
// Its text comes from data/profile.json:  about (intro text), experience (jobs), stack (tools).
//
// `open` is true while the drawer is open. The menu and the hero button set it to true (see useAbout in composables/useUi.ts).
// When you leave the home page while the drawer is open, the page is unlocked again (see onBeforeUnmount below).
const open = useAbout()
const drawer = ref<HTMLElement>()
const closeButton = ref<HTMLButtonElement>()
const emailCopied = ref(false)

// "Copy email" button: copies the address and shows "Copied" for a moment
function copyEmail() {
  navigator.clipboard?.writeText(profile.email).catch(() => {})
  emailCopied.value = true
  setTimeout(() => (emailCopied.value = false), 1800)
}

// When the drawer opens or closes
watch(open, (isOpen) => {
  lockPageScroll(isOpen) // the page behind it must not scroll, see composables/usePanel.ts
  if (!isOpen) return

  nextTick(() => closeButton.value?.focus())

  // the blocks rise one after another once the drawer has slid in
  gsap.fromTo(
    drawer.value!.querySelectorAll('[data-item]'),
    { opacity: 0, y: 40 },
    { opacity: 1, y: 0, duration: 0.9, stagger: 0.07, delay: 0.35, ease: 'power3.out' }
  )
})

onMounted(() => closeOnEscape(() => (open.value = false)))

// leaving the page (for example to a case study) must never leave the page locked
onBeforeUnmount(() => {
  open.value = false
  lockPageScroll(false)
})
</script>

<template>
  <div>
    <!-- the dark, blurred area behind the drawer. Click it to close. -->
    <div
      class="fixed inset-0 z-[80] bg-black/50 backdrop-blur-[3px] transition-opacity duration-500"
      :class="open ? 'opacity-100' : 'pointer-events-none opacity-0'"
      @click="open = false"
    />

    <!-- the drawer itself -->
    <aside
      ref="drawer"
      data-lenis-prevent
      role="dialog"
      aria-modal="true"
      aria-label="About Iqra"
      :inert="!open"
      class="fixed bottom-0 right-0 top-0 z-[90] w-[min(760px,100%)] overflow-y-auto bg-ink text-beige transition-transform duration-[750ms] ease-[cubic-bezier(.7,0,.15,1)]"
      :class="open ? 'translate-x-0 shadow-[-30px_0_80px_rgba(0,0,0,.4)]' : 'translate-x-full'"
    >
      <div class="px-6 pb-28 sm:px-14">
        <header class="sticky top-0 z-10 -mx-6 flex items-center justify-between bg-ink/90 px-6 py-5 backdrop-blur sm:-mx-14 sm:px-14">
          <span class="font-mono text-[13px] uppercase text-beige/50">About</span>
          <div class="pair">
            <button ref="closeButton" class="btn btn-light small" @click="open = false"><RollText text="Close" /></button>
            <button class="btn btn-light small" aria-label="Close" @click="open = false"><span class="text-[17px] leading-none" aria-hidden="true">✕</span></button>
          </div>
        </header>

        <p data-item class="mt-10 max-w-[18ch] text-[clamp(32px,4vw,50px)] font-medium leading-[1.06] tracking-[-0.035em]">{{ profile.about.lead }}</p>
        <p data-item class="mt-6 max-w-[34rem] text-[18px] leading-[1.6] text-beige/65">{{ profile.about.text }}</p>
        <div data-item class="mt-8 flex flex-wrap items-center gap-x-5 gap-y-3">
          <div class="pair">
            <a :href="`mailto:${profile.email}`" class="btn btn-light"><RollText text="Say hello" /></a>
            <button type="button" class="btn btn-light" @click="copyEmail"><RollText :text="emailCopied ? 'Copied' : 'Copy email'" /></button>
          </div>
          <p class="font-mono text-[12px] uppercase text-beige/45">Design + code + automation</p>
        </div>

        <!-- where I worked -->
        <section class="mt-16 border-t border-beige/15 pt-12">
          <h3 data-item class="font-mono text-[clamp(16px,1.5vw,19px)] uppercase tracking-[0.01em]">001 / Where I've worked</h3>
          <div class="mt-8 space-y-8">
            <div v-for="job in profile.experience" :key="job.company" data-item>
              <div class="flex flex-wrap items-baseline justify-between gap-x-6">
                <p class="text-[24px] font-medium tracking-[-0.02em]">
                  {{ job.company }}
                </p>
                <p class="font-mono text-[12px] uppercase text-beige/45">{{ job.period }}</p>
              </div>
              <p v-if="job.role" class="mt-1 font-mono text-[12px] uppercase text-orange">{{ job.role }}</p>
              <p v-if="job.text" class="mt-3 max-w-[34rem] text-[16px] leading-[1.55] text-beige/65">{{ job.text }}</p>
            </div>
          </div>
        </section>

        <!-- toolbox -->
        <section class="mt-16 border-t border-beige/15 pt-12">
          <h3 data-item class="font-mono text-[clamp(16px,1.5vw,19px)] uppercase tracking-[0.01em]">002 / Toolbox</h3>
          <div data-item class="mt-8"><Toolbox /></div>
        </section>

        <!-- heatmap -->
        <section class="mt-16 border-t border-beige/15 pt-12">
          <h3 data-item class="font-mono text-[clamp(16px,1.5vw,19px)] uppercase tracking-[0.01em]">003 / Commits</h3>
          <div data-item class="mt-8">
            <ClientOnly><HeatMap v-if="open" dark hide-total /></ClientOnly>
          </div>
        </section>

      </div>
    </aside>
  </div>
</template>
