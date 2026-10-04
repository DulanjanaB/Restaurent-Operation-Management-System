'use client';

import { Fragment, useState } from 'react';
import { ChevronRight } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { DiffViewer } from './diff-viewer';
import { EmptyState } from './empty-state';
import type { AuditLogEntry } from '@/lib/server/administration/types';

// Reused on the Audit Log page and as User Detail's Activity tab.
export function AuditLogTable({ entries }: { entries: AuditLogEntry[] }) {
  const [expanded, setExpanded] = useState<string | null>(null);

  if (entries.length === 0) {
    return (
      <EmptyState
        title="No matching activity"
        description="Try widening the date range or clearing filters."
      />
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-8" />
            <TableHead>When</TableHead>
            <TableHead>Actor</TableHead>
            <TableHead>Action</TableHead>
            <TableHead>Entity</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {entries.map((entry) => {
            const isOpen = expanded === entry.id;
            const hasChanges =
              entry.changes && Object.keys(entry.changes).length > 0;
            return (
              <Fragment key={entry.id}>
                <TableRow
                  className={hasChanges ? 'cursor-pointer' : undefined}
                  onClick={() =>
                    hasChanges && setExpanded(isOpen ? null : entry.id)
                  }
                >
                  <TableCell>
                    {hasChanges && (
                      <ChevronRight
                        className={`size-4 text-muted-foreground transition-transform ${isOpen ? 'rotate-90' : ''}`}
                      />
                    )}
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-sm text-muted-foreground">
                    {new Date(entry.created_at).toLocaleString()}
                  </TableCell>
                  <TableCell>{entry.actor_name ?? 'System'}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{entry.action}</Badge>
                  </TableCell>
                  <TableCell>
                    {entry.entity_type}
                    {entry.entity_label && (
                      <span className="text-muted-foreground">
                        {' '}
                        · {entry.entity_label}
                      </span>
                    )}
                  </TableCell>
                </TableRow>
                {isOpen && hasChanges && (
                  <TableRow>
                    <TableCell colSpan={5} className="bg-muted/30">
                      <DiffViewer changes={entry.changes} />
                    </TableCell>
                  </TableRow>
                )}
              </Fragment>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
