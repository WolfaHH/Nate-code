/**
 * In-app design-token palette: named presets + per-token overrides, applied as
 * inline CSS custom properties on <html> (which win over the :root / :root.dark
 * rules in index.css). Derived tokens that reference var(--background) — card,
 * popover, … — follow automatically, so a "blacker" look only needs a few vars.
 *
 * --background / --sidebar are wrapped in color-mix(... var(--surface-opacity) ...)
 * so every preset still honours the macOS vibrancy frost (the "Window opacity"
 * slider). Dark presets only need a handful of vars; light presets also flip the
 * white-alpha overlay tokens to black-alpha so borders/menus stay visible.
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

export interface PalettePreset {
  readonly id: string;
  readonly label: string;
  readonly overrides: Readonly<Record<string, string>>;
}

// Keep --background / --sidebar translucent-capable so vibrancy still shows through.
function frost(hex: string): string {
  return `color-mix(in srgb, ${hex} var(--surface-opacity, 100%), transparent)`;
}

interface DarkSpec {
  readonly bg: string;
  readonly sidebar: string;
  readonly card: string;
  readonly fg: string;
  readonly primary: string;
  readonly primaryFg?: string;
  readonly border?: string;
  readonly muted?: string;
  readonly destructive?: string;
}

function darkTheme(id: string, label: string, s: DarkSpec): PalettePreset {
  return {
    id,
    label,
    overrides: {
      "--background": frost(s.bg),
      "--sidebar": frost(s.sidebar),
      "--card": s.card,
      "--popover": s.card,
      "--foreground": s.fg,
      "--primary": s.primary,
      "--primary-foreground": s.primaryFg ?? "#ffffff",
      "--border": s.border ?? "oklch(1 0 0 / 8%)",
      ...(s.muted ? { "--muted-foreground": s.muted } : {}),
      "--destructive": s.destructive ?? "#f7768e",
    },
  };
}

interface LightSpec extends DarkSpec {
  /** Secondary (muted) dark text for a light background. */
  readonly text2: string;
}

function lightTheme(id: string, label: string, s: LightSpec): PalettePreset {
  return {
    id,
    label,
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
      "--muted-foreground": s.muted ?? s.text2,
      "--secondary": "oklch(0 0 0 / 5%)",
      "--muted": "oklch(0 0 0 / 5%)",
      "--accent": "oklch(0 0 0 / 6%)",
      "--input": "oklch(0 0 0 / 10%)",
      "--border": s.border ?? "oklch(0 0 0 / 12%)",
      "--primary": s.primary,
      "--primary-foreground": s.primaryFg ?? "#ffffff",
      "--destructive": s.destructive ?? "#d20f39",
    },
  };
}

export const PALETTE_PRESETS: readonly PalettePreset[] = [
  // "Default" keeps the shipped colors untouched (no overrides).
  { id: "default", label: "Default", overrides: {} },
  // Near-pure-black dark (the original "Default 2").
  darkTheme("midnight", "Default 2 (Midnight)", {
    bg: "#000000",
    sidebar: "#070707",
    card: "#0b0b0b",
    fg: "#ededed",
    primary: "oklch(0.588 0.217 264)",
    border: "oklch(1 0 0 / 8%)",
  }),

  // ── Dark ────────────────────────────────────────────────────────────────
  darkTheme("tokyo-night", "Tokyo Night", {
    bg: "#1a1b26", sidebar: "#16161e", card: "#1f2335", fg: "#a9b1d6", primary: "#7aa2f7",
  }),
  darkTheme("tokyo-storm", "Tokyo Night Storm", {
    bg: "#24283b", sidebar: "#1f2335", card: "#292e42", fg: "#a9b1d6", primary: "#7aa2f7",
  }),
  darkTheme("catppuccin-mocha", "Catppuccin Mocha", {
    bg: "#1e1e2e", sidebar: "#181825", card: "#313244", fg: "#cdd6f4", primary: "#cba6f7",
  }),
  darkTheme("catppuccin-macchiato", "Catppuccin Macchiato", {
    bg: "#24273a", sidebar: "#1e2030", card: "#363a4f", fg: "#cad3f5", primary: "#c6a0f6",
  }),
  darkTheme("catppuccin-frappe", "Catppuccin Frappé", {
    bg: "#303446", sidebar: "#292c3c", card: "#414559", fg: "#c6d0f5", primary: "#ca9ee6",
  }),
  darkTheme("gruvbox-dark", "Gruvbox Dark", {
    bg: "#282828", sidebar: "#1d2021", card: "#3c3836", fg: "#ebdbb2",
    primary: "#fabd2f", primaryFg: "#282828", destructive: "#fb4934",
  }),
  darkTheme("gruvbox-material", "Gruvbox Material Dim", {
    bg: "#32302f", sidebar: "#2a2827", card: "#3a3735", fg: "#d4be98",
    primary: "#a9b665", primaryFg: "#32302f",
  }),
  darkTheme("nord", "Nord", {
    bg: "#2e3440", sidebar: "#2b303b", card: "#3b4252", fg: "#d8dee9",
    primary: "#88c0d0", primaryFg: "#2e3440", destructive: "#bf616a",
  }),
  darkTheme("dracula", "Dracula", {
    bg: "#282a36", sidebar: "#21222c", card: "#44475a", fg: "#f8f8f2",
    primary: "#bd93f9", primaryFg: "#282a36", destructive: "#ff5555",
  }),
  darkTheme("rose-pine", "Rosé Pine", {
    bg: "#191724", sidebar: "#1f1d2e", card: "#26233a", fg: "#e0def4",
    primary: "#ebbcba", primaryFg: "#191724", destructive: "#eb6f92",
  }),
  darkTheme("one-dark", "One Dark", {
    bg: "#282c34", sidebar: "#21252b", card: "#2c313a", fg: "#abb2bf",
    primary: "#61afef", destructive: "#e06c75",
  }),
  darkTheme("solarized-dark", "Solarized Dark", {
    bg: "#002b36", sidebar: "#073642", card: "#073642", fg: "#93a1a1",
    primary: "#268bd2", destructive: "#dc322f",
  }),
  darkTheme("everforest", "Everforest Dark", {
    bg: "#2d353b", sidebar: "#272e33", card: "#374247", fg: "#d3c6aa",
    primary: "#a7c080", primaryFg: "#2d353b", destructive: "#e67e80",
  }),
  darkTheme("kanagawa", "Kanagawa", {
    bg: "#1f1f28", sidebar: "#16161d", card: "#2a2a37", fg: "#dcd7ba",
    primary: "#7e9cd8", destructive: "#e82424",
  }),
  darkTheme("ayu-mirage", "Ayu Mirage", {
    bg: "#1f2430", sidebar: "#1a1f29", card: "#232834", fg: "#cccac2",
    primary: "#ffcc66", primaryFg: "#1f2430", destructive: "#f28779",
  }),
  darkTheme("night-owl", "Night Owl", {
    bg: "#011627", sidebar: "#010e1a", card: "#0e2a3f", fg: "#d6deeb",
    primary: "#82aaff", destructive: "#ef5350",
  }),
  darkTheme("zenburn", "Zenburn", {
    bg: "#3f3f3f", sidebar: "#383838", card: "#4f4f4f", fg: "#dcdccc",
    primary: "#8cd0d3", primaryFg: "#2a2a2a", destructive: "#cc9393",
  }),

  // ── Light ───────────────────────────────────────────────────────────────
  lightTheme("catppuccin-latte", "Catppuccin Latte", {
    bg: "#eff1f5", sidebar: "#e6e9ef", card: "#ffffff", fg: "#4c4f69", text2: "#6c6f85",
    primary: "#8839ef", destructive: "#d20f39",
  }),
  lightTheme("solarized-light", "Solarized Light", {
    bg: "#fdf6e3", sidebar: "#eee8d5", card: "#fffbf0", fg: "#586e75", text2: "#657b83",
    primary: "#268bd2", destructive: "#dc322f",
  }),
  lightTheme("rose-pine-dawn", "Rosé Pine Dawn", {
    bg: "#faf4ed", sidebar: "#f2e9e1", card: "#fffaf3", fg: "#575279", text2: "#797593",
    primary: "#d7827e", destructive: "#b4637a",
  }),
  lightTheme("gruvbox-light", "Gruvbox Light", {
    bg: "#fbf1c7", sidebar: "#f2e5bc", card: "#ffffff", fg: "#3c3836", text2: "#665c54",
    primary: "#b57614", destructive: "#9d0006",
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
