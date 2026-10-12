// The colour themes the admin can pick for the whole site. Each one replaces the purple brand
// colours; text, surfaces and the green/red status colours stay the same. The database
// (store_settings.theme) only accepts these keys.

export interface Theme {
  key: string;
  name: string;
  /** Links, highlights and buy buttons. */
  brand: string;
  /** Pressed buy buttons and button edges. */
  brandStrong: string;
  /** Hovered buy buttons and banner gradients. */
  brandLight: string;
  /** Tinted backgrounds, e.g. a picked size chip. */
  brandSoft: string;
}

export const THEMES: readonly Theme[] = [
  {
    key: "plum",
    name: "Plum",
    brand: "#9c1d87",
    brandStrong: "#7a1569",
    brandLight: "#b02a93",
    brandSoft: "#fdf0fa",
  },
  {
    key: "rose",
    name: "Rose",
    brand: "#db2777",
    brandStrong: "#be185d",
    brandLight: "#ec4899",
    brandSoft: "#fdf2f8",
  },
  {
    key: "crimson",
    name: "Crimson",
    brand: "#dc2626",
    brandStrong: "#b91c1c",
    brandLight: "#ef4444",
    brandSoft: "#fef2f2",
  },
  {
    key: "coral",
    name: "Coral",
    brand: "#ea580c",
    brandStrong: "#c2410c",
    brandLight: "#f97316",
    brandSoft: "#fff7ed",
  },
  {
    key: "amber",
    name: "Amber",
    brand: "#b45309",
    brandStrong: "#92400e",
    brandLight: "#d97706",
    brandSoft: "#fffbeb",
  },
  {
    key: "forest",
    name: "Forest",
    brand: "#15803d",
    brandStrong: "#166534",
    brandLight: "#16a34a",
    brandSoft: "#f0fdf4",
  },
  {
    key: "emerald",
    name: "Emerald",
    brand: "#059669",
    brandStrong: "#047857",
    brandLight: "#10b981",
    brandSoft: "#ecfdf5",
  },
  {
    key: "teal",
    name: "Teal",
    brand: "#0f766e",
    brandStrong: "#115e59",
    brandLight: "#0d9488",
    brandSoft: "#f0fdfa",
  },
  {
    key: "ocean",
    name: "Ocean",
    brand: "#0369a1",
    brandStrong: "#075985",
    brandLight: "#0284c7",
    brandSoft: "#f0f9ff",
  },
  {
    key: "sky",
    name: "Sky",
    brand: "#2563eb",
    brandStrong: "#1d4ed8",
    brandLight: "#3b82f6",
    brandSoft: "#eff6ff",
  },
  {
    key: "indigo",
    name: "Indigo",
    brand: "#4f46e5",
    brandStrong: "#4338ca",
    brandLight: "#6366f1",
    brandSoft: "#eef2ff",
  },
  {
    key: "violet",
    name: "Violet",
    brand: "#7c3aed",
    brandStrong: "#6d28d9",
    brandLight: "#8b5cf6",
    brandSoft: "#f5f3ff",
  },
  {
    key: "slate",
    name: "Slate",
    brand: "#334155",
    brandStrong: "#1e293b",
    brandLight: "#475569",
    brandSoft: "#f1f5f9",
  },
  {
    key: "chocolate",
    name: "Chocolate",
    brand: "#78350f",
    brandStrong: "#5a2709",
    brandLight: "#92400e",
    brandSoft: "#fdf6ec",
  },
  {
    key: "midnight",
    name: "Midnight",
    brand: "#1e1b4b",
    brandStrong: "#12103a",
    brandLight: "#312e81",
    brandSoft: "#eeedf8",
  },
];

export const DEFAULT_THEME_KEY = "plum";

/** The theme for a key, or the default when the key is unknown. */
export function getTheme(key: string | null | undefined): Theme {
  return THEMES.find((theme) => theme.key === key) ?? THEMES[0];
}

/** The CSS custom properties a theme sets, for the root element's style attribute. */
export function themeStyle(theme: Theme): Record<string, string> {
  return {
    "--color-brand": theme.brand,
    "--color-brand-strong": theme.brandStrong,
    "--color-brand-light": theme.brandLight,
    "--color-brand-soft": theme.brandSoft,
  };
}
