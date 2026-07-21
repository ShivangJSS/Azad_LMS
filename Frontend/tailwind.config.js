/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'primary-purple': '#732269',
        'primary-purple-dark': '#6a1c6d',
        'navbar-bg': '#7e2081',
        'body-bg': '#edf2f9',
        'gradient-light': '#e2cfe7',
        'login-title': '#3b2c4e',
        'header-title': '#344050',
        'input-border': '#ddd',
        'eye-icon': '#bfbfbf',
        'forgot-red': '#ff0000',
      }
    },
  },
  plugins: [],
}