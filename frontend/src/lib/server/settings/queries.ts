import 'server-only';
import { apiFetch } from '@/lib/api/client';
import type { SettingRow } from './types';

export function getSettingsByCategory(category: string): Promise<SettingRow[]> {
  return apiFetch<SettingRow[]>(
    `/settings?category=${encodeURIComponent(category)}`,
  );
}

export function getBrand(): Promise<{
  business_name: string | null;
  logo_url: string | null;
  currency: string | null;
  number_format: string | null;
  timezone: string | null;
}> {
  return apiFetch('/branding');
}
