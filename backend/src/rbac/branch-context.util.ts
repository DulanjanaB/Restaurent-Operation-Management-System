import { User } from '../users/user.entity';

// A request's branch comes from the X-Branch-Id header (e.g. a branch
// switcher in the UI); falling back to the user's primary branch when it's
// absent. See docs/rbac-design.md#branch-scoping.
export function resolveBranchId(request: any, user: User): string | null {
  const headerBranchId = request.headers['x-branch-id'];
  if (typeof headerBranchId === 'string' && headerBranchId.length > 0) {
    return headerBranchId;
  }
  return user.primary_branch_id ?? null;
}
