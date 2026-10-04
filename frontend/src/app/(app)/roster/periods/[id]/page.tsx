import { notFound } from 'next/navigation';
import { getMe } from '@/lib/auth/dal';
import {
  getDepartments,
  getEmployees,
  getPositions,
  getRosterPeriod,
  getShiftAssignments,
  getShiftTemplates,
  getShifts,
} from '@/lib/server/roster/queries';
import { hasPermission } from '@/lib/permissions';
import { ApiError } from '@/lib/api/client';
import { StatusStepper } from '@/components/shared/status-stepper';
import { AddShiftDialog } from './add-shift-dialog';
import { PublishButton } from './publish-button';
import { ShiftsBuilder } from './shifts-builder';
import type { ShiftAssignment } from '@/lib/server/roster/types';
import { PageHeader } from '@/components/shared/page-header';

const STEPS = [
  { key: 'draft', label: 'Draft' },
  { key: 'published', label: 'Published' },
];

export default async function RosterPeriodDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const me = await getMe();

  let period;
  try {
    period = await getRosterPeriod(id);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) notFound();
    throw error;
  }

  const [shifts, employees, positions, shiftTemplates, departments] =
    await Promise.all([
      getShifts(id),
      getEmployees(period.branch_id),
      getPositions(),
      getShiftTemplates(period.branch_id),
      getDepartments(period.branch_id),
    ]);

  const assignmentsList = await Promise.all(
    shifts.map((shift) => getShiftAssignments(shift.id)),
  );
  const assignmentsByShift: Record<string, ShiftAssignment[]> = {};
  shifts.forEach((shift, index) => {
    assignmentsByShift[shift.id] = assignmentsList[index];
  });

  const canManage =
    hasPermission(me, 'roster.update') || hasPermission(me, 'roster.create');
  const canPublish =
    hasPermission(me, 'roster.publish') && period.status === 'draft';

  return (
    <div className="space-y-6">
      <PageHeader
        tone="teal"
        title={
          <>
            {period.start_date} → {period.end_date}
          </>
        }
        description={<>{period.period_type} roster</>}
        action={
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-3">
              <StatusStepper steps={STEPS} current={period.status} />
              {canPublish && <PublishButton periodId={period.id} />}
            </div>
          </div>
        }
      />

      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-muted-foreground">Shifts</h2>
        {canManage && (
          <AddShiftDialog
            rosterPeriodId={id}
            shiftTemplates={shiftTemplates}
            departments={departments}
          />
        )}
      </div>
      <ShiftsBuilder
        rosterPeriodId={id}
        shifts={shifts}
        assignmentsByShift={assignmentsByShift}
        employees={employees}
        positions={positions}
        departments={departments}
        canManage={canManage}
      />
    </div>
  );
}
