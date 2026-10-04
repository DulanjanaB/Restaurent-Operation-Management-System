import { getChecklistRecords } from '@/lib/server/checklist/queries';
import { getEmployees } from '@/lib/server/roster/queries';
import { getMe } from '@/lib/auth/dal';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { RecordsTable } from './records-table';
import type { ChecklistRecordStatus } from '@/lib/server/checklist/types';
import { PageHeader } from '@/components/shared/page-header';

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

export default async function ChecklistRecordsPage({
  searchParams,
}: {
  searchParams: Promise<{
    employee_id?: string;
    status?: string;
    date?: string;
  }>;
}) {
  const [me, params] = await Promise.all([getMe(), searchParams]);
  const date = params.date || today();
  const employeeId =
    params.employee_id && params.employee_id !== 'all'
      ? params.employee_id
      : undefined;
  const status =
    params.status && params.status !== 'all'
      ? (params.status as ChecklistRecordStatus)
      : undefined;

  const [records, employees] = await Promise.all([
    getChecklistRecords({ employeeId, status, date }),
    getEmployees(me!.current_branch_id),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        tone="emerald"
        title={<>Checklist Records</>}
        description={
          <>
            Both completed and still-pending records — gaps are visible, not
            hidden.
          </>
        }
      />

      <form method="get" className="flex flex-wrap items-end gap-3">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="date">Date</Label>
          <Input
            id="date"
            name="date"
            type="date"
            defaultValue={date}
            className="w-40"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="employee_id">Employee</Label>
          <Select name="employee_id" defaultValue={params.employee_id ?? 'all'}>
            <SelectTrigger id="employee_id" className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All employees</SelectItem>
              {employees.map((employee) => (
                <SelectItem key={employee.id} value={employee.id}>
                  {employee.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="status">Status</Label>
          <Select name="status" defaultValue={params.status ?? 'all'}>
            <SelectTrigger id="status" className="w-36">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button type="submit" variant="outline">
          Apply
        </Button>
      </form>

      <RecordsTable records={records} />
    </div>
  );
}
