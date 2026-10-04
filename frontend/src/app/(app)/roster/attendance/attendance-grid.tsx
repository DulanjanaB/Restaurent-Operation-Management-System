'use client';

import { useOptimistic, useTransition } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { ConfirmDialog } from '@/components/shared/confirm-dialog';
import {
  deleteAttendance,
  setAttendanceStatus,
} from '@/lib/server/roster/actions';
import type {
  Attendance,
  AttendanceStatus,
  Employee,
} from '@/lib/server/roster/types';

const STATUS_OPTIONS: { value: AttendanceStatus; label: string }[] = [
  { value: 'present', label: 'Present' },
  { value: 'late', label: 'Late' },
  { value: 'half_day', label: 'Half day' },
  { value: 'absent', label: 'Absent' },
];

interface Row {
  employee: Employee;
  attendance?: Attendance;
}

// Frequent, low-friction by design (per the plan) — a single Select per
// row with useOptimistic for instant feedback, no full-page form/reload.
export function AttendanceGrid({
  rows,
  date,
  canMark,
  canDelete,
}: {
  rows: Row[];
  date: string;
  canMark: boolean;
  canDelete: boolean;
}) {
  type Update =
    | { type: 'set'; employeeId: string; status: AttendanceStatus }
    | { type: 'clear'; employeeId: string };

  const [optimisticRows, dispatchOptimistic] = useOptimistic(
    rows,
    (state, update: Update) =>
      state.map((row) => {
        if (row.employee.id !== update.employeeId) return row;
        if (update.type === 'clear') return { ...row, attendance: undefined };
        return {
          ...row,
          attendance: row.attendance
            ? { ...row.attendance, status: update.status }
            : ({
                id: '',
                employee_id: update.employeeId,
                shift_assignment_id: null,
                date,
                clock_in: null,
                clock_out: null,
                status: update.status,
              } as Attendance),
        };
      }),
  );
  const [, startTransition] = useTransition();

  function handleChange(row: Row, status: AttendanceStatus) {
    startTransition(async () => {
      dispatchOptimistic({ type: 'set', employeeId: row.employee.id, status });
      const result = await setAttendanceStatus(
        row.employee.id,
        date,
        row.attendance?.id ?? null,
        status,
      );
      if (result?.error) toast.error(result.error);
    });
  }

  function handleClear(row: Row) {
    if (!row.attendance?.id) return;
    const attendanceId = row.attendance.id;
    startTransition(async () => {
      dispatchOptimistic({ type: 'clear', employeeId: row.employee.id });
      const result = await deleteAttendance(attendanceId);
      if (result?.error) toast.error(result.error);
    });
  }

  return (
    <div className="rounded-md border divide-y">
      {optimisticRows.map((row) => (
        <div
          key={row.employee.id}
          className="flex items-center justify-between px-4 py-2.5"
        >
          <div>
            <p className="font-medium">{row.employee.name}</p>
            <p className="text-sm text-muted-foreground">
              {row.employee.position?.name ?? row.employee.employee_code}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Select
              value={row.attendance?.status ?? undefined}
              onValueChange={(value) =>
                handleChange(row, value as AttendanceStatus)
              }
              disabled={!canMark}
            >
              <SelectTrigger className="w-36">
                <SelectValue placeholder="Not marked" />
              </SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {canDelete && row.attendance?.id && (
              <ConfirmDialog
                trigger={
                  <Button size="sm" variant="ghost">
                    Clear
                  </Button>
                }
                title={`Clear ${row.employee.name}'s attendance for ${date}?`}
                description="Removes the mark entirely, back to “Not marked” — use this to fix a mistaken entry."
                variant="destructive"
                confirmLabel="Clear"
                onConfirm={() => {
                  handleClear(row);
                  return Promise.resolve();
                }}
              />
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
