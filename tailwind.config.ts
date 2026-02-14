import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        bg: {
          primary: '#0a0a0f',
          secondary: '#12121a',
          tertiary: '#1a1a24',
          hover: '#22222e',
        },
        accent: {
          primary: '#00d4aa',
          secondary: '#7c3aed',
          warning: '#f59e0b',
          error: '#ef4444',
          success: '#10b981',
        },
        text: {
          primary: '#f4f4f5',
          secondary: '#a1a1aa',
          muted: '#71717a',
        },
        border: {
          DEFAULT: '#27272a',
          hover: '#3f3f46',
        },
      },
    },
  },
  plugins: [],
}
export default config
