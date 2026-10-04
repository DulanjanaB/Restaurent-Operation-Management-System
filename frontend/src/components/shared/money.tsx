'use client';

import { useFormatting } from '@/context/formatting-context';
import { formatCurrency } from '@/lib/format';

// Every monetary value in the app goes through here so the currency symbol
// and number format come from Settings → System, not from each screen.
export function Money({
  value,
  className,
}: {
  value: number | string | null | undefined;
  className?: string;
}) {
  const settings = useFormatting();
  if (value === null || value === undefined || value === '') {
    return <span className={className}>—</span>;
  }
  return <span className={className}>{formatCurrency(value, settings)}</span>;
}
