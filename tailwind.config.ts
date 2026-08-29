import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: { "2xl": "1400px" },
    },
    extend: {
      /*
       * One scale, five steps.
       *
       * The workspace had almost everything at `sm` with 10px and 11px sprinkled
       * around, so a page title, a card title and a table cell all carried
       * roughly the same weight and nothing led the eye. Each step below is a
       * clear jump from the one under it, and there is now a single small size
       * rather than two that differ by a pixel.
       */
      fontSize: {
        /* Chips, table headers, timestamps — anything that labels rather than reads. */
        micro: ["0.6875rem", { lineHeight: "1.45", letterSpacing: "0.02em" }],
        /* Secondary text: metadata rows, helper lines under a field. */
        xs: ["0.75rem", { lineHeight: "1.55" }],
        /*
         * Body copy is prose here — business needs, rule logic, descriptions —
         * so it carries a reading line-height rather than the tight UI default.
         */
        sm: ["0.875rem", { lineHeight: "1.65" }],
        base: ["1rem", { lineHeight: "1.7" }],
        /* Card and section titles. */
        title: ["1.0625rem", { lineHeight: "1.4", letterSpacing: "-0.01em" }],
        /* Page headings. */
        heading: ["1.5rem", { lineHeight: "1.25", letterSpacing: "-0.02em" }],
        display: ["1.875rem", { lineHeight: "1.2", letterSpacing: "-0.025em" }],
      },
      maxWidth: {
        /* Roughly 70 characters: the span the eye can track back reliably. */
        measure: "68ch",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "var(--font-sans-fallback)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "var(--font-mono-fallback)", "monospace"],
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        surface: {
          DEFAULT: "hsl(var(--surface))",
          muted: "hsl(var(--surface-muted))",
        },
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
      /*
       * Elevation, in three steps: resting, lifted, floating.
       *
       * The colour comes from a variable because a shadow tuned for a white
       * page is invisible on a dark one — the workspace defaults to dark, so
       * every card was reading as flat. On dark the shadow deepens and a hair
       * of light is added along the top edge, which is what actually separates
       * a surface from its background when there is no darkness left to cast.
       */
      boxShadow: {
        card: "0 1px 2px 0 hsl(var(--shadow) / 0.05), 0 1px 3px 0 hsl(var(--shadow) / 0.08), inset 0 1px 0 0 hsl(var(--edge-light) / var(--edge-light-alpha))",
        raised:
          "0 4px 12px -2px hsl(var(--shadow) / 0.12), 0 2px 4px -2px hsl(var(--shadow) / 0.06), inset 0 1px 0 0 hsl(var(--edge-light) / var(--edge-light-alpha))",
        flyout:
          "0 16px 40px -10px hsl(var(--shadow) / 0.28), 0 4px 12px -4px hsl(var(--shadow) / 0.14)",
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
        shimmer: {
          "100%": { transform: "translateX(100%)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.18s ease-out",
        "accordion-up": "accordion-up 0.18s ease-out",
        shimmer: "shimmer 1.6s infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
