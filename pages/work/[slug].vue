<script setup lang="ts">
import gsap from 'gsap';
import work from '~/data/work.json';

// THE CASE STUDY PAGE  (address: /work/rooster, /work/pomodoroplant, ...)
// One page per project. The last part of the address (the "slug") says which project to show.
//
//   left side   the text. It stays in place while you scroll.   (<CaseAccordion> and <CaseFacts>)
//   right side  the screenshots. They scroll.
//
// All the text comes from data/work.json.
// Only `slug` and `title` are required. Anything you leave out (story, images, links, role, techs...)
// is simply not shown, and nothing breaks.

const route = useRoute();
const router = useRouter();
const asset = useAsset();
const page = ref<HTMLElement>();

// The project that belongs to the address. Unknown address = "page not found".
const project: any = work.find((item) => item.slug === route.params.slug);
if (!project)
  throw createError({
    statusCode: 404,
    statusMessage: 'Project not found',
    fatal: true,
  });

// The pictures on the right. A project lists them in work.json under "images" (screenshots, or a video ending in .mp4 / .webm).
// Without "images" the "thumbnail" is used. With neither, none are shown.
const pictures: string[] =
  project.images ?? (project.thumbnail ? [project.thumbnail] : []);

// A video file is shown like a GIF: plays by itself, looped, no sound, no controls.
const isVideo = (file: string) => /\.(mp4|webm)$/i.test(file);

// The title in the browser tab, and the description Google and chat apps show
useHead({
  title: `${project.title} — Iqra Farah`,
  meta: [
    {
      name: 'description',
      content: project.summary ?? `${project.title}, a project by Iqra Farah.`,
    },
  ],
});

// The Escape key: go back to where you came from (the work cards). (The menu at the top has "Work" for the same.)
// If this page was opened directly (a shared link), go to the work section of the home page instead.
function close(event: KeyboardEvent) {
  if (event.defaultPrevented) return; // the About drawer used this Escape to close itself
  if (window.history.state?.back) router.back();
  else navigateTo({ path: '/', hash: '#work' });
}

// The text rises one line after another and the screenshots are wiped in with hard pixel steps.
function playIntro() {
  const textBlocks = page.value!.querySelectorAll('[data-item]');
  const screenshots = page.value!.querySelectorAll('[data-picture]');

  gsap.fromTo(
    textBlocks,
    { opacity: 0, y: 30 },
    {
      opacity: 1,
      y: 0,
      duration: 0.8,
      stagger: 0.06,
      delay: 0.25,
      ease: 'power3.out',
    },
  );
  gsap.fromTo(
    screenshots,
    { clipPath: 'inset(0 0 100% 0)' },
    {
      clipPath: 'inset(0 0 0% 0)',
      duration: 0.9,
      stagger: 0.15,
      delay: 0.35,
      ease: 'steps(8)',
      clearProps: 'clipPath',
    },
  );
}

onMounted(() => {
  if (!prefersReducedMotion()) playIntro();
  closeOnEscape(close); // see composables/usePanel.ts
});
</script>

<template>
  <div ref="page" class="case-page">
    <!-- the same menu as the home page (Work / About / Contact), in the middle at the top -->
    <SiteNav />
    <AboutDrawer />

    <!-- top right: a link to the live site (or the code) -->
    <header class="case-header">
      <div v-if="project.links?.length" class="pair">
        <a
          v-for="link in project.links"
          :key="link.url"
          :href="link.url"
          target="_blank"
          rel="noopener"
          class="btn btn-light small"
        >
          <RollText :text="link.label === 'Live' ? 'Visit site' : link.label" />
        </a>
      </div>
    </header>

    <div class="case-layout">
      <!-- LEFT: category, title, accordion, facts. (data-item = animated in by playIntro) -->
      <div class="case-text">
        <p v-if="project.group || project.year" data-item class="case-category">
          {{ project.group
          }}<template v-if="project.group && project.year"> / </template
          >{{ project.year }}
        </p>
        <h1 data-item class="case-title">{{ project.title }}</h1>

        <CaseAccordion
          v-if="project.story?.length"
          data-item
          :sections="project.story"
        />
        <CaseFacts data-item :project="project" />
      </div>

      <!-- RIGHT: only screenshots -->
      <div class="case-pictures">
        <template v-for="(picture, i) in pictures" :key="picture">
          <video
            v-if="isVideo(picture)"
            data-picture
            :src="asset(picture)"
            autoplay
            loop
            muted
            playsinline
            disablepictureinpicture
          />
          <img
            v-else
            data-picture
            :src="asset(picture)"
            :alt="`${project.title}, screenshot ${i + 1}`"
            :loading="i === 0 ? 'eager' : 'lazy'"
            draggable="false"
          />
        </template>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* The page: dark, at least as tall as the screen. */
.case-page {
  @apply min-h-[100svh] bg-ink text-beige;
}

/* The buttons stay at the top while you scroll. They have no background, so the pictures show behind them.
   On a large screen the header takes no space (-mb-[81px]), so the pictures start at the very top of the page. */
.case-header {
  @apply sticky top-0 z-20 flex h-[104px] items-end justify-end gap-4 px-6 pb-3 sm:h-[81px] sm:items-center sm:px-10 sm:pb-0 lg:-mb-[81px];
}

/* Two columns on a large screen: text (3 parts) and screenshots (7 parts). On a phone they stack. */
.case-layout {
  @apply grid gap-10 px-6 pb-24 pt-4 sm:px-10 lg:grid-cols-[minmax(320px,3fr)_minmax(0,7fr)] lg:gap-12 lg:pb-0 lg:pr-0 lg:pt-0;
}

/* The text column sticks to the top while the screenshots scroll,
   and is exactly as tall as the screen (minus a small gap at the top and at the bottom). */
.case-text {
  @apply lg:mt-10 lg:sticky lg:top-10 lg:flex lg:h-[calc(100svh-66px)] lg:flex-col lg:self-start;
}
.case-category {
  @apply font-mono text-[12px] uppercase text-beige/45;
}
.case-title {
  @apply mt-3 text-[clamp(34px,3.2vw,52px)] font-medium leading-[1.02] tracking-[-0.04em];
}

/* The pictures. The bottom gap makes the last screenshot end level with the bottom of the text column. */
.case-pictures {
  @apply flex min-w-0 flex-col gap-4 lg:pb-[26px];
}
.case-pictures img,
.case-pictures video {
  @apply block max-h-[720px] w-full bg-ink-2 object-cover object-top;
}
</style>
