<script setup lang="ts">
import gsap from 'gsap'

// The start screen: nothing but the pixel wall. The screen is black from the very first paint (see main.css),
// then the black squares disappear block by block, from the top down, and the page is underneath.
const active = ref(true)
const canvas = ref<HTMLCanvasElement>()
const loader = ref<HTMLElement>()

let introFired = false
function fireIntro() {
  if (introFired) return
  introFired = true
  dispatchEvent(new Event('intro-done'))
}

onMounted(() => {
  // safety net: whatever goes wrong, the wall goes away and the page appears
  setTimeout(() => {
    document.body.classList.remove('lock')
    active.value = false
    fireIntro()
  }, 7500)

  if (prefersReducedMotion() || !document.documentElement.classList.contains('js')) {
    active.value = false
    fireIntro()
    return
  }
  document.body.classList.add('lock')

  const el = canvas.value!
  const ctx = el.getContext('2d')!
  const cell = 32
  const WALL = '#121211'
  const state = { dissolve: 0 }
  let width = 0
  let height = 0
  let cols = 0
  let rows = 0
  let openOrder: number[] = [] // when each square disappears (0 to 1)

  function build() {
    width = innerWidth
    height = innerHeight
    const dpr = Math.min(devicePixelRatio || 1, 2)
    el.width = width * dpr
    el.height = height * dpr
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    cols = Math.ceil(width / cell)
    rows = Math.ceil(height / cell)
    openOrder = []
    for (let row = 0; row < rows; row++) {
      // squares in a row often go together, so they form wide bars; the top goes first
      for (let col = 0; col < cols; col++) {
        const sameAsLeft = col > 0 && Math.random() < 0.55
        openOrder.push(sameAsLeft ? openOrder[row * cols + col - 1] : Math.random() * 0.7 + (row / rows) * 0.3)
      }
    }
  }

  function draw() {
    ctx.clearRect(0, 0, width, height)
    ctx.fillStyle = WALL
    const opened = state.dissolve * 1.25 - 0.1
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        if (openOrder[row * cols + col] < opened) continue // this square is gone
        ctx.fillRect(col * cell, row * cell, cell + 0.5, cell + 0.5)
      }
    }
  }

  build()
  addEventListener('resize', build)
  draw()
  gsap.ticker.add(draw)
  if (loader.value) loader.value.style.background = 'transparent' // the canvas paints the wall from here

  // wait until the fonts are loaded (at most 3 seconds), so the text does not change size and jump when the wall is gone
  const fonts = Promise.race([
    Promise.all([document.fonts.load('500 1em Geist'), document.fonts.load('400 1em "Geist Mono"'), document.fonts.ready]),
    new Promise((resolve) => setTimeout(resolve, 3000))
  ]).catch(() => {})

  fonts.then(() => {
    gsap.to(state, {
      dissolve: 1,
      duration: 1.5,
      delay: 0.35,
      ease: 'power1.inOut',
      onStart: () => setTimeout(fireIntro, 500), // the page content rises while the squares go
      onComplete: () => {
        gsap.ticker.remove(draw)
        removeEventListener('resize', build)
        document.body.classList.remove('lock')
        active.value = false
      }
    })
  })
})
</script>

<template>
  <div v-if="active" ref="loader" data-loader class="loader pointer-events-none fixed inset-0 z-[100]" aria-hidden="true">
    <canvas ref="canvas" class="absolute inset-0 h-full w-full" />
  </div>
</template>
