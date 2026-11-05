<script setup lang="ts">
import gsap from 'gsap';
import profile from '~/data/profile.json';

// THE ABOUT DRAWER
// A panel that slides in from the right when you click "About" in the menu.
// Its text comes from data/profile.json:  about (intro text), experience (jobs), stack (tools).
// `photo` in profile.json (for example "/images/profile.jpg") shows a round picture in the greeting: "Hello (photo) I'm Iqra".
// Empty = no picture, and the greeting is just "Hello, I'm Iqra".
//
// `open` is true while the drawer is open. The menu sets it to true (see useAbout in composables/useUi.ts).
// When you leave the home page while the drawer is open, the page is unlocked again (see onBeforeUnmount below).
const open = useAbout();
const asset = useAsset();
const drawer = ref<HTMLElement>();
const closeButton = ref<HTMLButtonElement>();
const emailCopied = ref(false);

// "Copy email" button: copies the address and shows "Copied" for a moment
function copyEmail() {
  navigator.clipboard?.writeText(profile.email).catch(() => {});
  emailCopied.value = true;
  setTimeout(() => (emailCopied.value = false), 1800);
}

// When the drawer opens or closes
watch(open, (isOpen) => {
  lockPageScroll(isOpen); // the page behind it must not scroll, see composables/usePanel.ts
  if (!isOpen) return;

  nextTick(() => closeButton.value?.focus());

  // the blocks rise one after another once the drawer has slid in
  gsap.fromTo(
    drawer.value!.querySelectorAll('[data-item]'),
    { opacity: 0, y: 40 },
    {
      opacity: 1,
      y: 0,
      duration: 0.9,
      stagger: 0.07,
      delay: 0.35,
      ease: 'power3.out',
    },
  );
});

onMounted(() =>
  closeOnEscape((event) => {
    if (!open.value) return;
    open.value = false;
    event.preventDefault(); // tells the page behind it that Escape was used for the drawer
  }),
);

// leaving the page (for example to a case study) must never leave the page locked
onBeforeUnmount(() => {
  open.value = false;
  lockPageScroll(false);
});
</script>

<template>
  <div>
    <!-- the dark, blurred area behind the drawer. Click it to close. -->
    <div
      class="fixed inset-0 z-[80] bg-black/50 backdrop-blur-[3px] transition-opacity duration-500"
      :class="open ? 'opacity-100' : 'pointer-events-none opacity-0'"
      @click="open = false"
    />

    <!-- the drawer itself. Built like the case study page: small grey label, big title, rows with thin lines. -->
    <aside
      ref="drawer"
      data-lenis-prevent
      role="dialog"
      aria-modal="true"
      aria-label="About Iqra"
      :inert="!open"
      class="about-drawer"
      :class="
        open
          ? 'translate-x-0 shadow-[-30px_0_80px_rgba(0,0,0,.4)]'
          : 'translate-x-full'
      "
    >
      <!-- the close button stays at the top right while you scroll -->
      <header class="about-header">
        <button
          ref="closeButton"
          class="btn btn-light small"
          aria-label="Close"
          @click="open = false"
        >
          <span class="close-cross" aria-hidden="true">✕</span>
        </button>
      </header>

      <div class="about-content">
        <p data-item class="about-category">About</p>
        <!-- "Hello (round photo) I'm Iqra" as the big title -->
        <h2 data-item class="about-title">
          <template v-if="profile.photo"
            >Hello
            <img
              :src="asset(profile.photo)"
              alt="Iqra"
              class="about-photo"
              draggable="false"
            />
            I'm Iqra</template
          >
          <template v-else>Hello, I'm Iqra</template>
        </h2>
        <div data-item class="about-text space-y-4">
          <p
            v-for="paragraph in profile.about.text.split('\n\n')"
            :key="paragraph"
          >
            {{ paragraph }}
          </p>
        </div>

        <div data-item class="about-contact">
          <div class="pair">
            <a :href="`mailto:${profile.email}`" class="btn btn-light small"
              ><RollText text="Email me"
            /></a>
            <button
              type="button"
              class="btn btn-light small"
              @click="copyEmail"
            >
              <RollText :text="emailCopied ? 'Copied' : 'Copy email'" />
            </button>
          </div>
        </div>

        <!-- where I worked -->
        <section class="about-section">
          <h3 data-item class="section-title">
            <span class="orange-square" aria-hidden="true"></span>Where I've
            worked
          </h3>
          <div class="jobs">
            <div
              v-for="job in profile.experience"
              :key="job.company"
              data-item
              class="job"
            >
              <div class="job-top">
                <p class="job-company">{{ job.company }}</p>
                <p class="job-period">{{ job.period }}</p>
              </div>
              <p v-if="job.role" class="job-role">{{ job.role }}</p>
              <p v-if="job.text" class="job-text">{{ job.text }}</p>
            </div>
          </div>
        </section>

        <!-- toolbox -->
        <section class="about-section">
          <h3 data-item class="section-title">
            <span class="orange-square" aria-hidden="true"></span>Tech stack
          </h3>
          <div data-item class="section-body"><Toolbox /></div>
        </section>

        <!-- heatmap -->
        <section class="about-section">
          <h3 data-item class="section-title">
            <span class="orange-square" aria-hidden="true"></span>Commits
          </h3>
          <div data-item class="section-body">
            <ClientOnly><HeatMap v-if="open" dark hide-total /></ClientOnly>
          </div>
        </section>
      </div>
    </aside>
  </div>
</template>

<style scoped>
/* The panel: dark, full height, slides in from the right (the slide itself is set in the template above) */
.about-drawer {
  @apply fixed bottom-0 right-0 top-0 z-[90] w-[min(900px,100%)] overflow-y-auto bg-ink text-beige transition-transform duration-[750ms] ease-[cubic-bezier(.7,0,.15,1)];
}

/* Same height as the header on the case study page. It has a soft dark background, so the text that scrolls under it stays readable. */
.about-header {
  @apply sticky top-0 z-10 flex h-[81px] items-center justify-end bg-ink/90 px-6 backdrop-blur sm:px-10;
}
.close-cross {
  @apply text-[17px] leading-none;
}

.about-content {
  @apply px-6 pb-28 pt-4 sm:px-10;
}

/* The top part, like the top of a case study: grey label, big title, text */
.about-category {
  @apply font-mono text-[12px] uppercase text-beige/45;
}
/* The greeting: big title with the round photo in the middle of the sentence */
.about-photo {
  @apply mx-1 inline-block h-[1.05em] w-[1.05em] rounded-full object-cover align-[-0.14em];
}
.about-title {
  @apply mt-6 max-w-[18ch] text-[clamp(34px,3.2vw,52px)] font-medium leading-[1.02] tracking-[-0.04em];
}
.about-text {
  @apply mt-6 max-w-[34rem] text-[clamp(15px,1.05vw,17px)] leading-[1.6] text-beige/65;
}
.about-contact {
  @apply mt-7;
}

/* Every part (jobs, toolbox, commits) starts with a thin line and a title with the little orange square */
.about-section {
  @apply mt-12 border-t border-beige/15;
}
.section-title {
  @apply flex items-center py-3.5 text-[clamp(14px,1vw,16px)] tracking-[-0.02em] text-beige;
}
.orange-square {
  @apply mr-3 h-[7px] w-[7px] shrink-0 bg-orange;
}
.section-body {
  @apply pb-2 pt-3;
}

/* A job: company on the left and the years on the right, the role in orange under it */
.jobs {
  @apply space-y-7 pb-2 pt-3;
}
.job-top {
  @apply flex flex-wrap items-baseline justify-between gap-x-6;
}
.job-company {
  @apply text-[clamp(18px,1.5vw,22px)] font-medium tracking-[-0.02em];
}
.job-period {
  @apply font-mono text-[12px] uppercase text-beige/45;
}
.job-role {
  @apply mt-1 font-mono text-[12px] uppercase text-orange;
}
.job-text {
  @apply mt-3 max-w-[34rem] text-[clamp(13px,0.9vw,15px)] leading-[1.55] text-beige/65;
}
</style>
