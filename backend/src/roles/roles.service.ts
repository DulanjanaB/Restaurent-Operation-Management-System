import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Role } from './role.entity';
import { RolePermission } from './role-permission.entity';
import { Permission } from '../permissions/permission.entity';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { PermissionsResolverService } from '../rbac/permissions-resolver.service';

@Injectable()
export class RolesService {
  constructor(
    @InjectRepository(Role)
    private readonly rolesRepository: Repository<Role>,
    @InjectRepository(RolePermission)
    private readonly rolePermissionsRepository: Repository<RolePermission>,
    @InjectRepository(Permission)
    private readonly permissionsRepository: Repository<Permission>,
    private readonly permissionsResolver: PermissionsResolverService,
  ) {}

  findAll(): Promise<Role[]> {
    return this.rolesRepository.find({ order: { name: 'ASC' } });
  }

  async findOne(id: string): Promise<Role> {
    const role = await this.rolesRepository.findOne({ where: { id } });
    if (!role) {
      throw new NotFoundException('Role not found');
    }
    return role;
  }

  async create(dto: CreateRoleDto): Promise<Role> {
    const existing = await this.rolesRepository.findOne({
      where: { name: dto.name },
    });
    if (existing) {
      throw new ConflictException('Role name already in use');
    }
    return this.rolesRepository.save(this.rolesRepository.create(dto));
  }

  async update(id: string, dto: UpdateRoleDto): Promise<Role> {
    const role = await this.findOne(id);
    this.rolesRepository.merge(role, dto);
    return this.rolesRepository.save(role);
  }

  async remove(id: string): Promise<void> {
    const role = await this.findOne(id);
    if (role.is_system_role) {
      throw new BadRequestException('System roles cannot be deleted');
    }
    await this.rolesRepository.remove(role);
  }

  async getPermissionIds(id: string): Promise<string[]> {
    await this.findOne(id);
    const grants = await this.rolePermissionsRepository.find({
      where: { role_id: id },
    });
    return grants.map((grant) => grant.permission_id);
  }

  // Full replace: the incoming list becomes the role's exact permission
  // set. Guards against privilege escalation through role editing — an
  // actor without a system role can't grant permissions they don't hold
  // themselves — mirroring the same check on the User side (see
  // docs/user-management-design.md's privilege-escalation guard).
  async setPermissions(
    id: string,
    permissionIds: string[],
    actorUserId: string,
  ): Promise<void> {
    const role = await this.findOne(id);

    if (role.is_system_role) {
      throw new BadRequestException(
        "A system role's permissions are fixed and can't be edited",
      );
    }

    const requestedPermissions =
      permissionIds.length > 0
        ? await this.permissionsRepository.findBy({ id: In(permissionIds) })
        : [];
    if (requestedPermissions.length !== permissionIds.length) {
      throw new BadRequestException('One or more permission ids are invalid');
    }

    const currentGrants = await this.rolePermissionsRepository.find({
      where: { role_id: id },
    });
    const currentPermissionIds = new Set(
      currentGrants.map((grant) => grant.permission_id),
    );
    const newPermissionIds = requestedPermissions
      .map((permission) => permission.id)
      .filter((permissionId) => !currentPermissionIds.has(permissionId));

    if (newPermissionIds.length > 0) {
      const actorHoldsSystemRole =
        await this.permissionsResolver.hasSystemRole(actorUserId);
      if (!actorHoldsSystemRole) {
        const actorPermissions =
          await this.permissionsResolver.getEffectivePermissionsAnyBranch(
            actorUserId,
          );
        const newPermissionKeys = requestedPermissions
          .filter((permission) => newPermissionIds.includes(permission.id))
          .map((permission) => permission.key);
        const notHeldByActor = newPermissionKeys.filter(
          (key) => !actorPermissions.has(key),
        );
        if (notHeldByActor.length > 0) {
          throw new ForbiddenException(
            `Cannot grant permission(s) you don't hold yourself: ${notHeldByActor.join(', ')}`,
          );
        }
      }
    }

    await this.rolePermissionsRepository.delete({ role_id: id });
    if (requestedPermissions.length > 0) {
      await this.rolePermissionsRepository.save(
        requestedPermissions.map((permission) =>
          this.rolePermissionsRepository.create({
            role_id: id,
            permission_id: permission.id,
          }),
        ),
      );
    }
  }
}
