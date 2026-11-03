import type { Config } from 'tailwindcss'

export default <Partial<Config>>{
  theme: {
    extend: {
      colors: {
        // warm beige paper + near-black ink, with one orange signal
        beige: { DEFAULT: '#efeee9', 2: '#e4e2db', 3: '#d3d2cc' },
        ink: { DEFAULT: '#121211', 2: '#1b1b1a', 3: '#262625' },
        mute: '#6b6a66',
        orange: '#ed4407'
      },
      fontFamily: {
        sans: ['Geist', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['"Geist Mono"', 'ui-monospace', 'SFMono-Regular', 'monospace']
      },
      keyframes: {
        marquee: { to: { transform: 'translateX(-50%)' } },
        spin360: { to: { transform: 'rotate(360deg)' } }
      },
      animation: {
        marquee: 'marquee 32s linear infinite',
        'marquee-fast': 'marquee 12s linear infinite',
        spin360: 'spin360 14s linear infinite'
      }
    }
  }
}
