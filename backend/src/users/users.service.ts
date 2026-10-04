import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, QueryFailedError, Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { randomBytes } from 'crypto';
import { User } from './user.entity';
import { UserRole } from './user-role.entity';
import { UserPermission } from './user-permission.entity';
import { Permission } from '../permissions/permission.entity';
import { Role } from '../roles/role.entity';
import { ActiveStatus } from '../common/enums/active-status.enum';
import { PermissionEffect } from '../permissions/permission-effect.enum';
import { PermissionsResolverService } from '../rbac/permissions-resolver.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdateMyProfileDto } from './dto/update-my-profile.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    @InjectRepository(UserRole)
    private readonly userRolesRepository: Repository<UserRole>,
    @InjectRepository(UserPermission)
    private readonly userPermissionsRepository: Repository<UserPermission>,
    @InjectRepository(Permission)
    private readonly permissionsRepository: Repository<Permission>,
    @InjectRepository(Role)
    private readonly rolesRepository: Repository<Role>,
    private readonly permissionsResolver: PermissionsResolverService,
  ) {}

  // Includes password_hash, which the entity otherwise excludes by default —
  // only the login flow should ever call this.
  findByUsernameWithPassword(username: string): Promise<User | null> {
    return this.usersRepository
      .createQueryBuilder('user')
      .addSelect('user.password_hash')
      .where('user.username = :username', { username })
      .getOne();
  }

  findAll(): Promise<User[]> {
    return this.usersRepository.find({
      order: { name: 'ASC' },
      relations: { primary_branch: true },
    });
  }

  async findOne(id: string): Promise<User> {
    const user = await this.usersRepository.findOne({
      where: { id },
      relations: { primary_branch: true },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  findById(id: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { id } });
  }

  async create(dto: CreateUserDto): Promise<User> {
    await this.assertUsernameAndEmailFree(dto.username, dto.email);

    const password_hash = await bcrypt.hash(dto.password, 10);
    const user = this.usersRepository.create({
      username: dto.username,
      email: dto.email,
      phone: dto.phone,
      name: dto.name,
      password_hash,
      primary_branch_id: dto.primary_branch_id ?? null,
    });
    return this.usersRepository.save(user);
  }

  async update(id: string, dto: UpdateUserDto): Promise<User> {
    const user = await this.findOne(id);
    if (dto.username || dto.email) {
      await this.assertUsernameAndEmailFree(dto.username, dto.email, id);
    }
    this.usersRepository.merge(user, dto);
    return this.usersRepository.save(user);
  }

  // Self-service — no admin permission involved, only this user's own
  // identity (checked by the controller passing its own id). Reuses the
  // same username/email uniqueness guard as the admin update path, though
  // username itself is never editable here (see UpdateMyProfileDto).
  async updateMyProfile(id: string, dto: UpdateMyProfileDto): Promise<User> {
    const user = await this.findOne(id);
    if (dto.email) {
      await this.assertUsernameAndEmailFree(undefined, dto.email, id);
    }
    this.usersRepository.merge(user, dto);
    user.avatar_url = user.avatar_url || null;
    return this.usersRepository.save(user);
  }

  // Self-service password change — requires knowing the current password,
  // unlike the admin-triggered resetPassword() below.
  async changeMyPassword(
    id: string,
    currentPassword: string,
    newPassword: string,
  ): Promise<void> {
    const user = await this.usersRepository
      .createQueryBuilder('user')
      .addSelect('user.password_hash')
      .where('user.id = :id', { id })
      .getOne();
    if (!user) {
      throw new NotFoundException('User not found');
    }
    const matches = await bcrypt.compare(currentPassword, user.password_hash);
    if (!matches) {
      throw new BadRequestException('Current password is incorrect');
    }
    user.password_hash = await bcrypt.hash(newPassword, 10);
    await this.usersRepository.save(user);
  }

  async remove(id: string, actorUserId: string): Promise<void> {
    this.assertNotSelf(id, actorUserId, 'delete');
    const user = await this.findOne(id);
    // Absolute guard, independent of whether another system-role holder
    // exists — a System Owner (or any system-role account) is the "heart
    // of the system": the one guaranteed able to grant permissions, create
    // users, fix a bad role assignment. Losing it is not something a
    // 409-with-a-workaround is enough for; this is a hard no, every time.
    if (await this.permissionsResolver.hasSystemRole(id)) {
      throw new ForbiddenException(
        'System Owner accounts cannot be deleted — remove their system role first if you really need to, or deactivate instead',
      );
    }
    try {
      await this.usersRepository.remove(user);
    } catch (error) {
      // Postgres 23503 = foreign_key_violation. UserRole/UserPermission
      // cascade on delete, but a User is also referenced — without
      // cascading — from an Employee's user_id (see employee.entity.ts)
      // and potentially from created_by/performed_by-style columns across
      // other modules. Rather than auditing every one, catch the generic
      // case: any user with real activity history can't be hard-deleted,
      // same as the recipe/checklist-template fixes. Deactivate instead.
      if (
        error instanceof QueryFailedError &&
        (error.driverError as { code?: string } | undefined)?.code === '23503'
      ) {
        throw new ConflictException(
          'This user has associated records (e.g. a linked employee, or activity history) and cannot be deleted — deactivate them instead',
        );
      }
      throw error;
    }
  }

  async setActive(id: string, isActive: boolean): Promise<User> {
    const user = await this.findOne(id);
    user.status = isActive ? ActiveStatus.ACTIVE : ActiveStatus.INACTIVE;
    return this.usersRepository.save(user);
  }

  // Admin-triggered forced reset — distinct from the user's own self-service
  // password change. Returns the plaintext password only when one was
  // generated here (the admin already knows it if they supplied it).
  async resetPassword(
    id: string,
    newPassword?: string,
  ): Promise<{ generatedPassword?: string }> {
    const user = await this.findOne(id);
    const password = newPassword ?? randomBytes(9).toString('base64url');
    user.password_hash = await bcrypt.hash(password, 10);
    await this.usersRepository.save(user);
    return newPassword ? {} : { generatedPassword: password };
  }

  listRoleAssignments(userId: string): Promise<UserRole[]> {
    return this.userRolesRepository.find({
      where: { user_id: userId },
      relations: { role: true, branch: true },
    });
  }

  async assignRole(
    targetUserId: string,
    roleId: string,
    branchId: string | null,
    actorUserId: string,
  ): Promise<UserRole> {
    this.assertNotSelf(targetUserId, actorUserId, 'assign a role to');

    const role = await this.rolesRepository.findOne({ where: { id: roleId } });
    if (!role) {
      throw new NotFoundException('Role not found');
    }

    await this.assertActorCanGrantRole(role.id, actorUserId);

    const existing = await this.userRolesRepository.findOne({
      where: {
        user_id: targetUserId,
        role_id: roleId,
        branch_id: branchId === null ? IsNull() : branchId,
      },
    });
    if (existing) {
      return existing;
    }

    return this.userRolesRepository.save(
      this.userRolesRepository.create({
        user_id: targetUserId,
        role_id: roleId,
        branch_id: branchId,
      }),
    );
  }

  async removeRoleAssignment(
    targetUserId: string,
    userRoleId: string,
    actorUserId: string,
  ): Promise<void> {
    this.assertNotSelf(targetUserId, actorUserId, 'remove a role from');

    const assignment = await this.userRolesRepository.findOne({
      where: { id: userRoleId, user_id: targetUserId },
    });
    if (!assignment) {
      throw new NotFoundException('Role assignment not found');
    }
    await this.userRolesRepository.remove(assignment);
  }

  listPermissionOverrides(userId: string): Promise<UserPermission[]> {
    return this.userPermissionsRepository.find({
      where: { user_id: userId },
      relations: { permission: true },
    });
  }

  async setPermissionOverride(
    targetUserId: string,
    permissionId: string,
    effect: PermissionEffect,
    actorUserId: string,
  ): Promise<UserPermission> {
    this.assertNotSelf(targetUserId, actorUserId, 'modify permissions for');

    const permission = await this.permissionsRepository.findOne({
      where: { id: permissionId },
    });
    if (!permission) {
      throw new NotFoundException('Permission not found');
    }

    if (effect === PermissionEffect.GRANT) {
      const actorHoldsSystemRole =
        await this.permissionsResolver.hasSystemRole(actorUserId);
      if (!actorHoldsSystemRole) {
        const actorPermissions =
          await this.permissionsResolver.getEffectivePermissionsAnyBranch(
            actorUserId,
          );
        if (!actorPermissions.has(permission.key)) {
          throw new ForbiddenException(
            `Cannot grant a permission you don't hold yourself: ${permission.key}`,
          );
        }
      }
    }

    const existing = await this.userPermissionsRepository.findOne({
      where: { user_id: targetUserId, permission_id: permissionId },
    });
    if (existing) {
      existing.effect = effect;
      return this.userPermissionsRepository.save(existing);
    }

    return this.userPermissionsRepository.save(
      this.userPermissionsRepository.create({
        user_id: targetUserId,
        permission_id: permissionId,
        effect,
      }),
    );
  }

  async removePermissionOverride(
    targetUserId: string,
    permissionId: string,
    actorUserId: string,
  ): Promise<void> {
    this.assertNotSelf(targetUserId, actorUserId, 'modify permissions for');

    const existing = await this.userPermissionsRepository.findOne({
      where: { user_id: targetUserId, permission_id: permissionId },
    });
    if (!existing) {
      throw new NotFoundException('Permission override not found');
    }
    await this.userPermissionsRepository.remove(existing);
  }

  private assertNotSelf(
    targetUserId: string,
    actorUserId: string,
    action: string,
  ): void {
    if (targetUserId === actorUserId) {
      throw new ForbiddenException(`You cannot ${action} your own account`);
    }
  }

  // A role's permission set must already be a subset of what the actor can
  // do, unless the actor holds a system role — see
  // docs/user-management-design.md's privilege-escalation guard.
  private async assertActorCanGrantRole(
    roleId: string,
    actorUserId: string,
  ): Promise<void> {
    const actorHoldsSystemRole =
      await this.permissionsResolver.hasSystemRole(actorUserId);
    if (actorHoldsSystemRole) {
      return;
    }

    const rolePermissionKeys = await this.permissionsRepository
      .createQueryBuilder('permission')
      .innerJoin('role_permissions', 'rp', 'rp.permission_id = permission.id')
      .where('rp.role_id = :roleId', { roleId })
      .select('permission.key', 'key')
      .getRawMany<{ key: string }>();

    const actorPermissions =
      await this.permissionsResolver.getEffectivePermissionsAnyBranch(
        actorUserId,
      );
    const notHeldByActor = rolePermissionKeys
      .map((row) => row.key)
      .filter((key) => !actorPermissions.has(key));

    if (notHeldByActor.length > 0) {
      throw new ForbiddenException(
        `Cannot assign a role granting permission(s) you don't hold yourself: ${notHeldByActor.join(', ')}`,
      );
    }
  }

  private async assertUsernameAndEmailFree(
    username?: string,
    email?: string,
    excludeUserId?: string,
  ): Promise<void> {
    if (username) {
      const existing = await this.usersRepository.findOne({
        where: { username },
      });
      if (existing && existing.id !== excludeUserId) {
        throw new ConflictException('Username already in use');
      }
    }
    if (email) {
      const existing = await this.usersRepository.findOne({ where: { email } });
      if (existing && existing.id !== excludeUserId) {
        throw new ConflictException('Email already in use');
      }
    }
  }
}
