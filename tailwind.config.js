/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html",
  ],
  theme: {
    extend: {
      fontFamily: {
        inter: ['Inter', 'sans-serif'],
      },
      colors: {
        'emerald': {
          '50': '#ecfdf5',
          '100': '#d1fae5',
          // ... all other shades 200-900 (you can keep these or remove if not needed)
          '500': '#10b981',
          '600': '#059669',
          '700': '#047857',
          '800': '#065f46',
          '900': '#064e3b',
        },
        'violet': {
            '50': '#f5f3ff',
            '100': '#ede9fe',
            // ... all other shades
            '500': '#8b5cf6',
            '600': '#7c3aed',
            '700': '#6d28d9',
            '800': '#5b21b6',
            '900': '#4c1d95',
        },
        'amber': {
          '50': '#fffbeb',
          '100': '#fef3c7',
          // ... all other shades
          '500': '#f59e0b',
        },
      }
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}