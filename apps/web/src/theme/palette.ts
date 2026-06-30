/**
 * In-app design-token palette: named presets + per-token overrides, applied as
 * inline CSS custom properties on <html> (which win over the :root / :root.dark
 * rules in index.css). Derived tokens that reference var(--background) — card,
 * popover, … — follow automatically.
 *
 * --background / --sidebar are wrapped in color-mix(... var(--surface-opacity) ...)
 * so every preset still honours the macOS vibrancy frost (the "Window opacity"
 * slider). Each preset declares a `mode` so selecting it also flips the app's
 * light/dark mode — that's what makes the terminal and file editor follow the
 * theme instead of staying dark.
 */

export interface PaletteToken {
  readonly cssVar: string;
  readonly label: string;
}

/** Curated tokens that read well as a single editable color value. */
export const EDITABLE_PALETTE_TOKENS: readonly PaletteToken[] = [
  { cssVar: "--background", label: "Background" },
  { cssVar: "--foreground", label: "Foreground" },
  { cssVar: "--card", label: "Card" },
  { cssVar: "--popover", label: "Popover" },
  { cssVar: "--sidebar", label: "Sidebar" },
  { cssVar: "--primary", label: "Primary" },
  { cssVar: "--primary-foreground", label: "Primary text" },
  { cssVar: "--accent", label: "Accent" },
  { cssVar: "--accent-foreground", label: "Accent text" },
  { cssVar: "--border", label: "Border" },
  { cssVar: "--muted-foreground", label: "Muted text" },
  { cssVar: "--destructive", label: "Destructive" },
];

export type PaletteMode = "light" | "dark";

export interface PalettePreset {
  readonly id: string;
  readonly label: string;
  readonly mode: PaletteMode;
  readonly overrides: Readonly<Record<string, string>>;
}

// Keep --background / --sidebar translucent-capable so vibrancy still shows through.
function frost(hex: string): string {
  return `color-mix(in srgb, ${hex} var(--surface-opacity, 100%), transparent)`;
}

// Near-black dark variant: keeps the shipped foreground + blue primary, only shifts
// the surface darkness. `bg`/`sidebar` get the lightest values for a softer midnight.
function midnight(
  id: string,
  label: string,
  s: { bg: string; sidebar: string; card: string },
): PalettePreset {
  return {
    id,
    label,
    mode: "dark",
    overrides: {
      "--background": frost(s.bg),
      "--sidebar": frost(s.sidebar),
      "--card": s.card,
      "--popover": s.card,
      "--border": "oklch(1 0 0 / 8%)",
    },
  };
}

interface LightSpec {
  readonly bg: string;
  readonly sidebar: string;
  readonly card: string;
  readonly fg: string;
  /** Secondary (muted) dark text for a light background. */
  readonly text2: string;
  readonly primary: string;
  readonly destructive?: string;
}

function lightTheme(id: string, label: string, s: LightSpec): PalettePreset {
  return {
    id,
    label,
    mode: "light",
    overrides: {
      "--background": frost(s.bg),
      "--sidebar": frost(s.sidebar),
      "--card": s.card,
      "--popover": s.card,
      "--foreground": s.fg,
      // The shipped dark theme paints derived text/overlays for a dark surface; on a
      // light background they must flip or borders/menus/labels go invisible.
      "--card-foreground": s.fg,
      "--popover-foreground": s.fg,
      "--sidebar-foreground": s.fg,
      "--secondary-foreground": s.fg,
      "--accent-foreground": s.fg,
      "--muted-foreground": s.text2,
      "--secondary": "oklch(0 0 0 / 5%)",
      "--muted": "oklch(0 0 0 / 5%)",
      "--accent": "oklch(0 0 0 / 6%)",
      "--input": "oklch(0 0 0 / 10%)",
      "--border": "oklch(0 0 0 / 12%)",
      "--primary": s.primary,
      "--primary-foreground": "#ffffff",
      "--destructive": s.destructive ?? "#dc322f",
    },
  };
}

export const PALETTE_PRESETS: readonly PalettePreset[] = [
  // "Default" keeps the shipped (dark) colors untouched.
  { id: "default", label: "Default", mode: "dark", overrides: {} },

  // ── Midnight family (near-black → softer) ─────────────────────────────────
  midnight("midnight", "Midnight", { bg: "#000000", sidebar: "#070707", card: "#0b0b0b" }),
  midnight("midnight-soft", "Midnight Soft", { bg: "#0a0a0a", sidebar: "#0f0f0f", card: "#151515" }),
  midnight("midnight-elevated", "Midnight Elevated", {
    bg: "#141414", sidebar: "#1a1a1a", card: "#202020",
  }),
  midnight("midnight-slate", "Midnight Slate", {
    bg: "#15171c", sidebar: "#1b1e25", card: "#23272f",
  }),

  // ── Solarized Light family (cream → deeper) ───────────────────────────────
  lightTheme("solarized-light", "Solarized Light", {
    bg: "#fdf6e3", sidebar: "#eee8d5", card: "#fffbf0", fg: "#586e75", text2: "#657b83",
    primary: "#268bd2",
  }),
  lightTheme("solarized-dim", "Solarized Dim", {
    bg: "#f3ead0", sidebar: "#e6dcbf", card: "#f9f1da", fg: "#4e6166", text2: "#5c727a",
    primary: "#1f7fc2",
  }),
  lightTheme("solarized-deep", "Solarized Deep", {
    bg: "#e7dcbc", sidebar: "#d9cda8", card: "#efe6c8", fg: "#46585c", text2: "#54696f",
    primary: "#1a72b0",
  }),
];

export const DEFAULT_PALETTE_PRESET_ID = "default";

export function resolvePalettePreset(id: string | undefined): PalettePreset {
  return PALETTE_PRESETS.find((preset) => preset.id === id) ?? PALETTE_PRESETS[0]!;
}

// Every var this module ever sets — so applyPalette can clear the ones no longer
// present (preset switch / cleared override) instead of leaking stale inline values.
const MANAGED_VARS: ReadonlySet<string> = new Set<string>([
  ...EDITABLE_PALETTE_TOKENS.map((token) => token.cssVar),
  ...PALETTE_PRESETS.flatMap((preset) => Object.keys(preset.overrides)),
]);

/** Apply preset overrides, then user overrides on top, as inline custom props. */
export function applyPalette(
  presetId: string | undefined,
  userOverrides: Readonly<Record<string, string>> | undefined,
): void {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  const merged: Record<string, string> = {
    ...resolvePalettePreset(presetId).overrides,
    ...(userOverrides ?? {}),
  };
  for (const cssVar of MANAGED_VARS) {
    const value = merged[cssVar];
    if (value && value.trim().length > 0) root.style.setProperty(cssVar, value.trim());
    else root.style.removeProperty(cssVar);
  }
}
