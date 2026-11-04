<script setup lang="ts">
// THE SMALL FACTS UNDER THE ACCORDION: role, project type (optional) and the tech stack.
// All of it comes from the project in data/work.json:
//   role           shown as "Role"                                   (optional)
//   contribution   if a project has this, "My contribution" is shown instead of "Role"   (optional)
//   type           shown as "Project type"                           (optional)
//   techs          the list of tags                                  (optional)
// A row is only shown when its information exists.
defineProps<{ project: any }>()
</script>

<template>
  <dl class="facts">
    <div v-if="project.contribution || project.role" class="row">
      <dt>{{ project.contribution ? 'My contribution' : 'Role' }}</dt>
      <dd class="with-square">
        <span class="orange-square" aria-hidden="true"></span>
        {{ project.contribution || project.role }}
      </dd>
    </div>

    <div v-if="project.type" class="row">
      <dt>Project type</dt>
      <dd>{{ project.type }}</dd>
    </div>

    <div v-if="project.techs?.length" class="row">
      <dt>Stack</dt>
      <dd class="tags">
        <span v-for="tech in project.techs" :key="tech" class="tag">{{ tech }}</span>
      </dd>
    </div>
  </dl>
</template>

<style scoped>
.facts {
  @apply font-mono text-[12px] uppercase;
}
/* every row has a thin line under it, except the last one */
.row {
  @apply flex items-baseline justify-between gap-6 border-b border-beige/15 py-3;
}
.row:last-child {
  @apply border-b-0;
}
dt {
  @apply shrink-0 text-beige/45; /* the grey label on the left */
}
dd {
  @apply text-right;
}
.with-square {
  @apply flex items-center gap-2;
}
.orange-square {
  @apply h-[7px] w-[7px] shrink-0 bg-orange;
}
.tags {
  @apply flex flex-wrap justify-end gap-1.5;
}
.tag {
  @apply bg-ink-3 px-2 py-1 text-beige/80;
}
</style>
