import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Lenis from 'lenis'

// SMOOTH SCROLLING AND SCROLL ANIMATIONS
//
// Two separate things happen here:
//
//   1. initSmoothScroll()      Smooth scrolling (the library "Lenis"): the page glides instead of jumping.
//                              Called once, from app.vue, when the site opens.
//
//   2. initRevealAnimations()  Elements that slide up when they scroll into view (the library "GSAP"):
//                                data-reveal   put this on an element and it slides up when it scrolls into view
//                                data-stagger  put this on a box and its children slide up one after another
//                              Example:  <p data-reveal>I slide up</p>
//                              Called by every page that has such elements (pages/index.vue), every time the page opens.
//                              It returns a function that switches the animations off again (when the page is left).
//
// Elements with data-reveal are hidden by a rule in assets/css/main.css until GSAP shows them.
// The "js" class on <html> is only added when the visitor allows motion.

// the smooth scroller, kept here so other components can pause it
export const scroller: { lenis: Lenis | null } = { lenis: null }

// ---- 1. smooth scrolling ----------------------------------------------------------------------

export function initSmoothScroll() {
  if (scroller.lenis) return // already running
  gsap.registerPlugin(ScrollTrigger)

  const lenis = new Lenis()
  scroller.lenis = lenis
  lenis.on('scroll', ScrollTrigger.update)
  gsap.ticker.add((time) => lenis.raf(time * 1000))
  gsap.ticker.lagSmoothing(0)

  // links like #work scroll smoothly too
  document.addEventListener('click', (event) => {
    const link = (event.target as HTMLElement).closest('a[href^="#"]')
    const href = link?.getAttribute('href') ?? ''
    if (!/^#[\w-]+$/.test(href)) return // only simple links like #work
    const target = document.querySelector(href)
    if (!target) return
    event.preventDefault()
    lenis.scrollTo(target as HTMLElement)
  })
}

// ---- 2. slide-up animations -------------------------------------------------------------------

export function initRevealAnimations() {
  if (!document.documentElement.classList.contains('js')) return () => {}
  gsap.registerPlugin(ScrollTrigger)

  const triggers: ScrollTrigger[] = [] // everything we create, so we can remove it again

  // slides the items up, one after another
  function slideUp(items: HTMLElement[]) {
    gsap.fromTo(
      items,
      { opacity: 0, y: 80 },
      { opacity: 1, y: 0, duration: 1.2, stagger: 0.12, ease: 'power3.out', clearProps: 'all' }
    )
    // Mark them as shown right away. They stay invisible through the inline opacity GSAP sets.
    // (If this happened only at the end, the CSS "hidden" rule would flash for a moment when GSAP clears its styles.)
    items.forEach((item) => item.classList.add('is-in'))
  }

  // hides the items again when they leave the screen, so they can slide up the next time
  function hide(items: HTMLElement[]) {
    gsap.killTweensOf(items)
    items.forEach((item) => item.classList.remove('is-in'))
  }

  // every element with data-reveal
  triggers.push(
    ...ScrollTrigger.batch('[data-reveal]', {
      start: 'top 92%',
      end: 'bottom 8%',
      onEnter: (items) => slideUp(items as HTMLElement[]),
      onEnterBack: (items) => slideUp(items as HTMLElement[]),
      onLeave: (items) => hide(items as HTMLElement[]),
      onLeaveBack: (items) => hide(items as HTMLElement[])
    })
  )

  // every box with data-stagger: its children slide up one by one
  gsap.utils.toArray<HTMLElement>('[data-stagger]').forEach((box) => {
    const children = () => Array.from(box.children) as HTMLElement[]
    triggers.push(
      ScrollTrigger.create({
        trigger: box,
        start: 'top 88%',
        end: 'bottom 8%',
        onEnter: () => slideUp(children()),
        onEnterBack: () => slideUp(children()),
        onLeave: () => hide(children()),
        onLeaveBack: () => hide(children())
      })
    )
  })

  // fonts and images change the page height, so measure again once they are in
  document.fonts?.ready.then(() => ScrollTrigger.refresh())
  addEventListener('load', () => ScrollTrigger.refresh())

  // the "switch off" function
  return () => triggers.forEach((trigger) => trigger.kill())
}
