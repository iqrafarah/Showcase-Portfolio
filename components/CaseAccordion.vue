<script setup lang="ts">
// THE ACCORDION ON A CASE STUDY PAGE (like an FAQ: click a title, the text opens)
// Only one item is open at a time. Click the open item again to close it.
//
// It gets its content from work.json:   story: [ { title: "The Project", text: ["paragraph", "paragraph"] }, ... ]
// To rename or add an item, change `story` in data/work.json. Nothing here has to change.
defineProps<{ sections: { title: string; text: string | string[] }[] }>()

const openIndex = ref(0) // which item is open (0 = the first one, -1 = none)

function toggle(index: number) {
  openIndex.value = openIndex.value === index ? -1 : index
}

// A text can be one string or a list of paragraphs. This always gives back a list.
function paragraphsOf(text: string | string[]) {
  return Array.isArray(text) ? text : [text]
}
</script>

<template>
  <div class="accordion" data-lenis-prevent>
    <div v-for="(section, i) in sections" :key="section.title" class="item" :class="{ 'is-open': openIndex === i }">
      <h3>
        <button :id="`acc-${i}`" class="title-button" :aria-expanded="openIndex === i" :aria-controls="`acc-panel-${i}`" @click="toggle(i)">
          <span class="title">
            <span class="orange-square" aria-hidden="true"></span>
            {{ section.title }}
          </span>
          <!-- the + / − sign: the vertical bar shrinks away when the item opens -->
          <span class="sign" aria-hidden="true">
            <span class="bar horizontal"></span>
            <span class="bar vertical"></span>
          </span>
        </button>
      </h3>

      <!-- the text: its height slides from 0 to its full size (see .body in the style below) -->
      <div :id="`acc-panel-${i}`" role="region" :aria-labelledby="`acc-${i}`" class="body">
        <div class="body-inner">
          <div class="text">
            <p v-for="paragraph in paragraphsOf(section.text)" :key="paragraph">{{ paragraph }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* The list. It scrolls inside itself when the screen is too short, without a visible scrollbar. */
.accordion {
  @apply mt-8 min-h-0 flex-1 overflow-y-auto border-b border-beige/15;
  scrollbar-width: none;
}
.accordion::-webkit-scrollbar {
  display: none;
}

.item {
  @apply border-t border-beige/15;
}

/* The clickable title: grey while closed, white when hovered or open */
.title-button {
  @apply flex w-full items-center justify-between gap-4 py-3.5 text-left text-[clamp(15px,1.1vw,17px)] tracking-[-0.02em] text-beige/70 transition-colors duration-200;
}
.title-button:hover,
.item.is-open .title-button {
  @apply text-beige;
}

.title {
  @apply flex min-w-0 items-center;
}

/* The little orange square before the title: only visible on the open item */
.orange-square {
  @apply h-[7px] w-0 shrink-0 bg-orange opacity-0 transition-all duration-300;
}
.item.is-open .orange-square {
  @apply mr-3 w-[7px] opacity-100;
}

/* The + / − sign on the right: a horizontal bar and a vertical bar */
.sign {
  @apply relative h-[10px] w-[10px] shrink-0;
}
.bar {
  @apply absolute bg-beige;
}
.horizontal {
  @apply left-0 top-1/2 h-[1.5px] w-full;
  transform: translateY(-50%);
}
.vertical {
  @apply left-1/2 top-0 h-full w-[1.5px] transition-transform duration-300;
  transform: translateX(-50%) scaleY(1);
}
.item.is-open .vertical {
  transform: translateX(-50%) scaleY(0); /* the vertical bar disappears, so + becomes − */
}

/* Opening and closing: a grid row that grows from 0 to its natural height */
.body {
  display: grid;
  grid-template-rows: 0fr;
  transition: grid-template-rows 0.4s cubic-bezier(0.7, 0, 0.15, 1);
}
.item.is-open .body {
  grid-template-rows: 1fr;
}
.body-inner {
  overflow: hidden; /* hides the text while the row is still small */
}
.text {
  @apply max-w-[30rem] space-y-3 pb-5 text-[clamp(15px,1.05vw,17px)] leading-[1.6] text-beige/65;
}
</style>
