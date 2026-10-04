'use client';

import { useEffect } from 'react';
import type { ThemeKey, ThemeMode } from '@/lib/theme/themes';
import type { FontKey } from '@/lib/theme/fonts';

function applyDark(isDark: boolean) {
  document.documentElement.classList.toggle('dark', isDark);
}

function writeCookie(name: string, value: string) {
  document.cookie = `${name}=${value}; path=/; max-age=${60 * 60 * 24 * 365}`;
}

// Keeps the live DOM + cookies in sync with the business-wide Appearance
// setting on every authenticated page load — a Server Component can't
// write cookies outside a Server Action/Route Handler, so a session that
// never itself saved the Appearance form (a different device, or one that
// loaded before a setting change) picks up the current theme/mode here
// instead, via plain client-side DOM/cookie APIs. No visual output.
export function ThemeSync({
  theme,
  mode,
  font,
}: {
  theme: ThemeKey;
  mode: ThemeMode;
  font: FontKey;
}) {
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.documentElement.dataset.font = font;
    writeCookie('theme', theme);
    writeCookie('theme_mode', mode);
    writeCookie('theme_font', font);

    if (mode === 'system') {
      const query = window.matchMedia('(prefers-color-scheme: dark)');
      applyDark(query.matches);
      const onChange = (event: MediaQueryListEvent) => applyDark(event.matches);
      query.addEventListener('change', onChange);
      return () => query.removeEventListener('change', onChange);
    }

    applyDark(mode === 'dark');
  }, [theme, mode, font]);

  return null;
}
