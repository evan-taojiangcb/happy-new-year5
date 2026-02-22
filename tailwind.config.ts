import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{js,ts,jsx,tsx}", "./components/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        cny: {
          bg: "#201212",
          red: "#D23232",
          redDark: "#B01F1F",
          gold: "#FFD700",
          paper: "#FFF8E7"
        }
      },
      fontFamily: {
        display: ["'Ma Shan Zheng'", "'STKaiti'", "serif"],
        body: ["'PingFang SC'", "'Microsoft YaHei'", "system-ui", "sans-serif"]
      },
      keyframes: {
        floatUp: {
          "0%": { transform: "translateY(0) scale(1)", opacity: "1" },
          "100%": { transform: "translateY(-90vh) scale(0.65)", opacity: "0" }
        },
        pulseGlow: {
          "0%,100%": { boxShadow: "0 0 0 rgba(255, 215, 0, 0.2)" },
          "50%": { boxShadow: "0 0 28px rgba(255, 215, 0, 0.5)" }
        }
      },
      animation: {
        floatUp: "floatUp 2.8s ease-in forwards",
        pulseGlow: "pulseGlow 1.8s ease-in-out infinite"
      }
    }
  },
  plugins: []
};

export default config;
