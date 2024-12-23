import withMT from "@material-tailwind/react/utils/withMT";

export default withMT({
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
});
