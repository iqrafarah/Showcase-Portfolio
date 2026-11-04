<script setup lang="ts">
import profile from '~/data/profile.json'

// THE CONTACT SECTION at the bottom. The email address comes from data/profile.json.
</script>

<template>
  <section id="contact" class="flex flex-col items-center px-6 pb-32 pt-16 text-center sm:px-12 lg:pb-44 lg:pt-24">
    <p data-reveal class="eyebrow text-mute">Contact</p>
    <h2 data-reveal class="mt-6 max-w-[14ch] text-[clamp(44px,7vw,112px)] font-medium leading-[1] tracking-[-0.045em]">Let's work together.</h2>
    <p data-reveal class="mt-8 max-w-[26rem] text-[clamp(17px,1.3vw,20px)] leading-relaxed text-mute">I design it, I build it, I automate it. Send me an email and tell me what you're working on. I read everything.</p>

    <div data-reveal class="mt-12 flex flex-wrap items-center justify-center gap-3">
      <div class="pair">
        <a :href="`mailto:${profile.email}`" class="btn"><RollText text="Email" /></a>
        <a :href="`mailto:${profile.email}`" class="btn"><RollText :text="profile.email" /></a>
      </div>
    </div>
  </section>
</template>
