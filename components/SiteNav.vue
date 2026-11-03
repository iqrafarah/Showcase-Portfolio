<script setup lang="ts">
import profile from '~/data/profile.json'

const about = useAbout()
const inWork = ref(false) // the work section is in the middle of the screen
const hidden = ref(false) // the menu slides away while you scroll down

// the mail app opens through the link; the address is also copied, in case no mail app opens
function copyEmail() {
  try {
    navigator.clipboard.writeText(profile.email)
  } catch {
    // ignore
  }
}

onMounted(() => {
  // light up "Work" while the work section is in the middle of the screen
  const work = document.querySelector('#work')
  if (work) {
    new IntersectionObserver(([entry]) => (inWork.value = entry.isIntersecting), { rootMargin: '-45% 0px -45% 0px' }).observe(work)
  }

  // hide when scrolling down, show again when scrolling up
  let last = scrollY
  addEventListener(
    'scroll',
    () => {
      hidden.value = scrollY > 240 && scrollY > last
      last = scrollY
    },
    { passive: true }
  )
})
</script>

<template>
  <nav class="fixed left-1/2 top-4 z-40 -translate-x-1/2" aria-label="Main">
    <div class="transition-transform duration-500 ease-[cubic-bezier(.7,0,.2,1)]" :class="hidden && !about ? '-translate-y-[160%]' : 'translate-y-0'">
      <!-- drop-shadow (not box-shadow), so the shadow follows the shape of the pieces and the bridges -->
      <div data-hero class="pair [filter:drop-shadow(0_8px_14px_rgba(0,0,0,.22))]">
        <a href="#work" class="btn nav" :class="{ on: inWork }"><RollText text="Work" /></a>
        <button class="btn nav" :class="{ on: about }" @click="about = true"><RollText text="About" /></button>
        <a :href="`mailto:${profile.email}`" class="btn nav" @click="copyEmail"><RollText text="Contact" /></a>
      </div>
    </div>
  </nav>
</template>
