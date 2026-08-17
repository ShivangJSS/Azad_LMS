/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#72286F',
          dark: '#5a1d56',
          light: '#8e3a89'
        },
        secondary: '#a13b9f',
        danger: '#dc3545',
        success: '#28a745'
      }
    },
  },
  plugins: [],
}
