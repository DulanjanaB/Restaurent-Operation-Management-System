import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { EmployeesService } from '../roster/employees.service';
import { PermissionsResolverService } from '../rbac/permissions-resolver.service';
import { resolveBranchId } from '../rbac/branch-context.util';
import { User } from '../users/user.entity';

// Self-service exception: an employee always sees their own tip balance,
// no permission needed — same pattern as EmployeeDocument access in the
// Roster module. Everyone else needs tip.view. See
// docs/tip-sharing-design.md#viewing--individually-by-each-person-from-their-account.
@Injectable()
export class TipEmployeeAccessService {
  constructor(
    private readonly employeesService: EmployeesService,
    private readonly permissionsResolver: PermissionsResolverService,
  ) {}

  async resolveOwnEmployeeId(actor: User): Promise<string> {
    const employee = await this.employeesService.findByUserId(actor.id);
    if (!employee) {
      throw new NotFoundException(
        'No employee record is linked to your account',
      );
    }
    return employee.id;
  }

  async assertCanAccess(
    employeeId: string,
    actor: User,
    request: any,
  ): Promise<void> {
    const ownEmployee = await this.employeesService.findByUserId(actor.id);
    if (ownEmployee && ownEmployee.id === employeeId) {
      return;
    }

    const branchId = resolveBranchId(request, actor);
    const allowed = await this.permissionsResolver.hasPermission(
      actor.id,
      branchId,
      'tip.view',
    );
    if (!allowed) {
      throw new ForbiddenException('Missing required permission: tip.view');
    }
  }
}
