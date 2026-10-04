import 'server-only';
import { cookies } from 'next/headers';
import {
  DEFAULT_MODE,
  DEFAULT_THEME,
  isThemeKey,
  isThemeMode,
  type ThemeKey,
  type ThemeMode,
} from './themes';
import { DEFAULT_FONT, isFontKey, type FontKey } from './fonts';

const THEME_COOKIE = 'theme';
const MODE_COOKIE = 'theme_mode';
const FONT_COOKIE = 'theme_font';

// Plain (non-httpOnly) cookies — there's nothing sensitive in "which color
// scheme/font", and the no-flash inline script in the root layout needs to
// read them client-side before React hydrates. The business-wide value
// saved in Settings is the source of truth for any authenticated session
// (synced by ThemeSync on every (app) page load); this cookie only exists
// so the pre-auth /login page, and the very first paint before that sync
// runs, aren't stuck on a hardcoded default.
export async function getThemeCookies(): Promise<{
  theme: ThemeKey;
  mode: ThemeMode;
  font: FontKey;
}> {
  const store = await cookies();
  const theme = store.get(THEME_COOKIE)?.value;
  const mode = store.get(MODE_COOKIE)?.value;
  const font = store.get(FONT_COOKIE)?.value;
  return {
    theme: isThemeKey(theme) ? theme : DEFAULT_THEME,
    mode: isThemeMode(mode) ? mode : DEFAULT_MODE,
    font: isFontKey(font) ? font : DEFAULT_FONT,
  };
}

// Only callable from a Server Action or Route Handler (Next.js 16 rule) —
// used by the Appearance form's save action for instant same-tab effect.
// ThemeSync (a Client Component) corrects a stale/missing cookie on any
// other session via plain `document.cookie` instead, since these cookies
// are deliberately non-httpOnly.
export async function setThemeCookies(
  theme: ThemeKey,
  mode: ThemeMode,
  font: FontKey,
): Promise<void> {
  const store = await cookies();
  const oneYear = { maxAge: 60 * 60 * 24 * 365, path: '/' };
  store.set(THEME_COOKIE, theme, oneYear);
  store.set(MODE_COOKIE, mode, oneYear);
  store.set(FONT_COOKIE, font, oneYear);
}
