<script setup lang="ts">
import gsap from 'gsap'

// THE START SCREEN
// When the site opens, the whole screen is covered with black squares (a "pixel wall").
// Then the squares disappear block by block, from the top down, and the page is underneath.
//
// The screen is already black from the very first moment (the rule `.js .loader` in assets/css/main.css),
// so the visitor never sees an unstyled page. This component draws the squares on top and takes them away.
//
// "intro-done" is an event the page can listen for: it is sent when the wall starts to open.

const isActive = ref(true) // false = the wall is gone and this component shows nothing
const canvas = ref<HTMLCanvasElement>()
const loader = ref<HTMLElement>()

const SQUARE_SIZE = 32 // pixels
const WALL_COLOR = '#121211'

// Tell the rest of the page that the wall is opening (only once)
let introSent = false
function sendIntroDone() {
  if (introSent) return
  introSent = true
  dispatchEvent(new Event('intro-done'))
}

function removeWall() {
  document.body.classList.remove('lock')
  isActive.value = false
}

onMounted(() => {
  // Safety net: whatever goes wrong, after 7.5 seconds the wall goes away
  setTimeout(() => {
    removeWall()
    sendIntroDone()
  }, 7500)

  // No animation for visitors who asked for less movement (or when JavaScript animations are off)
  const animationsAllowed = !prefersReducedMotion() && document.documentElement.classList.contains('js')
  if (!animationsAllowed) {
    isActive.value = false
    sendIntroDone()
    return
  }

  document.body.classList.add('lock') // the page can't be scrolled while the wall is there

  const el = canvas.value!
  const context = el.getContext('2d')!

  // `progress` goes from 0 (full wall) to 1 (no wall). The animation below changes this number.
  const wall = { progress: 0 }
  let width = 0
  let height = 0
  let cols = 0
  let rows = 0
  // For every square: a number from 0 to 1 that says WHEN it disappears (0 = first, 1 = last)
  let disappearsAt: number[] = []

  // Works out the size of the grid and when each square disappears. Runs again when the window is resized.
  function buildGrid() {
    width = innerWidth
    height = innerHeight
    const pixelRatio = Math.min(devicePixelRatio || 1, 2)
    el.width = width * pixelRatio
    el.height = height * pixelRatio
    context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0)

    cols = Math.ceil(width / SQUARE_SIZE)
    rows = Math.ceil(height / SQUARE_SIZE)

    disappearsAt = []
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        // Squares in a row often disappear together, so they form wide bars.
        const sameAsLeftNeighbour = col > 0 && Math.random() < 0.55
        const leftNeighbour = disappearsAt[row * cols + col - 1]
        // Otherwise: mostly random, but the top rows go first
        const own = Math.random() * 0.7 + (row / rows) * 0.3
        disappearsAt.push(sameAsLeftNeighbour ? leftNeighbour : own)
      }
    }
  }

  // Draws every square that has not disappeared yet. Runs on every screen refresh.
  function draw() {
    context.clearRect(0, 0, width, height)
    context.fillStyle = WALL_COLOR
    const disappearedBefore = wall.progress * 1.25 - 0.1 // squares with a lower number than this are gone
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        if (disappearsAt[row * cols + col] < disappearedBefore) continue
        context.fillRect(col * SQUARE_SIZE, row * SQUARE_SIZE, SQUARE_SIZE + 0.5, SQUARE_SIZE + 0.5)
      }
    }
  }

  buildGrid()
  addEventListener('resize', buildGrid)
  draw()
  gsap.ticker.add(draw)
  if (loader.value) loader.value.style.background = 'transparent' // from here on the canvas paints the wall

  // Wait until the fonts are loaded (at most 3 seconds), so the text does not jump when the wall is gone
  const fontsReady = Promise.race([
    Promise.all([document.fonts.load('500 1em Geist'), document.fonts.load('400 1em "Geist Mono"'), document.fonts.ready]),
    new Promise((resolve) => setTimeout(resolve, 3000))
  ]).catch(() => {})

  fontsReady.then(() => {
    gsap.to(wall, {
      progress: 1,
      duration: 1.5,
      delay: 0.35,
      ease: 'power1.inOut',
      onStart: () => setTimeout(sendIntroDone, 500), // the page content rises while the squares go
      onComplete: () => {
        gsap.ticker.remove(draw)
        removeEventListener('resize', buildGrid)
        removeWall()
      }
    })
  })
})
</script>

<template>
  <div v-if="isActive" ref="loader" data-loader class="loader pointer-events-none fixed inset-0 z-[100]" aria-hidden="true">
    <canvas ref="canvas" class="absolute inset-0 h-full w-full" />
  </div>
</template>
