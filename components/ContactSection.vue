<script setup lang="ts">
import profile from '~/data/profile.json';

// THE CONTACT SECTION at the bottom. The email address comes from data/profile.json.
// Buttons are the same as in the About drawer: "Email me" and "Copy email"
const emailCopied = ref(false);

function copyEmail() {
  navigator.clipboard?.writeText(profile.email).catch(() => {});
  emailCopied.value = true;
  setTimeout(() => (emailCopied.value = false), 1800);
}
</script>

<template>
  <section
    id="contact"
    class="flex flex-col items-center px-6 pb-32 pt-16 text-center sm:px-12 lg:pb-44 lg:pt-24"
  >
    <p data-reveal class="eyebrow text-mute">Contact</p>
    <h2
      data-reveal
      class="mt-6 max-w-[14ch] text-[clamp(44px,7vw,112px)] font-medium leading-[1] tracking-[-0.045em]"
    >
      Say hello.
    </h2>
    <p
      data-reveal
      class="mt-8 max-w-[32rem] text-[clamp(17px,1.3vw,20px)] leading-relaxed text-mute"
    >
      I'm open to internships and developer opportunities, especially in
      frontend development. If you think I'd be a good fit for your team, I'd
      love to hear from you.
    </p>

    <div
      data-reveal
      class="mt-12 flex flex-wrap items-center justify-center gap-3"
    >
      <div class="pair">
        <a :href="`mailto:${profile.email}`" class="btn"
          ><RollText text="Email me"
        /></a>
        <button type="button" class="btn" @click="copyEmail">
          <RollText :text="emailCopied ? 'Copied' : 'Copy email'" />
        </button>
      </div>
    </div>
  </section>
</template>
