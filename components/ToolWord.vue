<script setup lang="ts">
import icons from '~/data/icons.json'

// A tool's name inside a sentence. Hover it (or tap it) and the tool's logo pops up above it in a small square.
defineProps<{ name: string }>()

// each tool's own brand colour, shown on the black square
const brand: Record<string, string> = { Figma: '#F24E1E', React: '#61DAFB' }
</script>

<template>
  <span class="toolword relative inline-block cursor-default border-b border-dashed border-current text-ink" tabindex="0">
    {{ name }}
    <span class="logo pointer-events-none absolute bottom-full left-1/2 mb-3 grid h-[58px] w-[58px] -translate-x-1/2 place-items-center rounded-[10px] bg-ink ring-1 ring-white/10 shadow-[0_12px_26px_rgba(0,0,0,.25)]" aria-hidden="true">
      <svg viewBox="0 0 24 24" class="h-[28px] w-[28px]" :style="{ color: brand[name] || '#e4e2db' }" fill="currentColor"><path :d="icons[name].d" /></svg>
    </span>
  </span>
</template>

<style scoped>
.logo {
  /* wiped in with hard steps, like the pixel dissolves on the rest of the site */
  clip-path: inset(100% 0 0 0);
  transform: translate(-50%, 6px);
  transition: clip-path 0.3s steps(4), transform 0.3s steps(3);
}
.toolword:hover .logo,
.toolword:focus .logo {
  clip-path: inset(0 0 0 0);
  transform: translate(-50%, 0);
}
</style>
