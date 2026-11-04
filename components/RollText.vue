<script setup lang="ts">
// TEXT THAT ROLLS UP ON HOVER (used inside buttons).
// It shows the text twice, one above the other. On hover (see .roll in assets/css/main.css) both move up
// by one line, so the second copy takes the place of the first.
//   <RollText text="About" />
defineProps<{ text: string }>()
</script>

<template>
  <span class="roll">
    <span>{{ text }}</span>
    <span aria-hidden="true">{{ text }}</span>
  </span>
</template>
