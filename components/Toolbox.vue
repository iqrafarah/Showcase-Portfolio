<script setup lang="ts">
import profile from '~/data/profile.json'
import icons from '~/data/icons.json'

// THE TOOLBOX in the About drawer: a row of small dark buttons, each with the tool's logo and name.
// The tools come from data/profile.json (stack). The logo shapes are in data/icons.json.
// A tool without a logo shows a short symbol instead (add one in `symbols`).
const symbols: Record<string, string> = { GoHighLevel: 'GHL' }

const tools = profile.stack.flatMap((group) => group.items).map((name) => ({ name, hasLogo: name in icons }))
</script>

<template>
  <ul class="flex flex-wrap gap-x-3 gap-y-2.5">
    <li v-for="item in tools" :key="item.name" class="tool">
      <span class="pair">
        <span class="btn small !bg-[#262625] !px-4 !text-white">
          <svg v-if="item.hasLogo" viewBox="0 0 24 24" class="h-[17px] w-[17px]" fill="currentColor" role="img" :aria-label="`${item.name} logo`">
            <path :d="icons[item.name].d" />
          </svg>
          <b v-else class="min-w-[17px] text-center text-[12px] font-medium">{{ symbols[item.name] }}</b>
        </span>
        <span class="btn small !bg-[#262625] !text-white">{{ item.name }}</span>
      </span>
    </li>
  </ul>
</template>

<style scoped>
.tool svg {
  transition: transform 0.4s cubic-bezier(0.2, 1.4, 0.4, 1);
}
.tool:hover svg {
  transform: rotate(-10deg) scale(1.25);
}
.tool .btn {
  transition: background-color 0.25s;
}
.tool:hover .btn {
  background-color: #3d3d3a !important;
}
</style>
