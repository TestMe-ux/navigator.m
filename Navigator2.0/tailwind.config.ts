import type { Config } from "tailwindcss"

const config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
    "*.{js,ts,jsx,tsx,mdx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1600px",
      },
    },
    screens: {
      'xs': '475px',
      'sm': '640px',
      'md': '768px',
      'lg': '1024px',
      'xl': '1280px',
      '2xl': '1536px',
      '3xl': '1920px',
      '4xl': '2560px',
    },
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
        
        // Enhanced Blue to Purple Gradient System
        "brand": {
          50: "#f0f9ff",
          100: "#e0f2fe", 
          200: "#bae6fd",
          300: "#7dd3fc",
          400: "#38bdf8",
          500: "#008FFF", // Primary brand blue
          600: "#0284c7",
          700: "#0369a1",
          800: "#075985",
          900: "#0c4a6e",
          950: "#082f49",
        },
        "purple": {
          50: "#faf5ff",
          100: "#f3e8ff",
          200: "#e9d5ff", 
          300: "#d8b4fe",
          400: "#c084fc",
          500: "#a855f7",
          600: "#9333ea",
          700: "#1800FF", // Deep brand purple
          800: "#6b21a8",
          900: "#581c87",
          950: "#3b0764",
        },
        
        // Gradient Stops for Brand Identity
        "gradient": {
          "start": "#008FFF",
          "middle": "#4F46E5", 
          "end": "#1800FF",
        },
        
        // Semantic Colors with Brand Integration
        "success": {
          DEFAULT: "#10b981",
          foreground: "#ffffff",
          light: "#d1fae5",
          dark: "#065f46",
        },
        "warning": {
          DEFAULT: "#f59e0b", 
          foreground: "#ffffff",
          light: "#fef3c7",
          dark: "#92400e",
        },
        "error": {
          DEFAULT: "#ef4444",
          foreground: "#ffffff", 
          light: "#fee2e2",
          dark: "#991b1b",
        },
        "info": {
          DEFAULT: "#008FFF",
          foreground: "#ffffff",
          light: "#dbeafe", 
          dark: "#1e3a8a",
        },

        // Legacy navigator specific colors (updated with new palette)
        "corporate-header": "#0c1629",
        "demand-very-low": "#e0f2fe",
        "demand-low": "#bae6fd", 
        "demand-medium": "#7dd3fc",
        "demand-high": "#38bdf8",
        "demand-very-high": "#008FFF",
        "text-demand-very-low": "#0c4a6e",
        "text-demand-low": "#075985",
        "text-demand-medium": "#0369a1", 
        "text-demand-high": "#0284c7",
        "text-demand-very-high": "#ffffff",
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '96': '24rem',
        '104': '26rem',
        '112': '28rem',
        '128': '32rem',
      },
      maxWidth: {
        '8xl': '88rem',
        '9xl': '96rem',
        '10xl': '104rem',
        'screen-3xl': '1920px',
        'screen-4xl': '2560px',
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "fade-in": {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "slide-in": {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(0)" },
        },
        "pulse-glow": {
          "0%, 100%": { boxShadow: "0 0 0 0 rgba(0, 143, 255, 0.4)" },
          "50%": { boxShadow: "0 0 0 8px rgba(0, 143, 255, 0)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out", 
        "fade-in": "fade-in 0.3s ease-out",
        "slide-in": "slide-in 0.3s ease-out",
        "pulse-glow": "pulse-glow 2s infinite",
      },
      backgroundImage: {
        "gradient-brand": "linear-gradient(135deg, #008FFF 0%, #4F46E5 50%, #1800FF 100%)",
        "gradient-brand-subtle": "linear-gradient(135deg, rgba(0, 143, 255, 0.1) 0%, rgba(79, 70, 229, 0.1) 50%, rgba(24, 0, 255, 0.1) 100%)",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      boxShadow: {
        "brand": "0 4px 14px 0 rgba(0, 143, 255, 0.15)",
        "brand-lg": "0 10px 40px 0 rgba(0, 143, 255, 0.2)",
        "purple": "0 4px 14px 0 rgba(24, 0, 255, 0.15)",
        "purple-lg": "0 10px 40px 0 rgba(24, 0, 255, 0.2)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config

export default config
