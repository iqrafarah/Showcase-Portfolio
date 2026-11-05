// THE INFO PANEL THAT FOLLOWS THE MOUSE ON A WORK CARD
//
// While the mouse is over the card, a small panel (role, year, tech) glides after the pointer.
// It moves a little slower than the mouse ("easing"), and it never leaves the card.
//
// Use it in a component like this:
//   const { isHovering, onEnter, onMove, onLeave } = useHoverPanel(frame, panel)
// and put  @pointerenter="onEnter" @pointermove="onMove" @pointerleave="onLeave"  on the card.

const OFFSET = 20 // how far the panel sits from the pointer (pixels)
const EDGE_GAP = 10 // the panel keeps this much distance from the card's edge
const EASING = 0.12 // 0.12 = every frame the panel covers 12% of the way to the pointer

export function useHoverPanel(frame: Ref<HTMLElement | undefined>, panel: Ref<HTMLElement | undefined>) {
  const isHovering = ref(false)

  // where the pointer is, and where the panel is (both relative to the card)
  let pointerX = 0
  let pointerY = 0
  let panelX = 0
  let panelY = 0
  let animationFrame = 0

  // every frame: move the panel a bit closer to the pointer
  function movePanel() {
    if (!panel.value) return
    panelX += (pointerX - panelX) * EASING
    panelY += (pointerY - panelY) * EASING

    // keep the panel inside the card
    const maxX = frame.value!.clientWidth - panel.value!.offsetWidth - EDGE_GAP
    const maxY = frame.value!.clientHeight - panel.value!.offsetHeight - EDGE_GAP
    const x = clamp(panelX + OFFSET, EDGE_GAP, Math.max(EDGE_GAP, maxX))
    const y = clamp(panelY + OFFSET, EDGE_GAP, Math.max(EDGE_GAP, maxY))
    panel.value!.style.transform = `translate(${x}px, ${y}px)`

    if (isHovering.value) animationFrame = requestAnimationFrame(movePanel)
  }

  // remember where the pointer is
  function onMove(event: PointerEvent) {
    const box = frame.value!.getBoundingClientRect()
    pointerX = event.clientX - box.left
    pointerY = event.clientY - box.top
  }

  function onEnter(event: PointerEvent) {
    if (event.pointerType === 'touch') return // no hover panel on touch screens
    onMove(event)
    panelX = pointerX // start right at the pointer
    panelY = pointerY
    isHovering.value = true
    if (panel.value) movePanel() // (a project with nothing to show has no panel)
  }

  function onLeave() {
    isHovering.value = false
  }

  onBeforeUnmount(() => cancelAnimationFrame(animationFrame))

  return { isHovering, onEnter, onMove, onLeave }
}
