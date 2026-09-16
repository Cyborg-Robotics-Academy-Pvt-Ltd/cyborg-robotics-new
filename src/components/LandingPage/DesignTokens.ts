/**
 * Design tokens — EdTech course catalog
 * Source of truth for colors/spacing referenced across CoursesSection.
 * Merge `colors` into tailwind.config.ts under theme.extend.colors if you
 * want semantic class names (bg-brand-navy) instead of arbitrary values.
 */

export const colors = {
  navy: "#101D45",      // primary text, selected pill bg
  gray: "#68728D",      // secondary text
  coral: "#F04444",     // CTA (all "View course" links/buttons)
  bg: {
    white: "#FFFFFF",
    lavender: "#F7F7FF",
    blueGray: "#F5F8FF",
  },
  accent: {
    purple: "#7546E8",
    violet: "#8B5CF6",
    pink: "#F04A9B",
    coral: "#F04444",
    orange: "#FF7A00",
    green: "#31C85B",
    blue: "#3978F6",
  },
} as const;

export type AccentKey = keyof typeof colors.accent;

/** 8px spacing system used across the section. */
export const spacing = {
  xs: "8px",
  sm: "16px",
  md: "24px",
  lg: "32px",
  xl: "48px",
  "2xl": "64px",
} as const;

/** Card corner radius per spec (~16px = Tailwind rounded-2xl). */
export const radius = {
  card: "16px",
  pill: "9999px",
};