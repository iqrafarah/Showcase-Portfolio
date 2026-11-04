// SMALL SHARED HELPERS
// Everything exported from the composables/ folder can be used in any component without an import (Nuxt does that for us).

// ---- Which panel is open? -------------------------------------------------------------
// useState keeps a value that every component can read and change.

// Is the About drawer open?  (true / false)
export const useAbout = () => useState<boolean>('about-open', () => false)

// Which case study is open?  The project's slug (for example "rooster"), or null when none is open.
// The slug is also shown in the address bar as  #case-rooster  (see CaseStudy.vue).
export const useCase = () => useState<string | null>('case-open', () => null)

// ---- Small tools -----------------------------------------------------------------------

// Turns "/images/rooster.jpg" into the right address for an image in the public/ folder.
// (It only matters when the site is hosted in a sub-folder, like GitHub Pages.)
// Use it like this:  const asset = useAsset()  and then  :src="asset('/images/rooster.jpg')"
export const useAsset = () => {
  const base = useRuntimeConfig().app.baseURL.replace(/\/$/, '')
  // on the main address use a relative path (images/x.png), so it also works when the page is hosted in a folder
  return (path: string) => (base ? base + path : path.replace(/^\//, ''))
}

// Keeps a number between a minimum and a maximum:  clamp(1.4) gives 1,  clamp(-3) gives 0.
export const clamp = (n: number, min = 0, max = 1) => Math.min(max, Math.max(min, n))

// True when the visitor has asked their device for less movement. We then skip the animations.
export const prefersReducedMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches
