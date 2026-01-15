export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        comfortaa: ["Comfortaa", "sans-serif"],
        raleway: ["Raleway", "sans-serif"],
        oswald: ["Oswald", "sans-serif"],
        poppins: ["Poppins", "sans-serif"],
        grotesk: ["Grotesk", "sans-serif"],
        inter: ["Inter", "sans-serif"],
        garamond: ["Garamond", "serif"],
        geist: ["Geist", "sans-serif"]
      },
      keyframes: {
        heroFade: {
          "0%": { opacity: "0", transform: "translateY(24px)" },
          "100%": { opacity: "1", transform: "translateY(0)" }
        },
        fadeUp: {
      "0%": { opacity: "0", transform: "translateY(16px)" },
      "100%": { opacity: "1", transform: "translateY(0)" },
    },
      },
      animation: {
        "hero-fade": "heroFade 0.8s ease-out forwards",
        "scroll-left": "scrollLeft 25s linear infinite",
        "scroll-right": "scrollRight 25s linear infinite",
        "fadeUp": "fadeUp 0.6s ease-out forwards",
      }
    }
  },
  plugins: []
};
