// SMALL SHARED HELPERS
// Everything exported from the composables/ folder can be used in any component without an import (Nuxt does that for us).

// ---- Is the About drawer open? ----------------------------------------------------------
// useState keeps a value that every component can read and change.
// The menu and the hero button set it to true, the drawer itself reads it.
export const useAbout = () => useState<boolean>('about-open', () => false)

// Turns "/images/rooster.jpg" into the right address for an image in the public/ folder.
// (On a normal site that is just "/images/rooster.jpg". When the site is hosted in a sub-folder,
// like GitHub Pages, the name of that folder is put in front.)
// Use it like this:  const asset = useAsset()  and then  :src="asset('/images/rooster.jpg')"
export const useAsset = () => {
  const base = useRuntimeConfig().app.baseURL.replace(/\/$/, '')
  return (path: string) => base + path
}

// Keeps a number between a minimum and a maximum:  clamp(1.4) gives 1,  clamp(-3) gives 0.
export const clamp = (n: number, min = 0, max = 1) => Math.min(max, Math.max(min, n))

// True when the visitor has asked their device for less movement. We then skip the animations.
export const prefersReducedMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches
