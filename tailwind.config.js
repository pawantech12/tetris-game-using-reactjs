/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        "custom-brown": "#41322D",
        "custom-dark-brown": "#322421",
        "custom-light-brown": "#543D37",
        "custom-blue": "#00BAE8",
        "custom-yellow": "#E4AA01",
        "custom-green": "#02D085",
      },
    },
  },
  plugins: [],
};
