export interface FormattingSettings {
  locale: string;
  currency: string;
  timezone: string;
}

// Placeholder defaults until Phase 2 (Settings) wires this to the real
// System category settings (timezone/currency/date_format/number_format).
export const DEFAULT_FORMATTING: FormattingSettings = {
  locale: 'en-US',
  currency: 'USD',
  timezone: 'UTC',
};

export function formatCurrency(
  amount: number | string,
  settings: FormattingSettings = DEFAULT_FORMATTING,
): string {
  const value = typeof amount === 'string' ? Number(amount) : amount;
  try {
    return new Intl.NumberFormat(settings.locale, {
      style: 'currency',
      currency: settings.currency,
    }).format(value);
  } catch {
    return `${settings.currency} ${value.toFixed(2)}`;
  }
}

export function formatDate(
  date: string | Date,
  settings: FormattingSettings = DEFAULT_FORMATTING,
): string {
  return new Intl.DateTimeFormat(settings.locale, {
    dateStyle: 'medium',
    timeZone: settings.timezone,
  }).format(new Date(date));
}

export function formatDateTime(
  date: string | Date,
  settings: FormattingSettings = DEFAULT_FORMATTING,
): string {
  return new Intl.DateTimeFormat(settings.locale, {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: settings.timezone,
  }).format(new Date(date));
}
