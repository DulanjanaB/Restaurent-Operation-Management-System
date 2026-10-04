import { ForbiddenException, Injectable } from '@nestjs/common';
import { PermissionsResolverService } from '../rbac/permissions-resolver.service';

// Not optional filtering — access control layered on top of the report
// filter. See docs/reports-architecture.md#filter-framework.
@Injectable()
export class BranchAccessService {
  constructor(
    private readonly permissionsResolver: PermissionsResolverService,
  ) {}

  // Returns:
  //   null            -> no restriction, caller sees every branch
  //   string[]         -> restrict the query to only these branch ids
  //     (a single validated branch when one was explicitly requested, or
  //     the user's full accessible set when none was requested and they
  //     don't hold an all-branches role)
  // Throws 403 if a specific branch was requested that the user has no
  // role in — never silently dropped, so a filter mistake doesn't look
  // like "no branches selected."
  async resolveBranchFilter(
    userId: string,
    requestedBranchId?: string,
  ): Promise<string[] | null> {
    const access = await this.permissionsResolver.getAccessibleBranches(userId);

    if (requestedBranchId) {
      if (
        !access.allBranches &&
        !access.branchIds.includes(requestedBranchId)
      ) {
        throw new ForbiddenException('You do not have access to this branch');
      }
      return [requestedBranchId];
    }

    if (access.allBranches) {
      return null;
    }
    return access.branchIds;
  }
}
