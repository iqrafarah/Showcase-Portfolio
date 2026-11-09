import type { Config } from 'tailwindcss'

// THE COLOURS AND FONTS OF THE SITE
// Use them as Tailwind classes:  bg-ink  text-beige  text-orange  bg-beige-2  font-mono  ...
export default <Partial<Config>>{
  theme: {
    extend: {
      colors: {
        beige: { DEFAULT: '#efeee9', 2: '#e4e2db', 3: '#d3d2cc' },
        ink: { DEFAULT: '#121211', 2: '#1b1b1a', 3: '#262625' },
        mute: '#6b6a66',
        orange: '#ed4407'
      },
      fontFamily: {
        sans: ['Geist', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['"Geist Mono"', 'ui-monospace', 'SFMono-Regular', 'monospace']
      }
    }
  }
}
