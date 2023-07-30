const colors = require('tailwindcss/colors')

/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{html,js,svelte}"],
  theme: {
    extend: {
      colors: {
        'light-bg': colors.slate[500],
        bg: colors.slate[700],
        'dark-bg': colors.slate[800],
        text: colors.slate[200],
        'light-text': colors.slate[100],
        'dark-text': colors.slate[400],
        'dark-border': colors.slate[600],
        border: colors.slate[500],
        'light-border': colors.slate[400],
        ui: colors.slate[500],
        hov: colors.slate[400],
        invalid: colors.red[500]
      },
    },
  },
  plugins: [],
};
