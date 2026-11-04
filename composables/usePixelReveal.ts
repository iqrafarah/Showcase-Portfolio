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

const FIRST_BLOCKS_WIDE = 14 // how many blocks wide the first, biggest version is
const SHARPEN_STEPS = [24, 40, 70] // then it gets finer in these steps
const SHARPEN_DELAY = 140 // milliseconds between those steps
const REVEAL_DURATION = 1100 // milliseconds the first reveal takes
const ORANGE_FLASH = 220 // milliseconds a new block stays orange before it shows the picture
const ORANGE = '#ed4407'

export function usePixelReveal(frame: Ref<HTMLElement | undefined>, canvas: Ref<HTMLCanvasElement | undefined>, imageUrl: string) {
  const isSharp = ref(false)

  // what the animation is doing right now
  let image: HTMLImageElement // created in onMounted: the server has no Image
  let imageIsLoaded = false
  let cardIsOnScreen = false
  let hasStarted = false
  let timeouts: number[] = []
  let animationFrame = 0

  // ---- helpers for drawing -------------------------------------------------------------

  // The card shows the screenshot cropped to fill it (like object-fit: cover).
  // This draws that crop onto a tiny canvas that is `cols` x `rows` pixels big.
  function makeTinyCopy(cols: number, rows: number) {
    const tiny = document.createElement('canvas')
    tiny.width = cols
    tiny.height = rows
    const tinyContext = tiny.getContext('2d', { willReadFrequently: true })!

    // work out which part of the screenshot is visible in the card
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

  // Gets the big canvas ready (sharp on high-resolution screens) and returns its drawing tool.
  function prepareCanvas() {
    const el = canvas.value!
    const pixelRatio = Math.min(devicePixelRatio || 1, 2)
    el.width = frame.value!.clientWidth * pixelRatio
    el.height = frame.value!.clientHeight * pixelRatio
    const context = el.getContext('2d')!
    context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0)
    context.imageSmoothingEnabled = false // keep the pixels hard-edged
    return context
  }

  // how many rows of blocks fit when the card is `cols` blocks wide
  function rowsFor(cols: number) {
    return Math.max(2, Math.round((cols * frame.value!.clientHeight) / frame.value!.clientWidth))
  }

  // ---- step 1: the blocks pop up one by one -----------------------------------------------

  function revealBlocks(done: () => void) {
    const width = frame.value!.clientWidth
    const height = frame.value!.clientHeight
    const cols = FIRST_BLOCKS_WIDE
    const rows = rowsFor(cols)
    const tinyCopy = makeTinyCopy(cols, rows)
    const context = prepareCanvas()
    const blockWidth = width / cols
    const blockHeight = height / rows

    // all block numbers in a random order: the order in which they pop up
    const order = Array.from({ length: cols * rows }, (_, i) => i).sort(() => Math.random() - 0.5)

    const startTime = performance.now()
    let blocksShown = 0 // how many blocks have popped up (orange or picture)
    let blocksSettled = 0 // how many of those have already turned from orange into the picture
    const shownAt: number[] = [] // when each block popped up

    // draws one block, either orange or as the real pixel of the screenshot
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

    // runs on every screen refresh until all blocks are done
    function step(now: number) {
      // how many blocks should be visible by now?
      const shouldBeShown = Math.min(order.length, Math.floor(((now - startTime) / REVEAL_DURATION) * order.length))
      for (; blocksShown < shouldBeShown; blocksShown++) {
        shownAt[blocksShown] = now
        drawBlock(blocksShown, false) // new block: orange
      }
      // blocks that have been orange long enough turn into the picture
      while (blocksSettled < blocksShown && now - shownAt[blocksSettled] > ORANGE_FLASH) {
        drawBlock(blocksSettled, true)
        blocksSettled++
      }

      if (blocksSettled < order.length) animationFrame = requestAnimationFrame(step)
      else done()
    }
    animationFrame = requestAnimationFrame(step)
  }

  // ---- step 2: smaller blocks, then the sharp picture ---------------------------------------

  // draws the whole screenshot as blocks, `cols` blocks wide
  function drawPixels(cols: number) {
    const context = prepareCanvas()
    context.drawImage(makeTinyCopy(cols, rowsFor(cols)), 0, 0, frame.value!.clientWidth, frame.value!.clientHeight)
  }

  function sharpen() {
    SHARPEN_STEPS.forEach((cols, i) => {
      timeouts.push(window.setTimeout(() => drawPixels(cols), i * SHARPEN_DELAY))
    })
    // after the last step the real <img> fades in (the card's CSS does the fading)
    timeouts.push(window.setTimeout(() => (isSharp.value = true), SHARPEN_STEPS.length * SHARPEN_DELAY))
  }

  // ---- start and reset -----------------------------------------------------------------------

  // plays the animation, once the picture is loaded AND the card is on screen
  function start() {
    if (hasStarted || !imageIsLoaded || !cardIsOnScreen) return
    hasStarted = true

    if (prefersReducedMotion()) {
      isSharp.value = true // no animation: show the real screenshot straight away
      return
    }
    revealBlocks(sharpen)
  }

  // back to the beginning, so the animation can play again when the card comes back
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
    if (!imageUrl) return // a project without a picture: nothing to animate

    image = new Image()
    image.onload = () => {
      imageIsLoaded = true
      start()
    }
    image.src = imageUrl

    // Watch the card. It counts as "on screen" once its top is in the lower 80% of the screen,
    // so the visitor sees the animation happen. It resets once the card has left the screen completely.
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
