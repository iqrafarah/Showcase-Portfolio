<script setup lang="ts">
// A project card.
//  - When it scrolls into view the screenshot appears block by block as big pixels,
//    the pixels get smaller, and then the real screenshot fades in.
//  - On hover a small info panel follows the pointer.
const props = defineProps<{ project: any; index: number; ratio: string }>()
const asset = useAsset()

const frame = ref<HTMLElement>()
const canvas = ref<HTMLCanvasElement>()
const panel = ref<HTMLElement>()
const sharp = ref(false) // the real screenshot is showing
const hovering = ref(false)


let image: HTMLImageElement
let imageLoaded = false
let onScreen = false
let started = false
let timers: number[] = []
let revealFrame = 0

// ---- drawing the screenshot as pixels ----------------------------------------

// Draws the screenshot (cropped to fill the frame) onto a tiny canvas of cols x rows pixels.
function shrinkImage(cols: number, rows: number) {
  const small = document.createElement('canvas')
  small.width = cols
  small.height = rows
  const smallCtx = small.getContext('2d', { willReadFrequently: true })!

  const frameRatio = frame.value!.clientWidth / frame.value!.clientHeight
  let cropWidth = image.naturalWidth
  let cropHeight = image.naturalHeight
  if (cropWidth / cropHeight > frameRatio) cropWidth = cropHeight * frameRatio
  else cropHeight = cropWidth / frameRatio

  const cropX = (image.naturalWidth - cropWidth) / 2
  const cropY = (image.naturalHeight - cropHeight) / 2
  smallCtx.drawImage(image, cropX, cropY, cropWidth, cropHeight, 0, 0, cols, rows)
  return small
}

function prepareCanvas() {
  const el = canvas.value!
  const dpr = Math.min(devicePixelRatio || 1, 2)
  el.width = frame.value!.clientWidth * dpr
  el.height = frame.value!.clientHeight * dpr
  const ctx = el.getContext('2d')!
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  ctx.imageSmoothingEnabled = false
  return ctx
}

function drawPixels(cols: number) {
  const width = frame.value!.clientWidth
  const height = frame.value!.clientHeight
  const rows = Math.max(2, Math.round((cols * height) / width))
  const ctx = prepareCanvas()
  ctx.drawImage(shrinkImage(cols, rows), 0, 0, width, height)
}

// ---- the intro --------------------------------------------------------------------

// Shows the screenshot as big pixels, one random block at a time.
function revealBlocks(cols: number, done: () => void) {
  const width = frame.value!.clientWidth
  const height = frame.value!.clientHeight
  const rows = Math.max(2, Math.round((cols * height) / width))
  const small = shrinkImage(cols, rows)
  const ctx = prepareCanvas()

  const blockWidth = width / cols
  const blockHeight = height / rows
  const order = Array.from({ length: cols * rows }, (_, i) => i).sort(() => Math.random() - 0.5)
  const startTime = performance.now()
  const duration = 1100
  let shown = 0
  let settled = 0 // blocks that have already turned from orange into the picture
  const orangeFor = 220 // how long a new block stays orange (ms)
  const shownAt: number[] = []

  function block(index: number, picture: boolean) {
    const col = order[index] % cols
    const row = Math.floor(order[index] / cols)
    if (picture) ctx.drawImage(small, col, row, 1, 1, col * blockWidth, row * blockHeight, blockWidth + 0.5, blockHeight + 0.5)
    else {
      ctx.fillStyle = '#ed4407'
      ctx.fillRect(col * blockWidth, row * blockHeight, blockWidth + 0.5, blockHeight + 0.5)
    }
  }

  // every block pops up orange, then turns into the real pixel of the screenshot
  function step(now: number) {
    const target = Math.min(order.length, Math.floor(((now - startTime) / duration) * order.length))
    for (; shown < target; shown++) {
      shownAt[shown] = now
      block(shown, false)
    }
    while (settled < shown && now - shownAt[settled] > orangeFor) block(settled++, true)
    if (settled < order.length) revealFrame = requestAnimationFrame(step)
    else done()
  }
  revealFrame = requestAnimationFrame(step)
}

function start() {
  if (started || !imageLoaded || !onScreen) return
  started = true

  if (prefersReducedMotion()) {
    sharp.value = true
    return
  }
  revealBlocks(14, () => {
    const steps = [24, 40, 70]
    steps.forEach((cols, i) => timers.push(window.setTimeout(() => drawPixels(cols), i * 140)))
    timers.push(window.setTimeout(() => (sharp.value = true), steps.length * 140))
  })
}

// back to the start, so the intro can play again when the card returns
function reset() {
  started = false
  sharp.value = false
  cancelAnimationFrame(revealFrame)
  timers.forEach(clearTimeout)
  timers = []
  const el = canvas.value!
  el.getContext('2d')!.clearRect(0, 0, el.width, el.height)
}

// ---- hover: the info panel follows the pointer ----------------------------------

let targetX = 0
let targetY = 0
let panelX = 0
let panelY = 0
let frameId = 0

function movePanel() {
  panelX += (targetX - panelX) * 0.12
  panelY += (targetY - panelY) * 0.12
  const maxX = frame.value!.clientWidth - panel.value!.offsetWidth - 10
  const maxY = frame.value!.clientHeight - panel.value!.offsetHeight - 10
  const x = clamp(panelX + 20, 10, Math.max(10, maxX))
  const y = clamp(panelY + 20, 10, Math.max(10, maxY))
  panel.value!.style.transform = `translate(${x}px, ${y}px)`
  if (hovering.value) frameId = requestAnimationFrame(movePanel)
}

function readPointer(event: PointerEvent) {
  const box = frame.value!.getBoundingClientRect()
  targetX = event.clientX - box.left
  targetY = event.clientY - box.top
}
function onEnter(event: PointerEvent) {
  if (event.pointerType === 'touch') return
  readPointer(event)
  panelX = targetX
  panelY = targetY
  hovering.value = true
  movePanel()
}
function onLeave() {
  hovering.value = false
}

onMounted(() => {
  image = new Image()
  image.onload = () => {
    imageLoaded = true
    start()
  }
  image.src = asset(props.project.image)

  // play when the card has come up from the bottom edge of the screen (its top is in the lower 80%),
  // so you watch it happen. It starts over when the card has left the screen completely.
  const visibleObserver = new IntersectionObserver(
    ([entry]) => {
      onScreen = entry.isIntersecting
      if (onScreen) start()
      else if (started) reset()
    },
    { rootMargin: '0px 0px -18% 0px', threshold: 0.05 }
  )
  visibleObserver.observe(frame.value!)

  onBeforeUnmount(() => {
    visibleObserver.disconnect()
    cancelAnimationFrame(frameId)
    cancelAnimationFrame(revealFrame)
    timers.forEach(clearTimeout)
  })
})
</script>

<template>
  <a :href="project.links[0].url" target="_blank" rel="noopener" class="block" :aria-label="`${project.title}: ${project.summary}`">
    <div ref="frame" class="relative overflow-hidden bg-ink-2" :class="ratio" @pointerenter="onEnter" @pointermove="readPointer" @pointerleave="onLeave">
      <canvas ref="canvas" class="absolute inset-0 h-full w-full" aria-hidden="true" />

      <img
        :src="asset(project.image)"
        :alt="`Screenshot of ${project.title}`"
        class="absolute inset-0 h-full w-full object-cover transition-[opacity,transform] duration-700 ease-out"
        :class="[sharp ? 'opacity-100' : 'opacity-0', hovering ? 'scale-[1.04]' : 'scale-100']"
        loading="lazy"
        draggable="false"
      />

      <!-- hover panel: black card, role on top, the stack as small tags -->
      <dl ref="panel" class="pointer-events-none absolute left-0 top-0 w-[min(86%,320px)] transition-opacity duration-200" :class="hovering ? 'opacity-100' : 'opacity-0'">
        <div class="rounded-xl bg-ink-2 p-4 font-mono text-[10.5px] uppercase text-beige">
          <div class="flex items-center justify-between gap-3">
            <dt class="sr-only">Role</dt>
            <dd class="flex min-w-0 items-center gap-2"><span class="h-[7px] w-[7px] shrink-0 bg-orange" aria-hidden="true"></span><span class="min-w-0">{{ project.role }}</span></dd>
            <template v-if="project.year"><dt class="sr-only">Year</dt><dd class="shrink-0 text-[#8c8b86]">{{ project.year }}</dd></template>
          </div>
          <dt class="sr-only">Stack</dt>
          <dd class="mt-3 flex flex-wrap gap-1.5">
            <span v-for="tech in project.techs" :key="tech" class="bg-ink-3 px-2 py-1 text-beige/80">{{ tech }}</span>
          </dd>
        </div>
      </dl>
    </div>

    <div class="mt-4 flex items-baseline justify-between gap-4">
      <h3 class="font-mono text-[20px] uppercase text-beige">{{ project.title }}</h3>
      <span class="font-mono text-[13px] uppercase text-beige/50">{{ String(index + 1).padStart(2, '0') }}</span>
    </div>
    <p class="mt-1 max-w-[34rem] text-[16px] leading-snug text-beige/65">{{ project.summary }}</p>
  </a>
</template>
