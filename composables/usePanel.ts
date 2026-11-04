// SHARED BEHAVIOUR OF PANELS THAT COVER THE PAGE (the About drawer)

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

// Run `onEscape` when the visitor presses the Escape key. The listener is removed again when the component goes away.
// The handler gets the key event. A handler that used the key can call event.preventDefault(), so others know to ignore it.
export function closeOnEscape(onEscape: (event: KeyboardEvent) => void) {
  function onKeydown(event: KeyboardEvent) {
    if (event.key === 'Escape') onEscape(event)
  }
  addEventListener('keydown', onKeydown)
  onBeforeUnmount(() => removeEventListener('keydown', onKeydown))
}
