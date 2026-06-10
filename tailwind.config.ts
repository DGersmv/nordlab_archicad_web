import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        paper: 'var(--paper)',
        ink: 'var(--ink)',
        graphite: 'var(--graphite)',
        hairline: 'var(--hairline)',
        pen: 'var(--pen)',
        marker: 'var(--marker)',
      },
      fontFamily: {
        sans: ['var(--font-schibsted)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-ibm-plex-mono)', 'ui-monospace', 'monospace'],
      },
      maxWidth: {
        site: '1200px',
      },
      borderRadius: {
        DEFAULT: '2px',
      },
      boxShadow: {
        subtle: '0 1px 2px rgba(27, 29, 31, 0.06)',
      },
    },
  },
  plugins: [],
}

export default config
