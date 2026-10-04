'use server';

import { revalidatePath } from 'next/cache';
import { apiFetch } from '@/lib/api/client';
import { describeApiError, type ActionResult } from '@/lib/validation';
import { setThemeCookies } from '@/lib/theme/cookies';
import {
  DEFAULT_MODE,
  DEFAULT_THEME,
  isThemeKey,
  isThemeMode,
} from '@/lib/theme/themes';
import { DEFAULT_FONT, isFontKey } from '@/lib/theme/fonts';

async function upsertSetting(
  category: string,
  key: string,
  value: unknown,
): Promise<void> {
  await apiFetch(`/settings/${category}/${key}`, {
    method: 'PUT',
    body: JSON.stringify({ value }),
  });
}

async function saveFields(
  category: string,
  fields: Record<string, unknown>,
): Promise<ActionResult> {
  try {
    await Promise.all(
      Object.entries(fields).map(([key, value]) =>
        upsertSetting(category, key, value),
      ),
    );
  } catch (error) {
    return describeApiError(error);
  }
  revalidatePath('/settings');
  return {};
}

function str(formData: FormData, key: string): string | undefined {
  const value = formData.get(key);
  return typeof value === 'string' && value.length > 0 ? value : undefined;
}

export async function saveBusinessProfile(
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  return saveFields('business_profile', {
    business_name: str(formData, 'business_name') ?? '',
    logo_url: str(formData, 'logo_url') ?? '',
    address: str(formData, 'address') ?? '',
    phone: str(formData, 'phone') ?? '',
    email: str(formData, 'email') ?? '',
    website: str(formData, 'website') ?? '',
  });
}

export async function saveAppearance(
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const themeValue = str(formData, 'theme');
  const modeValue = str(formData, 'mode');
  const fontValue = str(formData, 'font');
  const theme = isThemeKey(themeValue) ? themeValue : DEFAULT_THEME;
  const mode = isThemeMode(modeValue) ? modeValue : DEFAULT_MODE;
  const font = isFontKey(fontValue) ? fontValue : DEFAULT_FONT;

  const result = await saveFields('appearance', { theme, mode, font });
  if (!result.error && !result.fieldErrors) {
    // Instant same-tab effect — every other session picks this up via
    // ThemeSync on its next (app) page load instead.
    await setThemeCookies(theme, mode, font);
  }
  return result;
}

export async function saveSystem(
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  return saveFields('system', {
    timezone: str(formData, 'timezone') ?? 'UTC',
    currency: str(formData, 'currency') ?? 'USD',
    date_format: str(formData, 'date_format') ?? 'YYYY-MM-DD',
    number_format: str(formData, 'number_format') ?? 'en-US',
  });
}

export async function saveSecurity(
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  return saveFields('security', {
    password_policy: {
      min_length: Number(formData.get('min_length') ?? 8),
      require_uppercase: formData.get('require_uppercase') === 'on',
      require_number: formData.get('require_number') === 'on',
      require_symbol: formData.get('require_symbol') === 'on',
      expiry_days: Number(formData.get('expiry_days') ?? 90),
    },
    session_settings: {
      timeout_minutes: Number(formData.get('timeout_minutes') ?? 60),
      max_concurrent_sessions: Number(
        formData.get('max_concurrent_sessions') ?? 3,
      ),
    },
    login_settings: {
      max_failed_attempts: Number(formData.get('max_failed_attempts') ?? 5),
      lockout_duration_minutes: Number(
        formData.get('lockout_duration_minutes') ?? 15,
      ),
      mfa_required: formData.get('mfa_required') === 'on',
    },
  });
}
