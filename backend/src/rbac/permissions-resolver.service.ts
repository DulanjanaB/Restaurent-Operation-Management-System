import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserRole } from '../users/user-role.entity';
import { UserPermission } from '../users/user-permission.entity';
import { PermissionEffect } from '../permissions/permission-effect.enum';

// Implements docs/rbac-design.md#permission-resolution:
//
//   effective_permissions(user, branch) =
//       ( permissions of roles where UserRole.branch_id = branch OR NULL )
//       ∪ { p : UserPermission(user, p, GRANT) }
//       −  { p : UserPermission(user, p, REVOKE) }
//
// Queried fresh per call rather than cached — correct first, add a cache
// (invalidated on role/permission change) only once this is a proven
// bottleneck.
@Injectable()
export class PermissionsResolverService {
  constructor(
    @InjectRepository(UserRole)
    private readonly userRolesRepository: Repository<UserRole>,
    @InjectRepository(UserPermission)
    private readonly userPermissionsRepository: Repository<UserPermission>,
  ) {}

  async getEffectivePermissions(
    userId: string,
    branchId: string | null,
  ): Promise<Set<string>> {
    const roleGrantedQuery = this.userRolesRepository
      .createQueryBuilder('user_role')
      .innerJoin('role_permissions', 'rp', 'rp.role_id = user_role.role_id')
      .innerJoin(
        'permissions',
        'permission',
        'permission.id = rp.permission_id',
      )
      .select('permission.key', 'key')
      .where('user_role.user_id = :userId', { userId })
      .andWhere(
        branchId
          ? '(user_role.branch_id = :branchId OR user_role.branch_id IS NULL)'
          : 'user_role.branch_id IS NULL',
        branchId ? { branchId } : {},
      );

    const overridesQuery = this.userPermissionsRepository
      .createQueryBuilder('user_permission')
      .innerJoin(
        'permissions',
        'permission',
        'permission.id = user_permission.permission_id',
      )
      .select('permission.key', 'key')
      .addSelect('user_permission.effect', 'effect')
      .where('user_permission.user_id = :userId', { userId });

    const [roleGranted, overrides] = await Promise.all([
      roleGrantedQuery.getRawMany<{ key: string }>(),
      overridesQuery.getRawMany<{ key: string; effect: PermissionEffect }>(),
    ]);

    const effective = new Set(roleGranted.map((row) => row.key));

    for (const override of overrides) {
      if (override.effect === PermissionEffect.GRANT) {
        effective.add(override.key);
      }
    }
    for (const override of overrides) {
      if (override.effect === PermissionEffect.REVOKE) {
        effective.delete(override.key);
      }
    }

    return effective;
  }

  async hasPermission(
    userId: string,
    branchId: string | null,
    permissionKey: string,
  ): Promise<boolean> {
    const effective = await this.getEffectivePermissions(userId, branchId);
    return effective.has(permissionKey);
  }

  // Union across every branch the user holds a role in (ignores branch
  // scoping entirely) — used only for the privilege-escalation checks in
  // docs/user-management-design.md ("assigning a role/permission the actor
  // doesn't themselves hold should be blocked"), never for deciding what a
  // request is allowed to do.
  async getEffectivePermissionsAnyBranch(userId: string): Promise<Set<string>> {
    const roleGranted = await this.userRolesRepository
      .createQueryBuilder('user_role')
      .innerJoin('role_permissions', 'rp', 'rp.role_id = user_role.role_id')
      .innerJoin(
        'permissions',
        'permission',
        'permission.id = rp.permission_id',
      )
      .select('permission.key', 'key')
      .where('user_role.user_id = :userId', { userId })
      .getRawMany<{ key: string }>();

    const overrides = await this.userPermissionsRepository
      .createQueryBuilder('user_permission')
      .innerJoin(
        'permissions',
        'permission',
        'permission.id = user_permission.permission_id',
      )
      .select('permission.key', 'key')
      .addSelect('user_permission.effect', 'effect')
      .where('user_permission.user_id = :userId', { userId })
      .getRawMany<{ key: string; effect: PermissionEffect }>();

    const effective = new Set(roleGranted.map((row) => row.key));
    for (const override of overrides) {
      if (override.effect === PermissionEffect.GRANT)
        effective.add(override.key);
    }
    for (const override of overrides) {
      if (override.effect === PermissionEffect.REVOKE)
        effective.delete(override.key);
    }
    return effective;
  }

  async hasSystemRole(userId: string): Promise<boolean> {
    const count = await this.userRolesRepository
      .createQueryBuilder('user_role')
      .innerJoin('roles', 'role', 'role.id = user_role.role_id')
      .where('user_role.user_id = :userId', { userId })
      .andWhere('role.is_system_role = true')
      .getCount();
    return count > 0;
  }

  // Every branch the user holds ANY role in — used by report endpoints to
  // enforce "you only see data for branches you have a role in." A NULL
  // branch_id row means an all-branches role, which grants access to
  // every branch. See docs/rbac-design.md#branch-scoping.
  async getAccessibleBranches(
    userId: string,
  ): Promise<{ allBranches: boolean; branchIds: string[] }> {
    const rows = await this.userRolesRepository.find({
      where: { user_id: userId },
    });
    const allBranches = rows.some((row) => row.branch_id === null);
    const branchIds = rows
      .map((row) => row.branch_id)
      .filter((id): id is string => id !== null);
    return { allBranches, branchIds };
  }
}
