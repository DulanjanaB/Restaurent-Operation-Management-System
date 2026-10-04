import { notFound } from 'next/navigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getMe } from '@/lib/auth/dal';
import {
  getDepartments,
  getDocumentTypes,
  getEmployee,
  getEmployeeDocuments,
  getMyEmployee,
  getPositions,
} from '@/lib/server/roster/queries';
import { hasPermission, isSelf } from '@/lib/permissions';
import { ApiError } from '@/lib/api/client';
import { ProfileTab } from './profile-tab';
import { DocumentsTab } from './documents-tab';
import { CreateLoginDialog } from './create-login-dialog';
import { Badge } from '@/components/ui/badge';
import type { Department, Employee, Position } from '@/lib/server/roster/types';
import { PageHeader } from '@/components/shared/page-header';

export default async function EmployeeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const me = await getMe();
  // GET /roster/employees/:id (and Positions/Departments' own GETs) all
  // require roster.view — an employee with zero roster permissions viewing
  // their OWN record (the whole point of the Documents self-service
  // exception) can't go through that path at all. Fall back to
  // GET /roster/employees/me (auth-only) when the viewer lacks roster.view.
  const canViewRoster = hasPermission(me, 'roster.view');

  let employee: Employee;
  if (canViewRoster) {
    try {
      employee = await getEmployee(id);
    } catch (error) {
      if (error instanceof ApiError && error.status === 404) notFound();
      throw error;
    }
  } else {
    const mine = await getMyEmployee();
    if (!mine || mine.id !== id) notFound();
    employee = mine;
  }

  const viewingOwnRecord = isSelf(me, employee.user_id);
  const canViewDocuments =
    viewingOwnRecord || hasPermission(me, 'roster.view_documents');
  const canManageDocuments =
    viewingOwnRecord || hasPermission(me, 'roster.manage_documents');

  let positions: Position[] = [];
  let departments: Department[] = [];
  if (canViewRoster) {
    [positions, departments] = await Promise.all([
      getPositions(),
      getDepartments(employee.branch_id),
    ]);
  }

  const [documentTypes, documents] = await Promise.all([
    getDocumentTypes(),
    canViewDocuments ? getEmployeeDocuments(id) : Promise.resolve([]),
  ]);

  const canCreateLogin = hasPermission(me, 'administration.user.create');

  return (
    <div className="space-y-6">
      <PageHeader
        tone="teal"
        title={<>{employee.name}</>}
        description={<>{employee.employee_code}</>}
        action={
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-2">
              {employee.user_id ? (
                <Badge variant="secondary">Has login</Badge>
              ) : (
                <>
                  <Badge variant="outline" className="text-muted-foreground">
                    No login
                  </Badge>
                  {canCreateLogin && (
                    <CreateLoginDialog
                      employeeId={employee.id}
                      employeeName={employee.name}
                      employeeCode={employee.employee_code}
                      employeeEmail={employee.email}
                    />
                  )}
                </>
              )}
            </div>
          </div>
        }
      />

      <Tabs defaultValue={canViewRoster ? 'profile' : 'documents'}>
        <TabsList>
          {canViewRoster && <TabsTrigger value="profile">Profile</TabsTrigger>}
          {canViewDocuments && (
            <TabsTrigger value="documents">Documents</TabsTrigger>
          )}
        </TabsList>
        {canViewRoster && (
          <TabsContent value="profile" className="pt-4">
            <ProfileTab
              employee={employee}
              positions={positions}
              departments={departments}
              canUpdate={hasPermission(me, 'roster.update')}
            />
          </TabsContent>
        )}
        {canViewDocuments && (
          <TabsContent value="documents" className="pt-4">
            <DocumentsTab
              employeeId={id}
              documents={documents}
              documentTypes={documentTypes}
              canManage={canManageDocuments}
            />
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}
