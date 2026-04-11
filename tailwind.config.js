/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          950: '#0A1628',
          900: '#152B47',
          800: '#1A3457',
          700: '#1F3D67',
          600: '#254A7A',
          500: '#2D5990',
          400: '#3D72AE',
          300: '#5B90C8',
          200: '#92BAE0',
          100: '#C5DCF0',
          50:  '#EBF3FA',
        },
        gold: {
          700: '#7A5C16',
          600: '#9E7828',
          500: '#C9A84C',
          400: '#D9BC72',
          300: '#E8D09A',
          200: '#F2E4BF',
          100: '#FAF4E5',
          50:  '#FDFAF3',
        },
        cream: '#F8F4EC',
      },
      fontFamily: {
        display: ['Comfortaa', 'sans-serif'],
        body:    ['Open Sans', 'sans-serif'],
        sans:    ['Open Sans', 'sans-serif'],
      },
      borderRadius: {
        '4xl': '2rem',
      },
      boxShadow: {
        'gold': '0 4px 28px rgba(201,168,76,0.30)',
        'gold-lg': '0 8px 40px rgba(201,168,76,0.40)',
      },
      backgroundImage: {
        'gold-gradient': 'linear-gradient(135deg, #C9A84C, #9E7828)',
        'navy-gradient': 'linear-gradient(135deg, #152B47, #1F3D67)',
        'hero-radial':   'radial-gradient(ellipse 70% 90% at 20% 60%, rgba(37,74,122,0.55) 0%, transparent 65%)',
      },
      animation: {
        'pulse-slow': 'pulse 3s ease-in-out infinite',
        'fade-in':    'fadeIn 0.3s ease forwards',
        'slide-up':   'slideUp 0.35s ease forwards',
      },
      keyframes: {
        fadeIn:  { from: { opacity: 0 }, to: { opacity: 1 } },
        slideUp: { from: { opacity: 0, transform: 'translateY(12px)' }, to: { opacity: 1, transform: 'translateY(0)' } },
      },
    },
  },
  plugins: [],
}
