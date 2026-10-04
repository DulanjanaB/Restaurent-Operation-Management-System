import type { ItemRequestLine } from '@/lib/server/inventory/types';

export function summarizeLines(lines: ItemRequestLine[]): string {
  return lines
    .map((line) => `${line.item?.name ?? line.item_id} × ${line.quantity}`)
    .join(', ');
}
