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
import { EmptyState } from '@/components/shared/empty-state';
import { DeleteButton } from '@/components/shared/delete-button';
import { AssignEmployeeDialog } from './assign-employee-dialog';
import { EditShiftDialog } from './edit-shift-dialog';
import {
  deleteShift,
  removeShiftAssignment,
  updateShiftAssignmentPosition,
  updateShiftAssignmentStatus,
} from '@/lib/server/roster/actions';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import type {
  Department,
  Employee,
  Position,
  Shift,
  ShiftAssignment,
  ShiftAssignmentStatus,
} from '@/lib/server/roster/types';

const ASSIGNMENT_STATUSES: ShiftAssignmentStatus[] = [
  'assigned',
  'confirmed',
  'no_show',
  'completed',
];

export function ShiftsBuilder({
  rosterPeriodId,
  shifts,
  assignmentsByShift,
  employees,
  positions,
  departments,
  canManage,
}: {
  rosterPeriodId: string;
  shifts: Shift[];
  assignmentsByShift: Record<string, ShiftAssignment[]>;
  employees: Employee[];
  positions: Position[];
  departments: Department[];
  canManage: boolean;
}) {
  const [expanded, setExpanded] = useState<string | null>(null);

  if (shifts.length === 0) {
    return <EmptyState title="No shifts added yet" />;
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-8" />
            <TableHead>Date</TableHead>
            <TableHead>Time</TableHead>
            <TableHead>Department</TableHead>
            <TableHead>Assigned</TableHead>
            <TableHead />
          </TableRow>
        </TableHeader>
        <TableBody>
          {shifts.map((shift) => {
            const isOpen = expanded === shift.id;
            const assignments = assignmentsByShift[shift.id] ?? [];
            return (
              <Fragment key={shift.id}>
                <TableRow
                  className="cursor-pointer"
                  onClick={() => setExpanded(isOpen ? null : shift.id)}
                >
                  <TableCell>
                    <ChevronRight
                      className={`size-4 text-muted-foreground transition-transform ${isOpen ? 'rotate-90' : ''}`}
                    />
                  </TableCell>
                  <TableCell>{shift.date}</TableCell>
                  <TableCell>
                    {shift.start_time.slice(0, 5)}–{shift.end_time.slice(0, 5)}
                  </TableCell>
                  <TableCell>{shift.department?.name ?? '—'}</TableCell>
                  <TableCell>{assignments.length}</TableCell>
                  <TableCell
                    onClick={(event) => event.stopPropagation()}
                    className="flex justify-end gap-1"
                  >
                    {canManage && (
                      <>
                        <EditShiftDialog
                          rosterPeriodId={rosterPeriodId}
                          shift={shift}
                          departments={departments}
                        />
                        <DeleteButton
                          itemLabel="this shift"
                          onDelete={() => deleteShift(rosterPeriodId, shift.id)}
                        />
                      </>
                    )}
                  </TableCell>
                </TableRow>
                {isOpen && (
                  <TableRow>
                    <TableCell colSpan={6} className="bg-muted/30">
                      <div className="space-y-3 p-2">
                        {canManage && (
                          <AssignEmployeeDialog
                            rosterPeriodId={rosterPeriodId}
                            shiftId={shift.id}
                            employees={employees}
                            positions={positions}
                          />
                        )}
                        {assignments.length === 0 ? (
                          <p className="text-sm text-muted-foreground">
                            No one assigned to this shift yet.
                          </p>
                        ) : (
                          <ul className="divide-y rounded-md border bg-background">
                            {assignments.map((assignment) => (
                              <li
                                key={assignment.id}
                                className="flex items-center justify-between px-3 py-2"
                              >
                                <div>
                                  <p className="font-medium">
                                    {assignment.employee?.name ?? 'Unknown'}
                                  </p>
                                </div>
                                <div className="flex items-center gap-2">
                                  {canManage ? (
                                    <Select
                                      value={assignment.position_id}
                                      onValueChange={async (value) => {
                                        const result =
                                          await updateShiftAssignmentPosition(
                                            rosterPeriodId,
                                            assignment.id,
                                            value,
                                          );
                                        if (result?.error)
                                          toast.error(result.error);
                                      }}
                                    >
                                      <SelectTrigger size="sm" className="w-36">
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        {positions.map((position) => (
                                          <SelectItem
                                            key={position.id}
                                            value={position.id}
                                          >
                                            {position.name}
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                  ) : (
                                    <span className="text-sm text-muted-foreground">
                                      {assignment.position?.name}
                                    </span>
                                  )}
                                  {canManage ? (
                                    <Select
                                      value={assignment.status}
                                      onValueChange={async (value) => {
                                        const result =
                                          await updateShiftAssignmentStatus(
                                            rosterPeriodId,
                                            assignment.id,
                                            value as ShiftAssignmentStatus,
                                          );
                                        if (result?.error)
                                          toast.error(result.error);
                                      }}
                                    >
                                      <SelectTrigger size="sm" className="w-32">
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        {ASSIGNMENT_STATUSES.map((status) => (
                                          <SelectItem
                                            key={status}
                                            value={status}
                                          >
                                            {status}
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                  ) : (
                                    <span className="text-sm">
                                      {assignment.status}
                                    </span>
                                  )}
                                  {canManage && (
                                    <DeleteButton
                                      itemLabel="this assignment"
                                      onDelete={() =>
                                        removeShiftAssignment(
                                          rosterPeriodId,
                                          assignment.id,
                                        )
                                      }
                                    />
                                  )}
                                </div>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
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
