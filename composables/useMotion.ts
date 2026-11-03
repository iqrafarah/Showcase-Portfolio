import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Lenis from 'lenis'

// the smooth scroller, kept here so other components can pause it
export const scroller: { lenis: Lenis | null } = { lenis: null }

// Scroll animations.
//   data-reveal   slides up when it scrolls into view (again, every time it comes back)
//   data-stagger  its children slide up one after another
// These elements are hidden in CSS until GSAP shows them (see main.css).
// The "js" class on <html> is only added when the visitor allows motion.
export function initMotion() {
  if (!document.documentElement.classList.contains('js')) return
  gsap.registerPlugin(ScrollTrigger)

  function slideUp(items: HTMLElement[], delay = 0) {
    gsap.fromTo(
      items,
      { opacity: 0, y: 80 },
      {
        opacity: 1,
        y: 0,
        duration: 1.2,
        delay,
        stagger: 0.12,
        ease: 'power3.out',
        clearProps: 'all'
      }
    )
    // Mark them as shown right away. They stay invisible through the inline opacity GSAP sets.
    // (If this happened only at the end, the CSS "hidden" rule would flash for a moment when GSAP clears its styles.)
    items.forEach((item) => item.classList.add('is-in'))
  }

  // smooth scrolling that stays in sync with ScrollTrigger
  const lenis = new Lenis()
  scroller.lenis = lenis
  lenis.on('scroll', ScrollTrigger.update)
  gsap.ticker.add((time) => lenis.raf(time * 1000))
  gsap.ticker.lagSmoothing(0)

  // links like #work scroll smoothly too
  document.addEventListener('click', (event) => {
    const link = (event.target as HTMLElement).closest('a[href^="#"]')
    const target = link && document.querySelector(link.getAttribute('href')!)
    if (!target) return
    event.preventDefault()
    lenis.scrollTo(target as HTMLElement)
  })

  // the hero does not animate: it is simply there when the start screen opens up

  // hide items again when they leave the screen, so they can slide up the next time
  function hide(items: HTMLElement[]) {
    gsap.killTweensOf(items)
    items.forEach((item) => item.classList.remove('is-in'))
  }

  ScrollTrigger.batch('[data-reveal]', {
    start: 'top 92%',
    end: 'bottom 8%',
    onEnter: (items) => slideUp(items as HTMLElement[]),
    onEnterBack: (items) => slideUp(items as HTMLElement[]),
    onLeave: (items) => hide(items as HTMLElement[]),
    onLeaveBack: (items) => hide(items as HTMLElement[])
  })

  gsap.utils.toArray<HTMLElement>('[data-stagger]').forEach((box) => {
    const children = () => Array.from(box.children) as HTMLElement[]
    ScrollTrigger.create({
      trigger: box,
      start: 'top 88%',
      end: 'bottom 8%',
      onEnter: () => slideUp(children()),
      onEnterBack: () => slideUp(children()),
      onLeave: () => hide(children()),
      onLeaveBack: () => hide(children())
    })
  })

  // fonts and images change the page height, so measure again once they are in
  document.fonts?.ready.then(() => ScrollTrigger.refresh())
  addEventListener('load', () => ScrollTrigger.refresh())
}
