/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          navy:   '#1B3A6B',
          teal:   '#0D7C8F',
          lteal:  '#E6F4F7',
          green:  '#1A7A4A',
          lgreen: '#E8F5EE',
          gold:   '#D4A017',
          lgold:  '#FDF6E3',
          red:    '#C0392B',
          lred:   '#FDECEA',
          gray:   '#F4F6F9',
          dark:   '#2C3E50',
          mid:    '#7F8C8D',
        }
      },
      fontFamily: {
        sans: ['var(--font-geist-sans)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-geist-mono)', 'monospace'],
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
      },
      keyframes: {
        fadeIn: { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' }
        }
      }
    }
  },
  plugins: []
}
