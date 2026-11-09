<script setup lang="ts">
import saved from '~/data/heatmap.json';
import profile from '~/data/profile.json';

// THE CONTRIBUTION GRAPH in the About drawer (the same look as the graph on a GitHub profile).
// It shows the last 12 months and asks GitHub for live numbers, so it updates by itself when you commit.
// If that does not work, it shows the saved graph from data/heatmap.json instead.
const props = defineProps<{ dark?: boolean; hideTotal?: boolean }>();

const WEEKS = 53;
const levels = ref(new Map<string, number>());
const total = ref(saved.total);
const status = ref<'saved' | 'live'>('saved');
const savedYear = new Date(
  new Date(saved.start + 'T00:00:00').getTime() + 7 * 86400000,
).getFullYear();

function dayKey(date: Date) {
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
}

const savedDay = new Date(saved.start + 'T00:00:00');
saved.weeks.forEach((week) => {
  for (const level of week) {
    levels.value.set(dayKey(savedDay), Number(level));
    savedDay.setDate(savedDay.getDate() + 1);
  }
});

onMounted(async () => {
  try {
    const response = await fetch(
      `https://github-contributions-api.jogruber.de/v4/${profile.githubUser}?y=last`,
    );
    const data = await response.json();
    const live = new Map<string, number>();
    data.contributions.forEach((day: any) => live.set(day.date, day.level));
    levels.value = live;
    total.value = Number(data.total?.lastYear ?? 0);
    status.value = 'live';
  } catch {
  }
});

const weeks = computed(() => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  let day: Date;
  let end = today;
  if (status.value === 'live') {
    const lastDay = new Date(today);
    lastDay.setDate(lastDay.getDate() + (6 - lastDay.getDay()));
    day = new Date(lastDay);
    day.setDate(day.getDate() - WEEKS * 7 + 1);
  } else {
    day = new Date(saved.start + 'T00:00:00');
    end = new Date(savedYear, 11, 31);
  }

  const result = [];
  for (let w = 0; w < WEEKS; w++) {
    const week = [];
    for (let d = 0; d < 7; d++) {
      const key = dayKey(day);
      week.push({ key, level: levels.value.get(key) || 0, future: day > end });
      day.setDate(day.getDate() + 1);
    }
    result.push(week);
  }
  return result;
});

const months = computed(() => {
  const list: { column: number; name: string }[] = [];
  let lastMonth = -1;
  weeks.value.forEach((week, column) => {
    const date = new Date(week[0].key + 'T00:00:00');
    if (date.getMonth() !== lastMonth)
      list.push({
        column,
        name: date.toLocaleDateString('en-GB', { month: 'short' }),
      });
    lastMonth = date.getMonth();
  });
  return list.filter(
    (month, i) => !list[i + 1] || list[i + 1].column - month.column > 2,
  );
});

const shades = computed(() => [
  props.dark ? 'bg-beige/10' : 'bg-ink/10',
  'bg-orange/30',
  'bg-orange/55',
  'bg-orange/80',
  'bg-orange',
]);
</script>

<template>
  <div>
    <div
      class="relative mb-2 h-4 font-mono text-[11px] uppercase opacity-60"
      aria-hidden="true"
    >
      <span
        v-for="month in months"
        :key="month.column"
        class="absolute"
        :style="{ left: (month.column / WEEKS) * 100 + '%' }"
        >{{ month.name }}</span
      >
    </div>

    <div
      class="grid gap-[3px] sm:gap-1"
      :style="{ gridTemplateColumns: `repeat(${WEEKS}, minmax(0, 1fr))` }"
      role="img"
      :aria-label="`${total} contributions`"
    >
      <div v-for="(week, w) in weeks" :key="w" class="grid gap-[3px] sm:gap-1">
        <span
          v-for="(day, d) in week"
          :key="day.key"
          class="aspect-square rounded-[3px] sm:rounded-[4px]"
          :class="day.future ? 'bg-transparent' : shades[day.level]"
          :style="
            day.future
              ? undefined
              : {
                  animation: 'cellIn .5s both',
                  animationDelay: w * 14 + d * 6 + 'ms',
                }
          "
        />
      </div>
    </div>

    <div
      class="mt-4 flex flex-wrap items-center justify-between gap-3 font-mono text-[12px] uppercase opacity-70"
    >
      <span v-if="!hideTotal">
        {{ status === 'live' ? 'The last year' : savedYear }}:
        {{ total }} contributions
        <span v-if="status === 'live'">· live from GitHub</span>
      </span>
      <span v-else>Every square is a day I built something</span>
      <span class="flex items-center gap-1.5">
        Less
        <i
          v-for="(s, i) in shades"
          :key="i"
          class="h-3.5 w-3.5 rounded-[3px]"
          :class="s"
        />
        More
      </span>
    </div>
  </div>
</template>
