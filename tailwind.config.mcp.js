/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
    './*.{ts,tsx}',
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
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
        "wave-pulse": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.5" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "wave-pulse": "wave-pulse 2s ease-in-out infinite",
      },
      scale: {
        '98': '0.98',
      },
      // Tailwind CSS Plus - Design Token Spacing
      spacing: {
        'token-xs': 'var(--token-xs)',
        'token-sm': 'var(--token-sm)',
        'token-md': 'var(--token-md)',
        'token-lg': 'var(--token-lg)',
        'token-xl': 'var(--token-xl)',
        'token-2xl': 'var(--token-2xl)',
      },
      // Tailwind CSS Plus - Custom Font Sizes for Korean
      fontSize: {
        'xs-ko': ['var(--font-size-xs-ko)', { lineHeight: 'var(--line-height-normal)' }],
        'sm-ko': ['var(--font-size-sm-ko)', { lineHeight: 'var(--line-height-normal)' }],
        'base-ko': ['var(--font-size-base-ko)', { lineHeight: 'var(--line-height-relaxed)' }],
        'lg-ko': ['var(--font-size-lg-ko)', { lineHeight: 'var(--line-height-normal)' }],
        'xl-ko': ['var(--font-size-xl-ko)', { lineHeight: 'var(--line-height-normal)' }],
        '2xl-ko': ['var(--font-size-2xl-ko)', { lineHeight: 'var(--line-height-snug)' }],
        '3xl-ko': ['var(--font-size-3xl-ko)', { lineHeight: 'var(--line-height-tight)' }],
        '4xl-ko': ['var(--font-size-4xl-ko)', { lineHeight: 'var(--line-height-tight)' }],
        '5xl-ko': ['var(--font-size-5xl-ko)', { lineHeight: 'var(--line-height-tight)' }],
        '6xl-ko': ['var(--font-size-6xl-ko)', { lineHeight: 'var(--line-height-tight)' }],
        '7xl-ko': ['var(--font-size-7xl-ko)', { lineHeight: 'var(--line-height-tight)' }],
      },
      // Tailwind CSS Plus - Letter Spacing for Korean
      letterSpacing: {
        'ko-tight': 'var(--tracking-ko-tight)',
        'ko-normal': 'var(--tracking-ko-normal)',
        'ko-wide': 'var(--tracking-ko-wide)',
      },
      // Tailwind CSS Plus - Enhanced Colors
      // Phase Colors
      'phase-beginning': {
        50: 'var(--phase-beginning-50)',
        100: 'var(--phase-beginning-100)',
        200: 'var(--phase-beginning-200)',
        300: 'var(--phase-beginning-300)',
        400: 'var(--phase-beginning-400)',
        500: 'var(--phase-beginning-500)',
        600: 'var(--phase-beginning-600)',
        700: 'var(--phase-beginning-700)',
        800: 'var(--phase-beginning-800)',
        900: 'var(--phase-beginning-900)',
        950: 'var(--phase-beginning-950)',
      },
      'phase-growth': {
        50: 'var(--phase-growth-50)',
        100: 'var(--phase-growth-100)',
        200: 'var(--phase-growth-200)',
        300: 'var(--phase-growth-300)',
        400: 'var(--phase-growth-400)',
        500: 'var(--phase-growth-500)',
        600: 'var(--phase-growth-600)',
        700: 'var(--phase-growth-700)',
        800: 'var(--phase-growth-800)',
        900: 'var(--phase-growth-900)',
        950: 'var(--phase-growth-950)',
      },
      'phase-challenge': {
        50: 'var(--phase-challenge-50)',
        100: 'var(--phase-challenge-100)',
        200: 'var(--phase-challenge-200)',
        300: 'var(--phase-challenge-300)',
        400: 'var(--phase-challenge-400)',
        500: 'var(--phase-challenge-500)',
        600: 'var(--phase-challenge-600)',
        700: 'var(--phase-challenge-700)',
        800: 'var(--phase-challenge-800)',
        900: 'var(--phase-challenge-900)',
        950: 'var(--phase-challenge-950)',
      },
      'phase-shine': {
        50: 'var(--phase-shine-50)',
        100: 'var(--phase-shine-100)',
        200: 'var(--phase-shine-200)',
        300: 'var(--phase-shine-300)',
        400: 'var(--phase-shine-400)',
        500: 'var(--phase-shine-500)',
        600: 'var(--phase-shine-600)',
        700: 'var(--phase-shine-700)',
        800: 'var(--phase-shine-800)',
        900: 'var(--phase-shine-900)',
        950: 'var(--phase-shine-950)',
      },
      // Enhanced Glass Colors
      'glass': {
        subtle: 'var(--glass-overlay-subtle)',
        light: 'var(--glass-overlay-light)',
        default: 'var(--glass-overlay-default)',
        strong: 'var(--glass-overlay-strong)',
        intense: 'var(--glass-overlay-intense)',
      },
      // Force White for Better Readability
      'white-force': '#ffffff',
      // Tailwind CSS Plus - Enhanced Shadows
      boxShadow: {
        'glow-primary': 'var(--shadow-glow-primary)',
        'glow-primary-strong': 'var(--shadow-glow-primary-strong)',
        'glow-secondary': 'var(--shadow-glow-secondary)',
        'glow-secondary-strong': 'var(--shadow-glow-secondary-strong)',
      },
      // Tailwind CSS Plus - Backdrop Blur
      backdropBlur: {
        'xs': '2px',
        'sm': '4px',
        'md': '8px',
        'lg': '12px',
        'xl': '16px',
        '2xl': '20px',
        '3xl': '24px',
      },
      // Debug Screens (Development Only)
      screens: {
        'xs': '475px',
        'sm': '640px',
        'md': '768px',
        'lg': '1024px',
        'xl': '1280px',
        '2xl': '1536px',
      },
    },
  },
  plugins: [
    require("tailwindcss-animate"),
    require("@tailwindcss/forms"),
    require("@tailwindcss/typography"),
    require("@tailwindcss/aspect-ratio"),
    require("@tailwindcss/line-clamp"),
    // Tailwind CSS Plus - Custom Plugin for Korean Typography
    function({ addUtilities, theme }) {
      const newUtilities = {
        '.break-keep-ko': {
          'word-break': 'keep-all',
          'overflow-wrap': 'break-word',
        },
        '.text-white-force': {
          'color': '#ffffff !important',
        },
        '.text-high-contrast': {
          'color': '#ffffff !important',
          'text-shadow': '0 1px 2px rgba(0, 0, 0, 0.1)',
        },
        '.icon-enhanced': {
          'color': '#ffffff !important',
          'filter': 'drop-shadow(0 1px 2px rgba(0, 0, 0, 0.1))',
        },
        // Glassmorphism Utilities
        '.glass-subtle': {
          'background': 'var(--glass-overlay-subtle)',
          'backdrop-filter': 'blur(6px)',
          'border': '1px solid var(--glass-border-subtle)',
        },
        '.glass-light': {
          'background': 'var(--glass-overlay-light)',
          'backdrop-filter': 'blur(10px)',
          'border': '1px solid var(--glass-border-light)',
        },
        '.glass-default': {
          'background': 'var(--glass-overlay-default)',
          'backdrop-filter': 'blur(16px)',
          'border': '1px solid var(--glass-border-default)',
        },
        '.glass-strong': {
          'background': 'var(--glass-overlay-strong)',
          'backdrop-filter': 'blur(20px)',
          'border': '1px solid var(--glass-border-strong)',
        },
        '.glass-intense': {
          'background': 'var(--glass-overlay-intense)',
          'backdrop-filter': 'blur(24px)',
          'border': '1px solid var(--glass-border-strong)',
        },
        // Enhanced Button Effects
        '.wave-button-glass-enhanced': {
          'background': 'rgba(255, 255, 255, 0.1)',
          'backdrop-filter': 'blur(12px)',
          'border': '1px solid rgba(255, 255, 255, 0.2)',
          'transition': 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
        },
        '.wave-button-primary-enhanced': {
          'transition': 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        },
        '.wave-button-secondary-enhanced': {
          'transition': 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        },
        // Touch Target Utilities
        '.touch-target': {
          'min-height': '44px',
          'min-width': '44px',
        },
        '.touch-target-sm': {
          'min-height': '36px',
          'min-width': '36px',
        },
        '.touch-target-lg': {
          'min-height': '52px',
          'min-width': '52px',
        },
        // Keyboard Navigation
        '.keyboard-navigation': {
          'outline': 'none',
        },
        '.keyboard-navigation:focus-visible': {
          'outline': '2px solid var(--primary-500)',
          'outline-offset': '2px',
          'border-radius': 'var(--radius-sm)',
        },
        // Debug Utilities (Development Only)
        '.debug-screens::before': {
          'position': 'fixed',
          'top': '0',
          'left': '0',
          'z-index': '9999',
          'background': 'rgba(0, 0, 0, 0.8)',
          'color': 'white',
          'padding': '4px 8px',
          'font-size': '12px',
          'font-family': 'monospace',
          'content': '"xs"',
        },
        '@screen sm': {
          '.debug-screens::before': {
            'content': '"sm"',
          },
        },
        '@screen md': {
          '.debug-screens::before': {
            'content': '"md"',
          },
        },
        '@screen lg': {
          '.debug-screens::before': {
            'content': '"lg"',
          },
        },
        '@screen xl': {
          '.debug-screens::before': {
            'content': '"xl"',
          },
        },
        '@screen 2xl': {
          '.debug-screens::before': {
            'content': '"2xl"',
          },
        },
      }
      addUtilities(newUtilities)
    }
  ],
} 