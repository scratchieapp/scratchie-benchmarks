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
        scratchie: {
          orange: '#FF6B35',
          blue: '#4A90E2',
          green: '#52C41A',
          gray: '#8C8C8C',
          dark: '#262626',
        },
        sync: {
          primary: '#003D7A',
          secondary: '#0066CC',
          accent: '#00A6FB',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

export default config