/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [require('daisyui'),],
  daisyui: {
    themes: [
      "light",
      "dark",
      "cupcake",
      "corporate",
      "synthwave",
      "retro",
      "valentine",
      "halloween",
      "garden",
      "forest",
      "lofi",
      "pastel",
      "wireframe",
      "black",
      "dracula",
      "cmyk",
      "autumn",
      "business",
      "lemonade",
      "night",
      "winter",
      "dim",
      "nord",
      "sunset",
    ],
  },
}