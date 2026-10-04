'use client';

import { useMemo } from 'react';
import type { ColumnDef } from '@tanstack/react-table';
import { ApprovalQueue } from '@/components/shared/approval-queue';
import { decideLeaveRequest } from '@/lib/server/roster/actions';
import type { Leave } from '@/lib/server/roster/types';

interface Row extends Leave {
  employeeName: string;
}

// getId/isPending/onApprove/onReject are plain closures (not bare Server
// Action references), so — same RSC-boundary rule as the Administration
// list tables — they have to be built here, inside the Client Component
// that renders <ApprovalQueue>, not passed in as props from the Server
// Component page.
export function LeaveApprovalQueue({
  rows,
  canDecide,
}: {
  rows: Row[];
  canDecide: boolean;
}) {
  const columns = useMemo<ColumnDef<Row, unknown>[]>(
    () => [
      { accessorKey: 'employeeName', header: 'Employee' },
      { accessorKey: 'leave_type', header: 'Type' },
      { accessorKey: 'start_date', header: 'From' },
      { accessorKey: 'end_date', header: 'To' },
      { accessorKey: 'reason', header: 'Reason' },
    ],
    [],
  );

  return (
    <ApprovalQueue
      items={rows}
      columns={columns}
      getId={(row) => row.id}
      isPending={(row) => row.status === 'pending'}
      canDecide={canDecide}
      onApprove={(id) => decideLeaveRequest(id, 'approve')}
      onReject={(id) => decideLeaveRequest(id, 'reject')}
    />
  );
}
