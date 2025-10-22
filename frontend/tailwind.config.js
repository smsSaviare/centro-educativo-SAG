/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        saviareGreen: '#00a86b', // Verde principal Saviare
        saviareWhite: '#ffffff',
      },
    },
  },
  plugins: [],
};
