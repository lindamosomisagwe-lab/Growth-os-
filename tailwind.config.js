// tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    // ─── HARD RESET ───────────────────────────────────────────────────────
    // Override Tailwind defaults to enforce Neo-Minimalist constraints.
    // Nothing rounded, nothing shadowed, nothing soft.
    borderRadius: {
      none:    "0px",
      sm:      "2px",   // Only for active/focus states — not decoration
      DEFAULT: "0px",
    },
    boxShadow: {
      none:    "none",
      DEFAULT: "none",
      focus:   "0 0 0 2px #000000", // Functional only — keyboard nav
    },
    fontFamily: {
      sans: ["Inter", "system-ui", "sans-serif"],
      mono: ["'IBM Plex Mono'", "monospace"],
    },

    // ─── NEO-MINIMALIST PALETTE ───────────────────────────────────────────
    // Monochrome core + 4 functional status tints (never fills, dots only).
    colors: {
      white:       "#FFFFFF",
      black:       "#000000",
      transparent: "transparent",
      current:     "currentColor",

      neutral: {
        50:  "#FAFAFA",
        100: "#F5F5F5",
        200: "#E5E5E5",
        300: "#D4D4D4",
        400: "#A3A3A3",
        500: "#737373",
        600: "#525252",
        700: "#404040",
        800: "#262626",
        900: "#171717",
      },

      // Status — tiny dot indicators ONLY. Never backgrounds or borders.
      status: {
        overdue:  "#CC0000",
        complete: "#000000",
        active:   "#525252",
        paused:   "#A3A3A3",
      },
    },

    extend: {
      spacing: {
        // 8pt grid extensions for Swiss layout breathing room
        18: "4.5rem",
        22: "5.5rem",
        26: "6.5rem",
      },
      fontSize: {
        "2xs": ["0.625rem",  { lineHeight: "1rem",    letterSpacing: "0.08em"  }],
        label: ["0.6875rem", { lineHeight: "1rem",    letterSpacing: "0.12em"  }],
        xs:    ["0.75rem",   { lineHeight: "1.125rem" }],
        sm:    ["0.875rem",  { lineHeight: "1.375rem" }],
        base:  ["1rem",      { lineHeight: "1.5rem"   }],
        lg:    ["1.125rem",  { lineHeight: "1.625rem" }],
        xl:    ["1.25rem",   { lineHeight: "1.75rem"  }],
        "2xl": ["1.5rem",    { lineHeight: "1.875rem" }],
        "3xl": ["1.875rem",  { lineHeight: "2.25rem"  }],
        "4xl": ["2.25rem",   { lineHeight: "2.5rem"   }],
      },
    },
  },
  plugins: [],
};
