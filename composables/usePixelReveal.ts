// THE "PIXEL REVEAL" OF A WORK CARD
//
// What the visitor sees, when a card scrolls into view:
//   1. the screenshot appears as a few big blocks, one random block at a time (each one flashes orange first)
//   2. the blocks get smaller in three steps (24, 40, 70 blocks wide)
//   3. the real, sharp screenshot fades in
// When the card leaves the screen everything resets, so it plays again the next time.
//
// How it works: the screenshot is drawn onto a <canvas> that lies over the card.
// To make "big pixels" we first draw the picture very small (for example 14 x 9 pixels)
// and then stretch that tiny picture over the card without smoothing.
//
// If a project has no picture, `imageUrl` is empty and nothing happens.
//
// Use it in a component like this:
//   const { isSharp } = usePixelReveal(frame, canvas, imageUrl)
//   isSharp is true when the real screenshot should be visible.

const FIRST_BLOCKS_WIDE = 14
const SHARPEN_STEPS = [24, 40, 70]
const SHARPEN_DELAY = 80
const REVEAL_DURATION = 550
const ORANGE_FLASH = 110
const ORANGE = '#ed4407'

export function usePixelReveal(frame: Ref<HTMLElement | undefined>, canvas: Ref<HTMLCanvasElement | undefined>, imageUrl: string) {
  const isSharp = ref(false)

  let image: HTMLImageElement
  let imageIsLoaded = false
  let cardIsOnScreen = false
  let hasStarted = false
  let timeouts: number[] = []
  let animationFrame = 0

  function makeTinyCopy(cols: number, rows: number) {
    const tiny = document.createElement('canvas')
    tiny.width = cols
    tiny.height = rows
    const tinyContext = tiny.getContext('2d', { willReadFrequently: true })!

    const cardRatio = frame.value!.clientWidth / frame.value!.clientHeight
    let cropWidth = image.naturalWidth
    let cropHeight = image.naturalHeight
    if (cropWidth / cropHeight > cardRatio) cropWidth = cropHeight * cardRatio
    else cropHeight = cropWidth / cardRatio
    const cropLeft = (image.naturalWidth - cropWidth) / 2
    const cropTop = (image.naturalHeight - cropHeight) / 2

    tinyContext.drawImage(image, cropLeft, cropTop, cropWidth, cropHeight, 0, 0, cols, rows)
    return tiny
  }

  function prepareCanvas() {
    const el = canvas.value!
    const pixelRatio = Math.min(devicePixelRatio || 1, 2)
    el.width = frame.value!.clientWidth * pixelRatio
    el.height = frame.value!.clientHeight * pixelRatio
    const context = el.getContext('2d')!
    context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0)
    context.imageSmoothingEnabled = false
    return context
  }

  function rowsFor(cols: number) {
    return Math.max(2, Math.round((cols * frame.value!.clientHeight) / frame.value!.clientWidth))
  }

  function revealBlocks(done: () => void) {
    const width = frame.value!.clientWidth
    const height = frame.value!.clientHeight
    const cols = FIRST_BLOCKS_WIDE
    const rows = rowsFor(cols)
    const tinyCopy = makeTinyCopy(cols, rows)
    const context = prepareCanvas()
    const blockWidth = width / cols
    const blockHeight = height / rows

    const order = Array.from({ length: cols * rows }, (_, i) => i).sort(() => Math.random() - 0.5)

    const startTime = performance.now()
    let blocksShown = 0
    let blocksSettled = 0
    const shownAt: number[] = []

    function drawBlock(position: number, asPicture: boolean) {
      const col = order[position] % cols
      const row = Math.floor(order[position] / cols)
      const x = col * blockWidth
      const y = row * blockHeight
      if (asPicture) {
        context.drawImage(tinyCopy, col, row, 1, 1, x, y, blockWidth + 0.5, blockHeight + 0.5)
      } else {
        context.fillStyle = ORANGE
        context.fillRect(x, y, blockWidth + 0.5, blockHeight + 0.5)
      }
    }

    function step(now: number) {
      const shouldBeShown = Math.min(order.length, Math.floor(((now - startTime) / REVEAL_DURATION) * order.length))
      for (; blocksShown < shouldBeShown; blocksShown++) {
        shownAt[blocksShown] = now
        drawBlock(blocksShown, false)
      }
      while (blocksSettled < blocksShown && now - shownAt[blocksSettled] > ORANGE_FLASH) {
        drawBlock(blocksSettled, true)
        blocksSettled++
      }

      if (blocksSettled < order.length) animationFrame = requestAnimationFrame(step)
      else done()
    }
    animationFrame = requestAnimationFrame(step)
  }

  function drawPixels(cols: number) {
    const context = prepareCanvas()
    context.drawImage(makeTinyCopy(cols, rowsFor(cols)), 0, 0, frame.value!.clientWidth, frame.value!.clientHeight)
  }

  function sharpen() {
    SHARPEN_STEPS.forEach((cols, i) => {
      timeouts.push(window.setTimeout(() => drawPixels(cols), i * SHARPEN_DELAY))
    })
    timeouts.push(window.setTimeout(() => (isSharp.value = true), SHARPEN_STEPS.length * SHARPEN_DELAY))
  }

  function start() {
    if (hasStarted || !imageIsLoaded || !cardIsOnScreen) return
    hasStarted = true

    if (prefersReducedMotion()) {
      isSharp.value = true
      return
    }
    revealBlocks(sharpen)
  }

  function reset() {
    hasStarted = false
    isSharp.value = false
    stopEverything()
    const el = canvas.value!
    el.getContext('2d')!.clearRect(0, 0, el.width, el.height)
  }

  function stopEverything() {
    cancelAnimationFrame(animationFrame)
    timeouts.forEach(clearTimeout)
    timeouts = []
  }

  onMounted(() => {
    if (!imageUrl) return

    image = new Image()
    image.onload = () => {
      imageIsLoaded = true
      start()
    }
    image.src = imageUrl

    const observer = new IntersectionObserver(
      ([entry]) => {
        cardIsOnScreen = entry.isIntersecting
        if (cardIsOnScreen) start()
        else if (hasStarted) reset()
      },
      { rootMargin: '0px 0px -18% 0px', threshold: 0.05 }
    )
    observer.observe(frame.value!)

    onBeforeUnmount(() => {
      observer.disconnect()
      stopEverything()
    })
  })

  return { isSharp }
}
