/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'maxcrowds': {
          green: '#07B0AA',
          'green-hover': '#099187',
          'dark-gray': '#0C0C0C',
          black: '#000000',
          'light-gray': '#EAEAEA',
          white: '#FFFFFF',
        }
      }
    },
  },
  plugins: [],
}
