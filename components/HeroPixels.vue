<script setup lang="ts">
// THE BLACK PIXELS BEHIND THE HERO
//
// A grid of solid black squares, drawn on a <canvas> behind the hero text:
//   - thickest along the bottom edge, where the hero joins the dark Work section
//   - a lighter sprinkle down the left and right sides
//   - nothing behind the headline, so the text is always easy to read
// Every square is placed by chance, so it looks different on every visit.
// It does not move. It is drawn once, and again when the window changes size.

const canvas = ref<HTMLCanvasElement>()

const COLOR = '#121211'
const SQUARE_SIZE = 56
const SQUARE_SIZE_PHONE = 36

function chanceOfSquare(col: number, row: number, cols: number, rows: number, isPhone: boolean) {
  const across = (col + 0.5) / cols
  const down = (row + 0.5) / rows
  const rowsFromBottom = rows - 1 - row

  const stripHalfWidth = isPhone ? 0.42 : 0.3
  const isBehindText = Math.abs(across - 0.5) < stripHalfWidth && rowsFromBottom > 2
  if (isBehindText) return 0

  const bottomRows = [1, 0.7, 0.35]
  const bottomChance = bottomRows[rowsFromBottom] ?? 0

  const fromBottomEdge = Math.pow(down, 5)
  const fromSides = Math.pow(Math.abs(across - 0.5) * 2, 3.5) * 0.5
  const gradientChance = Math.max(fromBottomEdge, fromSides) * 0.8

  return Math.max(bottomChance, gradientChance)
}

function draw() {
  const el = canvas.value!
  const context = el.getContext('2d')!
  const width = el.clientWidth
  const height = el.clientHeight
  const isPhone = width < 700

  const pixelRatio = Math.min(devicePixelRatio || 1, 2)
  el.width = width * pixelRatio
  el.height = height * pixelRatio
  context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0)

  const size = isPhone ? SQUARE_SIZE_PHONE : SQUARE_SIZE
  const cols = Math.ceil(width / size)
  const rows = Math.ceil(height / size)

  context.fillStyle = COLOR
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      if (Math.random() > chanceOfSquare(col, row, cols, rows, isPhone)) continue
      const x = col * size
      const y = height - (rows - row) * size
      context.fillRect(x, y, size + 0.5, size + 0.5) // +0.5 hides thin gaps between squares
    }
  }
}

onMounted(() => {
  draw()
  addEventListener('resize', draw)
})
onBeforeUnmount(() => removeEventListener('resize', draw))
</script>

<template>
  <canvas ref="canvas" class="pointer-events-none absolute inset-0 -z-10 h-full w-full" aria-hidden="true" />
</template>
