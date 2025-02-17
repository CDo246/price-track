/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {},
  },
  plugins: [require("daisyui")],
  daisyui: {
    themes: [
      {
        mytheme: {
          "primary": "#afbdce",
          "secondary": "#663f51",
          "accent": "#a5776c",
          "neutral": "#0a0d11",
          "base-100": "#0a0d11",
          "base-200": "#141820",
          "base-300": "#1f242d",
          "base-content": "#e3e8ee",
          "info": "#afbdce",
          "success": "#a5776c",
          "warning": "#663f51",
          "error": "#663f51",
        },
      },
    ],
  },
};
