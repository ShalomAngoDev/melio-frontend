/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        'melio': {
          'purple': '#9b5de0',
          'purple-light': '#997dbb',
          'pink-light': '#fae2e1',
          'pink': '#e89fac',
        },
      },
    },
  },
  plugins: [],
};
