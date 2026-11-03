<script setup lang="ts">
import gsap from 'gsap'

// Big black squares behind the hero, thickest at the bottom where they join the dark Work section, fading out upwards.
// Every square has its own strength (a few fixed steps, like the pixel dissolve) and slowly breathes.
const canvas = ref<HTMLCanvasElement>()

onMounted(() => {
  const el = canvas.value!
  const ctx = el.getContext('2d')!
  let width = 0
  let height = 0
  let cells: { x: number; y: number; size: number; alpha: number; phase: number; speed: number; dark: boolean }[] = []

  const steps = [1]

  function build() {
    width = el.clientWidth
    height = el.clientHeight
    const dpr = Math.min(devicePixelRatio || 1, 2)
    el.width = width * dpr
    el.height = height * dpr
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

    const size = width < 700 ? 36 : 56
    const cols = Math.ceil(width / size)
    const rows = Math.ceil(height / size)
    cells = []
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const nx = (col + 0.5) / cols
        const ny = (row + 0.5) / rows
        // black pixels, thickest along the bottom (where the dark Work section starts) and fading upwards,
        // with a lighter sprinkle down the sides
        const bottom = Math.pow(ny, 5)
        const side = Math.pow(Math.abs(nx - 0.5) * 2, 3.5) * 0.5
        const strength = Math.max(bottom, side)
                // the last three rows thicken evenly across the whole width, so the hero melts into the dark Work section
        const fromBottom = rows - 1 - row
        const bottomChance = [1, 0.7, 0.35][fromBottom] ?? 0
        // keep the area behind the text clear, so the headline always reads
        const behindText = Math.abs(nx - 0.5) < (width < 700 ? 0.42 : 0.3) && fromBottom > 2
        if (behindText) continue
        if (Math.random() > Math.max(bottomChance, strength * 0.8)) continue
        const level = 0
        cells.push({
          x: col * size,
          y: height - (rows - row) * size, // grid starts from the bottom so the last row is always whole
          size,
          alpha: steps[level],
          phase: Math.random() * Math.PI * 2,
          speed: 0.3 + Math.random() * 0.6,
          dark: true
        })
      }
    }
  }

  function draw(time = 0) {
    ctx.clearRect(0, 0, width, height)
    for (const cell of cells) {
      const breathe = prefersReducedMotion() ? 1 : 0.8 + 0.2 * Math.sin(time * cell.speed + cell.phase)
      ctx.globalAlpha = cell.alpha * (cell.alpha === 1 ? 1 : breathe)
      ctx.fillStyle = cell.dark ? '#121211' : '#ed4407'
      ctx.fillRect(cell.x, cell.y, cell.size + 0.5, cell.size + 0.5)
    }
    ctx.globalAlpha = 1
  }

  build()
  draw()
  addEventListener('resize', () => (build(), draw()))
  if (!prefersReducedMotion()) gsap.ticker.add((time) => draw(time))
})
</script>

<template>
  <canvas ref="canvas" class="pointer-events-none absolute inset-0 -z-10 h-full w-full" aria-hidden="true" />
</template>
