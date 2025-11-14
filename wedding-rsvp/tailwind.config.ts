import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        // Custom wedding theme colors
        sage: {
          50: "#f6f8f6",
          100: "#e3e9e3",
          200: "#c7d3c7",
          300: "#a3b5a3",
          400: "#7d947d",
          500: "#5f7a5f",
          600: "#4a604a",
          700: "#3d4e3d",
          800: "#334033",
          900: "#2b352b",
        },
        blush: {
          50: "#fdf6f6",
          100: "#fbe8e8",
          200: "#f8d5d5",
          300: "#f2b5b5",
          400: "#e98a8a",
          500: "#dc6060",
          600: "#c84444",
          700: "#a73636",
          800: "#8b3131",
          900: "#752e2e",
        },
        cream: {
          50: "#fdfdfb",
          100: "#faf9f5",
          200: "#f5f2e9",
          300: "#ebe6d6",
          400: "#ddd4ba",
          500: "#cbbf9d",
          600: "#b5a482",
          700: "#978769",
          800: "#7d7159",
          900: "#695e4b",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'garden-gradient': 'linear-gradient(135deg, #f6f8f6 0%, #fdfdfb 50%, #fdf6f6 100%)',
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
export default config;
