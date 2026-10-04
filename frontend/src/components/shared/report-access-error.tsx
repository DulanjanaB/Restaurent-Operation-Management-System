import { EmptyState } from './empty-state';

// Explicit distinct state for ApiError(403) on a specific branch_id — per
// reports-architecture.md, a report page must never render a silent empty
// table when the requested branch is one the user has no role in.
export function ReportAccessError({ branchName }: { branchName?: string }) {
  return (
    <EmptyState
      title="You don't have access to this branch's data"
      description={
        branchName
          ? `You don't currently hold a role in ${branchName}. Choose a different branch or clear the branch filter.`
          : 'Choose a different branch or clear the branch filter.'
      }
    />
  );
}
