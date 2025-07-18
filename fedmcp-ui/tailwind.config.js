import defaultTheme from "tailwindcss/defaultTheme";
import colors from "tailwindcss/colors";
/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{ts,tsx,js,jsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // Map brand blues onto Tailwind’s indigo scale
        indigo: {
          ...colors.indigo,
          600: "#366FA2", // primary brand blue
          700: "#0E2A4A", // dark accent blue
        },
        brand: {
          DEFAULT: "#366FA2",
          dark: "#0E2A4A",
        },
      },
      fontFamily: {
        sans: ["Geist", ...defaultTheme.fontFamily.sans],
        mono: ["Geist Mono", ...defaultTheme.fontFamily.mono],
      },
    },
  },
  plugins: [],
};
