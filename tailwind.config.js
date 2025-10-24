/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'bkg': '#121212',
        'surface': '#1e1e1e',
        'primary': '#bb86fc',
        'secondary': '#03dac6',
        'on-surface': '#e0e0e0',
        'on-surface-muted': '#a0a0a0',
        'surface-border': '#333',
        'input-bg': '#333'
      }
    }
  },
  plugins: [],
}

