import {
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Reflector } from '@nestjs/core';
import { PERMISSIONS_KEY } from './require-permissions.decorator';
import { PermissionsResolverService } from './permissions-resolver.service';
import { resolveBranchId } from './branch-context.util';
import { User } from '../users/user.entity';

// Authenticates via the "jwt" passport strategy (registered in AuthModule),
// then — if the route declares @RequirePermissions(...) — resolves the
// caller's effective permissions for the request's branch context and
// checks every required key is present. See docs/rbac-design.md.
@Injectable()
export class PermissionsGuard extends AuthGuard('jwt') {
  constructor(
    private readonly reflector: Reflector,
    private readonly permissionsResolver: PermissionsResolverService,
  ) {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const authenticated = await super.canActivate(context);
    if (!authenticated) {
      return false;
    }

    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user as User;
    const branchId = resolveBranchId(request, user);

    const effectivePermissions =
      await this.permissionsResolver.getEffectivePermissions(user.id, branchId);
    const hasAll = requiredPermissions.every((permission) =>
      effectivePermissions.has(permission),
    );

    if (!hasAll) {
      throw new ForbiddenException('Missing required permission(s)');
    }

    return true;
  }
}
