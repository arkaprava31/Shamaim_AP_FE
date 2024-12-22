/** @type {import('tailwindcss').Config} */
const withMT = require("@material-tailwind/react/utils/withMT");
module.exports = withMT({
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        main: '#FFD700',
        secondary: '#FFFFF0'
      },
      height: {
        'screen-minus-60': 'calc(100vh - 60px)',
      },
    },
  },
  plugins: [],
})

