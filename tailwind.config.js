/** Tailwind structure is kept separate so the v10 visual theme remains unchanged. */
module.exports = {
  content: [
    "./index.html",
    "./Front_end/**/*.html",
    "./Front_end/assets/js/**/*.js"
  ],
  theme: {
    extend: {
      screens: {
        mobile: "0px",
        tablet: "768px",
        desktop: "1024px"
      },
      colors: {
        football: "#071a2b",
        accent: "#18d900"
      }
    }
  },
  plugins: []
};
