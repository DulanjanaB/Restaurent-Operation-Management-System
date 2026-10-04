import 'server-only';
import { apiFetch } from '@/lib/api/client';

export function getReportRows(
  module: string,
  reportKey: string,
  searchParams: Record<string, string | undefined>,
): Promise<Record<string, unknown>[]> {
  const params = new URLSearchParams(
    Object.entries(searchParams).filter(
      (entry): entry is [string, string] =>
        entry[1] !== undefined &&
        entry[0] !== 'format' &&
        // ReportFilterBar's "All accessible branches" option submits
        // branch_id=all — the backend's contract is "omit branch_id
        // entirely" for that, not a literal value, otherwise it's treated
        // as a real (nonexistent) branch UUID.
        !(entry[0] === 'branch_id' && entry[1] === 'all'),
    ),
  );
  const query = params.toString();
  return apiFetch<Record<string, unknown>[]>(
    `/reports/${module}/${reportKey}${query ? `?${query}` : ''}`,
  );
}
