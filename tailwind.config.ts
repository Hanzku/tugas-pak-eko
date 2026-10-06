import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eef2f7',
          100: '#d4dde8',
          200: '#a9bbd1',
          300: '#7e99ba',
          400: '#5377a3',
          500: '#1e3a5f',
          600: '#1a3253',
          700: '#152a46',
          800: '#11213a',
          900: '#0c192d',
        },
        akademik: {
          green: '#2d6a4f',
          red: '#c1121f',
          yellow: '#e9c46a',
          blue: '#264653',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
export default config
