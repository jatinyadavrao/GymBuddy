/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        gym: {
          bg: "#090b12",
          card: "#111528",
          accent: "#22d3ee",
          accent2: "#f97316",
          text: "#f8fafc"
        }
      },
      boxShadow: {
        neon: "0 0 40px rgba(34, 211, 238, 0.22)"
      }
    }
  },
  plugins: []
};
