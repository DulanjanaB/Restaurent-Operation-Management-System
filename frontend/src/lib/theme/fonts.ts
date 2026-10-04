export type FontKey = 'geist' | 'inter' | 'poppins' | 'roboto' | 'lora';

export interface FontPreset {
  key: FontKey;
  label: string;
  description: string;
  // Matches the CSS variable next/font assigns it in layout.tsx — used by
  // the picker to preview each option in its own actual typeface.
  cssVariable: string;
}

export const FONTS: FontPreset[] = [
  {
    key: 'geist',
    label: 'Geist',
    description: 'Clean and modern — the default.',
    cssVariable: '--font-geist',
  },
  {
    key: 'inter',
    label: 'Inter',
    description:
      'The standard for dashboards — extremely legible at small sizes.',
    cssVariable: '--font-inter',
  },
  {
    key: 'poppins',
    label: 'Poppins',
    description: 'Geometric and friendly — warmer, fits hospitality branding.',
    cssVariable: '--font-poppins',
  },
  {
    key: 'roboto',
    label: 'Roboto',
    description: 'Neutral and professional — the safest, most familiar choice.',
    cssVariable: '--font-roboto',
  },
  {
    key: 'lora',
    label: 'Lora',
    description:
      'A serif with personality — distinct from the usual SaaS look.',
    cssVariable: '--font-lora',
  },
];

export const DEFAULT_FONT: FontKey = 'geist';

export function isFontKey(value: unknown): value is FontKey {
  return typeof value === 'string' && FONTS.some((font) => font.key === value);
}
