import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/shared/empty-state';
import { AssignRoleDialog } from './assign-role-dialog';
import { RemoveRoleButton } from './remove-role-button';
import type {
  Branch,
  Role,
  UserRoleAssignment,
} from '@/lib/server/administration/types';

export function RolesTab({
  userId,
  assignments,
  allRoles,
  branches,
  canManage,
}: {
  userId: string;
  assignments: UserRoleAssignment[];
  allRoles: Role[];
  branches: Branch[];
  canManage: boolean;
}) {
  // Derived purely from the role assignments already on hand — no extra
  // fetch. A role scoped to a specific branch is what grants access to
  // that branch; a global (branch: null) role grants every branch, so it
  // supersedes listing individual ones. This is the same mechanism the
  // Branch Switcher's accessible-branches list is built from — an
  // employee already gets multi-branch access simply by holding a role
  // (the same role, or different roles) scoped to more than one branch.
  const hasGlobalRole = assignments.some(
    (assignment) => assignment.branch === null,
  );
  const branchNames = [
    ...new Set(
      assignments
        .filter((assignment) => assignment.branch)
        .map((assignment) => assignment.branch!.name),
    ),
  ];

  return (
    <div className="max-w-2xl space-y-4">
      {assignments.length > 0 && (
        <div>
          <p className="mb-1.5 text-sm font-medium text-muted-foreground">
            Branch access
          </p>
          <div className="flex flex-wrap gap-1.5">
            {hasGlobalRole ? (
              <Badge>All branches</Badge>
            ) : (
              branchNames.map((name) => <Badge key={name}>{name}</Badge>)
            )}
          </div>
          <p className="mt-1.5 text-xs text-muted-foreground">
            Granted by the roles below — assign the same or different roles
            across more than one branch to give this employee access to each of
            them.
          </p>
        </div>
      )}
      {canManage && (
        <div className="flex justify-end">
          <AssignRoleDialog
            userId={userId}
            roles={allRoles}
            branches={branches}
          />
        </div>
      )}
      {assignments.length === 0 ? (
        <EmptyState title="No roles assigned" />
      ) : (
        <ul className="divide-y rounded-md border">
          {assignments.map((assignment) => (
            <li
              key={assignment.id}
              className="flex items-center justify-between px-4 py-3"
            >
              <div>
                <p className="font-medium">{assignment.role.name}</p>
                <p className="text-sm text-muted-foreground">
                  {assignment.branch ? assignment.branch.name : 'All branches'}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {assignment.role.is_system_role && (
                  <Badge variant="secondary">System</Badge>
                )}
                {canManage && (
                  <RemoveRoleButton
                    userId={userId}
                    userRoleId={assignment.id}
                  />
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
