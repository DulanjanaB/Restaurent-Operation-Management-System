export type ThemeKey = 'warm' | 'ocean' | 'forest' | 'slate';
export type ThemeMode = 'light' | 'dark' | 'system';

export interface ThemePreset {
  key: ThemeKey;
  label: string;
  description: string;
  // Swatch colors for the picker UI, as real CSS colors (not tokens) so
  // they render correctly regardless of which theme is currently active.
  swatch: { background: string; primary: string; accent: string };
}

export const THEMES: ThemePreset[] = [
  {
    key: 'warm',
    label: 'Warm',
    description: 'Amber & terracotta — the default.',
    swatch: {
      background: 'oklch(0.985 0.008 75)',
      primary: 'oklch(0.62 0.19 45)',
      accent: 'oklch(0.91 0.045 55)',
    },
  },
  {
    key: 'ocean',
    label: 'Ocean',
    description: 'Cool blue, modern dashboard feel.',
    swatch: {
      background: 'oklch(0.985 0.005 230)',
      primary: 'oklch(0.55 0.18 235)',
      accent: 'oklch(0.91 0.035 230)',
    },
  },
  {
    key: 'forest',
    label: 'Forest',
    description: 'Deep green, fresh and calm.',
    swatch: {
      background: 'oklch(0.985 0.006 140)',
      primary: 'oklch(0.52 0.15 150)',
      accent: 'oklch(0.91 0.04 140)',
    },
  },
  {
    key: 'slate',
    label: 'Slate',
    description: 'Neutral grayscale, no accent color.',
    swatch: {
      background: 'oklch(1 0 0)',
      primary: 'oklch(0.205 0 0)',
      accent: 'oklch(0.97 0 0)',
    },
  },
];

export const DEFAULT_THEME: ThemeKey = 'warm';
export const DEFAULT_MODE: ThemeMode = 'system';

export function isThemeKey(value: unknown): value is ThemeKey {
  return (
    typeof value === 'string' && THEMES.some((theme) => theme.key === value)
  );
}

export function isThemeMode(value: unknown): value is ThemeMode {
  return value === 'light' || value === 'dark' || value === 'system';
}
