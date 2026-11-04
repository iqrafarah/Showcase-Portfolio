<script setup lang="ts">
// THE PIXEL DISSOLVE BETWEEN TWO SECTIONS
// A band of square cells that turns one colour into another (used in app.vue: dark Work section -> light Contact section).
// While you scroll, the "edge" between the two colours moves, so the cells seem to dissolve into each other.
//
//   <PixelDissolve from="#121211" into="#efeee9" />     from = the colour above, into = the colour below
const props = defineProps<{ from: string; into: string }>()

const canvas = ref<HTMLCanvasElement>()
const cell = 24 // size of one square in pixels

onMounted(() => {
  const el = canvas.value!
  const ctx = el.getContext('2d')!
  let cols = 0
  let rows = 0
  let cells: number[] = [] // one random number (0 to 1) per square: decides when it changes colour
  let visible = false // only redraw while the band is on screen

  // measures the band, makes the random numbers, and draws. Runs at the start and when the size changes.
  function build() {
    const dpr = Math.min(devicePixelRatio || 1, 2)
    el.width = el.clientWidth * dpr
    el.height = el.clientHeight * dpr
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    cols = Math.ceil(el.clientWidth / cell)
    rows = Math.ceil(el.clientHeight / cell)

    // random numbers that often repeat along a row, so the cells form wide bars
    cells = []
    for (let i = 0; i < cols * rows; i++) {
      const sameAsLeft = i % cols > 0 && Math.random() < 0.6
      cells.push(sameAsLeft ? cells[i - 1] : Math.random())
    }
    draw()
  }

  // paints the band for the current scroll position
  function draw() {
    const box = el.getBoundingClientRect()
    // how far the band has scrolled through the screen: 0 = just entering at the bottom, 1 = just left at the top
    const scrolled = clamp((innerHeight - box.top) / (innerHeight + box.height))

    ctx.fillStyle = props.from
    ctx.fillRect(0, 0, el.clientWidth, el.clientHeight)
    ctx.fillStyle = props.into
    for (let row = 0; row < rows; row++) {
      const t = row / (rows - 1) // 0 at the top, 1 at the bottom
      // chance that a cell has the new colour: 0 at the top edge, 1 at the bottom edge
      const chance = t * 1.3 - 0.15 + (scrolled - 0.5) * 0.5 * Math.sin(Math.PI * t)
      for (let col = 0; col < cols; col++) {
        if (cells[row * cols + col] < chance) ctx.fillRect(col * cell, row * cell, cell, cell)
      }
    }
  }

  function onScroll() {
    if (visible) requestAnimationFrame(draw)
  }

  const resizeObserver = new ResizeObserver(build)
  resizeObserver.observe(el)
  const visibleObserver = new IntersectionObserver(([entry]) => (visible = entry.isIntersecting))
  visibleObserver.observe(el)
  addEventListener('scroll', onScroll, { passive: true })

  onBeforeUnmount(() => {
    resizeObserver.disconnect()
    visibleObserver.disconnect()
    removeEventListener('scroll', onScroll)
  })
})
</script>

<template>
  <canvas ref="canvas" class="block h-[clamp(280px,40vw,560px)] w-full" aria-hidden="true" />
</template>
