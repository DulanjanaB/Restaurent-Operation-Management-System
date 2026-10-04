export interface SettingRow {
  id: string;
  category: string;
  key: string;
  value: unknown;
  updated_by: string;
  updated_at: string;
}

export interface PasswordPolicy {
  min_length: number;
  require_uppercase: boolean;
  require_number: boolean;
  require_symbol: boolean;
  expiry_days: number;
}

export interface SessionSettings {
  timeout_minutes: number;
  max_concurrent_sessions: number;
}

export interface LoginSettings {
  max_failed_attempts: number;
  lockout_duration_minutes: number;
  mfa_required: boolean;
}

// Convenience lookup built from a category's SettingRow[] — every field is
// its own row (category + key), not one combined object per category. See
// backend/src/settings/settings.service.ts.
export function toSettingsMap(rows: SettingRow[]): Record<string, unknown> {
  return Object.fromEntries(rows.map((row) => [row.key, row.value]));
}
