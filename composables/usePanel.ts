// SHARED BEHAVIOUR OF THE FULL-SCREEN PANELS (the About drawer and the case study pages)

// While a panel is open the page behind it must not scroll.
// Call this every time a panel opens or closes.
export function lockPageScroll(panelIsOpen: boolean) {
  // "lock" and "drawer-open" are small rules in assets/css/main.css that stop the page from scrolling
  document.body.classList.toggle('lock', panelIsOpen)
  document.documentElement.classList.toggle('drawer-open', panelIsOpen)

  // the smooth scroller (see useMotion.ts) has to be paused as well
  if (panelIsOpen) scroller.lenis?.stop()
  else scroller.lenis?.start()
}

// Run `close` when the visitor presses the Escape key while the panel is open.
export function closeOnEscape(isOpen: () => boolean, close: () => void) {
  addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && isOpen()) close()
  })
}
