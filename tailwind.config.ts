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
        brand: {
          DEFAULT: '#1D9E75',
          dark: '#0F6E56',
          light: '#E1F5EE',
          'light-border': '#5DCAA5',
        },
        error: {
          DEFAULT: '#A32D2D',
          light: '#FCEBEB',
          border: '#F0997B',
          bg: '#FAECE7',
          text: '#4A1B0C',
          dark: '#712B13',
          'dark2': '#993C1D',
        },
        warn: {
          DEFAULT: '#854F0B',
          light: '#FAEEDA',
          border: '#F5C4B3',
        },
        purple: {
          light: '#EEEDFE',
          DEFAULT: '#534AB7',
          dark: '#3C3489',
        },
        surface: '#f5f5f0',
      },
      fontFamily: {
        sans: [
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'sans-serif',
        ],
      },
      maxWidth: { app: '430px' },
    },
  },
  plugins: [],
}

export default config
