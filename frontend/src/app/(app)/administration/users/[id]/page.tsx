import { notFound } from 'next/navigation';
import { Activity, IdCard, KeyRound, ShieldCheck } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getMe } from '@/lib/auth/dal';
import {
  getAuditLog,
  getBranches,
  getPermissions,
  getRoles,
  getUser,
  getUserPermissionOverrides,
  getUserRoles,
} from '@/lib/server/administration/queries';
import { hasPermission, isSelf } from '@/lib/permissions';
import { ApiError } from '@/lib/api/client';
import { AuditLogTable } from '@/components/shared/audit-log-table';
import { ProfileTab } from './profile-tab';
import { RolesTab } from './roles-tab';
import { PermissionsTab } from './permissions-tab';
import { UserHero } from './user-hero';

const TAB_CLASS =
  'gap-2 rounded-xl px-4 py-2 text-sm font-medium text-muted-foreground transition data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-600 data-[state=active]:to-fuchsia-600 data-[state=active]:text-white data-[state=active]:shadow-md';

export default async function UserDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const me = await getMe();

  let user;
  try {
    user = await getUser(id);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) notFound();
    throw error;
  }

  const [
    branches,
    roleAssignments,
    permissionOverrides,
    allRoles,
    allPermissions,
    activity,
  ] = await Promise.all([
    getBranches().catch(() => []),
    getUserRoles(id),
    getUserPermissionOverrides(id),
    getRoles().catch(() => []),
    getPermissions().catch(() => []),
    hasPermission(me, 'administration.user.view_activity')
      ? getAuditLog({ entityType: 'User', entityId: id })
      : Promise.resolve([]),
  ]);

  // Privilege-escalation guard, mirrored client-side: the acting user can
  // never manage their own roles/permissions from this screen, even if
  // they hold the permission — the backend enforces the same rule, this
  // just keeps the UI from offering a control that would 403 anyway. See
  // docs/user-management-design.md's privilege-escalation guard.
  const viewingSelf = isSelf(me, user.id);
  const canManageRoles =
    !viewingSelf && hasPermission(me, 'administration.user.assign_role');
  const canManagePermissions =
    !viewingSelf && hasPermission(me, 'administration.user.manage_permissions');
  // Mirrors the backend's own absolute guard in UsersService.remove() —
  // a System Owner (or any system-role holder) can never be deleted from
  // here, full stop, not just hidden for self-view.
  const isSystemOwner = roleAssignments.some(
    (assignment) => assignment.role.is_system_role,
  );

  const primaryBranch =
    branches.find((branch) => branch.id === user.primary_branch_id)?.name ??
    '—';
  const branchNames = [
    ...new Set(
      roleAssignments
        .filter((assignment) => assignment.branch)
        .map((assignment) => assignment.branch!.name),
    ),
  ];

  return (
    <div className="space-y-6">
      <UserHero
        name={user.name}
        email={user.email}
        active={user.status === 'active'}
        primaryBranch={primaryBranch}
        roleCount={roleAssignments.length}
        branchNames={branchNames}
        allBranches={roleAssignments.some(
          (assignment) => assignment.branch === null,
        )}
        overrideCount={permissionOverrides.length}
        isSystemOwner={isSystemOwner}
      />

      <Tabs defaultValue="profile" className="space-y-4">
        <TabsList className="h-auto w-full flex-wrap justify-start gap-1 rounded-2xl bg-card p-1.5 shadow-sm ring-1 ring-foreground/5">
          <TabsTrigger value="profile" className={TAB_CLASS}>
            <IdCard className="size-4" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="roles" className={TAB_CLASS}>
            <ShieldCheck className="size-4" />
            Roles
          </TabsTrigger>
          <TabsTrigger value="permissions" className={TAB_CLASS}>
            <KeyRound className="size-4" />
            Permissions
          </TabsTrigger>
          {hasPermission(me, 'administration.user.view_activity') && (
            <TabsTrigger value="activity" className={TAB_CLASS}>
              <Activity className="size-4" />
              Activity
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent
          value="profile"
          className="rounded-2xl bg-card p-6 shadow-sm ring-1 ring-foreground/5"
        >
          <ProfileTab
            user={user}
            branches={branches}
            canUpdate={hasPermission(me, 'administration.user.update')}
            canActivate={hasPermission(me, 'administration.user.activate')}
            canResetPassword={hasPermission(
              me,
              'administration.user.reset_password',
            )}
            canDelete={
              !viewingSelf &&
              !isSystemOwner &&
              hasPermission(me, 'administration.user.delete')
            }
          />
        </TabsContent>
        <TabsContent
          value="roles"
          className="rounded-2xl bg-card p-6 shadow-sm ring-1 ring-foreground/5"
        >
          {viewingSelf && (
            <p className="mb-3 text-sm text-muted-foreground">
              You can&apos;t manage your own roles, even with permission — ask
              another administrator.
            </p>
          )}
          <RolesTab
            userId={user.id}
            assignments={roleAssignments}
            allRoles={allRoles}
            branches={branches}
            canManage={canManageRoles}
          />
        </TabsContent>
        <TabsContent
          value="permissions"
          className="rounded-2xl bg-card p-6 shadow-sm ring-1 ring-foreground/5"
        >
          {viewingSelf && (
            <p className="mb-3 text-sm text-muted-foreground">
              You can&apos;t manage your own permission overrides, even with
              permission — ask another administrator.
            </p>
          )}
          <PermissionsTab
            userId={user.id}
            overrides={permissionOverrides}
            allPermissions={allPermissions}
            canManage={canManagePermissions}
          />
        </TabsContent>
        {hasPermission(me, 'administration.user.view_activity') && (
          <TabsContent
            value="activity"
            className="rounded-2xl bg-card p-6 shadow-sm ring-1 ring-foreground/5"
          >
            <AuditLogTable entries={activity} />
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}
