// Small shared helpers. Nuxt auto-imports everything exported from this folder.

// Is the About drawer open?
export const useAbout = () => useState<boolean>('about-open', () => false)

// Public files need the base URL in front when the site is hosted in a sub-folder.
export const useAsset = () => {
  const base = useRuntimeConfig().app.baseURL.replace(/\/$/, '')
  // at the site root use a relative path (images/x.png), so it also works when the page is hosted in a folder
  return (path: string) => (base ? base + path : path.replace(/^\//, ''))
}

export const clamp = (n: number, min = 0, max = 1) => Math.min(max, Math.max(min, n))

export const prefersReducedMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches
