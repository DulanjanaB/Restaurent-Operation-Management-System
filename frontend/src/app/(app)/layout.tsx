import { requireSession } from '@/lib/auth/dal';
import { Sidebar } from '@/components/app-shell/sidebar';
import { Topbar } from '@/components/app-shell/topbar';
import { BackBar } from '@/components/app-shell/back-bar';
import { ThemeSync } from '@/components/app-shell/theme-sync';
import { FormattingProvider } from '@/context/formatting-context';
import { DEFAULT_FORMATTING, type FormattingSettings } from '@/lib/format';
import {
  DEFAULT_MODE,
  DEFAULT_THEME,
  isThemeKey,
  isThemeMode,
  type ThemeKey,
  type ThemeMode,
} from '@/lib/theme/themes';
import { DEFAULT_FONT, isFontKey, type FontKey } from '@/lib/theme/fonts';
import {
  DEFAULT_BRAND_NAME,
  type Brand as BrandValue,
} from '@/components/app-shell/brand';
import { getBrand, getSettingsByCategory } from '@/lib/server/settings/queries';
import { toSettingsMap } from '@/lib/server/settings/types';

// GET /settings needs settings.view, which most non-admin users won't
// hold — degrade to defaults for them rather than erroring the whole
// shell over a formatting/appearance preference.
// Currency, number format and timezone come from the public brand endpoint so
// every signed-in user formats amounts the same way, whatever their permissions.
async function loadFormattingSettings(): Promise<FormattingSettings> {
  try {
    const brand = await getBrand();
    return {
      locale: brand.number_format ?? DEFAULT_FORMATTING.locale,
      currency: brand.currency ?? DEFAULT_FORMATTING.currency,
      timezone: brand.timezone ?? DEFAULT_FORMATTING.timezone,
    };
  } catch {
    return DEFAULT_FORMATTING;
  }
}

// Same degrade-on-missing-permission pattern as formatting — this is the
// business-wide value a Server Component can't write to cookies itself
// (Next.js 16 rule), so ThemeSync applies it client-side on every load.
async function loadAppearanceSettings(): Promise<{
  theme: ThemeKey;
  mode: ThemeMode;
  font: FontKey;
}> {
  try {
    const rows = await getSettingsByCategory('appearance');
    const map = toSettingsMap(rows);
    const theme = map.theme;
    const mode = map.mode;
    const font = map.font;
    return {
      theme: isThemeKey(theme) ? theme : DEFAULT_THEME,
      mode: isThemeMode(mode) ? mode : DEFAULT_MODE,
      font: isFontKey(font) ? font : DEFAULT_FONT,
    };
  } catch {
    return { theme: DEFAULT_THEME, mode: DEFAULT_MODE, font: DEFAULT_FONT };
  }
}

async function loadBrand(): Promise<BrandValue> {
  try {
    const brand = await getBrand();
    return {
      name: brand.business_name ?? DEFAULT_BRAND_NAME,
      logoUrl: brand.logo_url,
    };
  } catch {
    return { name: DEFAULT_BRAND_NAME, logoUrl: null };
  }
}

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [me, formatting, appearance, brand] = await Promise.all([
    requireSession(),
    loadFormattingSettings(),
    loadAppearanceSettings(),
    loadBrand(),
  ]);

  return (
    <FormattingProvider value={formatting}>
      <ThemeSync
        theme={appearance.theme}
        mode={appearance.mode}
        font={appearance.font}
      />
      <div className="flex min-h-svh">
        <Sidebar me={me} brand={brand} />
        <div className="flex min-w-0 flex-1 flex-col">
          <Topbar me={me} brand={brand} />
          <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 sm:p-6">
            <BackBar />
            {children}
          </main>
        </div>
      </div>
    </FormattingProvider>
  );
}
