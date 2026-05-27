/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        display: ["Space Grotesk", "Inter", "sans-serif"]
      },
      colors: {
        void: "#050816",
        cosmos: "#0a1024",
        plasma: "#8b5cf6",
        aurora: "#22d3ee",
        flare: "#f472b6",
        starlight: "#f8fafc"
      },
      boxShadow: {
        glow: "0 0 40px rgba(34, 211, 238, 0.16)",
        violet: "0 0 35px rgba(139, 92, 246, 0.18)"
      }
    }
  },
  plugins: []
};
