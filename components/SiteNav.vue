<script setup lang="ts">
import profile from '~/data/profile.json'

// THE MENU AT THE TOP: Work, About, Contact
//   - "Work" lights up while the Work section is in the middle of the screen
//   - the menu slides away when you scroll down and comes back when you scroll up
//   - "About" opens the About drawer, "Contact" opens your mail app
const about = useAbout()
const onHome = useRoute().path === '/'
const inWork = ref(false)
const hidden = ref(false)

function copyEmail() {
  try {
    navigator.clipboard.writeText(profile.email)
  } catch {
    // ignore
  }
}

onMounted(() => {
  const work = document.querySelector('#work')
  const observer = new IntersectionObserver(([entry]) => (inWork.value = entry.isIntersecting), { rootMargin: '-45% 0px -45% 0px' })
  if (work) observer.observe(work)

  let last = scrollY
  function onScroll() {
    hidden.value = scrollY > 240 && scrollY > last
    last = scrollY
  }
  addEventListener('scroll', onScroll, { passive: true })

  onBeforeUnmount(() => {
    observer.disconnect()
    removeEventListener('scroll', onScroll)
  })
})
</script>

<template>
  <nav class="fixed left-1/2 top-4 z-40 -translate-x-1/2" aria-label="Main">
    <div class="transition-transform duration-500 ease-[cubic-bezier(.7,0,.2,1)]" :class="hidden && !about ? '-translate-y-[160%]' : 'translate-y-0'">
      <!-- drop-shadow (not box-shadow), so the shadow follows the shape of the pieces and the bridges -->
      <div data-hero class="pair [filter:drop-shadow(0_8px_14px_rgba(0,0,0,.22))]">
        <a v-if="onHome" href="#work" class="btn nav" :class="{ on: inWork }"><RollText text="Work" /></a>
        <NuxtLink v-else to="/#work" class="btn nav"><RollText text="Work" /></NuxtLink>
        <button class="btn nav" :class="{ on: about }" @click="about = true"><RollText text="About" /></button>
        <a :href="`mailto:${profile.email}`" class="btn nav" @click="copyEmail"><RollText text="Contact" /></a>
      </div>
    </div>
  </nav>
</template>
