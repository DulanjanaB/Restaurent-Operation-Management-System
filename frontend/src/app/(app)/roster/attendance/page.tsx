import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { getMe } from '@/lib/auth/dal';
import { getAttendance, getEmployees } from '@/lib/server/roster/queries';
import { hasPermission } from '@/lib/permissions';
import { AttendanceGrid } from './attendance-grid';
import { PageHeader } from '@/components/shared/page-header';

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

export default async function AttendancePage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>;
}) {
  const [me, params] = await Promise.all([getMe(), searchParams]);
  const branchId = me!.current_branch_id;
  const date = params.date ?? today();

  const [employees, attendanceRows] = await Promise.all([
    getEmployees(branchId),
    getAttendance({ date }),
  ]);

  const attendanceByEmployee = new Map(
    attendanceRows.map((row) => [row.employee_id, row]),
  );
  const rows = employees.map((employee) => ({
    employee,
    attendance: attendanceByEmployee.get(employee.id),
  }));

  return (
    <div className="space-y-4">
      <PageHeader
        tone="teal"
        title={<>Attendance</>}
        description={<>Mark attendance for a given day.</>}
      />
      <form method="get" className="flex items-end gap-3">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="date">Date</Label>
          <Input id="date" type="date" name="date" defaultValue={date} />
        </div>
        <Button type="submit">Go</Button>
      </form>
      <AttendanceGrid
        rows={rows}
        date={date}
        canMark={hasPermission(me, 'roster.mark_attendance')}
        canDelete={hasPermission(me, 'roster.delete')}
      />
    </div>
  );
}
