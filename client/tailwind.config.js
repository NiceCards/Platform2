/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', '"Inter"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['"Plus Jakarta Sans"', '"Inter"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        serif: ['"Cormorant Garamond"', 'Georgia', '"Times New Roman"', 'serif'],
      },
      colors: {
        brand: {
          50: '#fdf8ec',
          100: '#f8edd0',
          200: '#efd9a0',
          300: '#e4c06a',
          400: '#d6a63c',
          500: '#c08a1c',
          600: '#a06d11',
          700: '#7d520f',
          800: '#68430f',
          900: '#573811',
          950: '#332006',
        },
        surface: {
          dark: '#1a1712',
          card: '#26211a',
        },
      },
      boxShadow: {
        card: '0 4px 24px -6px rgba(0, 0, 0, 0.12)',
        'card-lg': '0 12px 48px -12px rgba(160, 109, 17, 0.25)',
        glow: '0 0 0 1px rgba(192, 138, 28, 0.25), 0 8px 32px -8px rgba(192, 138, 28, 0.45)',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease forwards',
        'slide-up': 'slideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'float': 'float 6s ease-in-out infinite',
        'shimmer': 'shimmer 1.6s linear infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(24px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-14px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-400px 0' },
          '100%': { backgroundPosition: '400px 0' },
        },
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
};
