/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class', // enable class-based dark mode
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // optional custom sky-blue palette accents
        'sky-900': '#0f172a', // deep background
        'sky-800': '#0b1220', // card dark
        'sky-accent': '#60a5fa', // light sky-blue accent
      }
    },
  },
  plugins: [],
}
