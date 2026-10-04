'use client';

import { useTransition } from 'react';
import { ArrowDown, ArrowUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DeleteButton } from '@/components/shared/delete-button';
import { EmptyState } from '@/components/shared/empty-state';
import { EditItemDialog } from './edit-item-dialog';
import {
  removeChecklistItem,
  updateChecklistItem,
} from '@/lib/server/checklist/actions';
import type { ChecklistItem } from '@/lib/server/checklist/types';

export function ItemsList({
  templateId,
  items,
  canManage,
}: {
  templateId: string;
  items: ChecklistItem[];
  canManage: boolean;
}) {
  const [isPending, startTransition] = useTransition();
  const sorted = [...items].sort((a, b) => a.sequence - b.sequence);

  function swap(a: ChecklistItem, b: ChecklistItem) {
    startTransition(async () => {
      await Promise.all([
        updateChecklistItem(templateId, a.id, { sequence: b.sequence }),
        updateChecklistItem(templateId, b.id, { sequence: a.sequence }),
      ]);
    });
  }

  if (sorted.length === 0) {
    return <EmptyState title="No items on this template yet" />;
  }

  return (
    <ul className="divide-y rounded-md border">
      {sorted.map((item, index) => (
        <li key={item.id} className="flex items-center gap-3 px-4 py-3">
          <span className="w-5 text-sm text-muted-foreground">
            {index + 1}.
          </span>
          <span className="flex-1">{item.label}</span>
          {item.requires_reason_on_no && (
            <Badge variant="outline" className="text-xs">
              Reason required on No
            </Badge>
          )}
          {canManage && (
            <div className="flex items-center gap-1">
              <Button
                size="icon-sm"
                variant="ghost"
                disabled={index === 0 || isPending}
                onClick={() => swap(item, sorted[index - 1])}
              >
                <ArrowUp className="size-4" />
              </Button>
              <Button
                size="icon-sm"
                variant="ghost"
                disabled={index === sorted.length - 1 || isPending}
                onClick={() => swap(item, sorted[index + 1])}
              >
                <ArrowDown className="size-4" />
              </Button>
              <EditItemDialog templateId={templateId} item={item} />
              <DeleteButton
                itemLabel={item.label}
                onDelete={() => removeChecklistItem(templateId, item.id)}
              />
            </div>
          )}
        </li>
      ))}
    </ul>
  );
}
