import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Branch } from '../branches/branch.entity';
import { Role } from '../roles/role.entity';
import { RolePermission } from '../roles/role-permission.entity';
import { Permission } from '../permissions/permission.entity';
import { PermissionsSeeder } from '../permissions/permissions.seeder';
import { User } from '../users/user.entity';
import { UserRole } from '../users/user-role.entity';

const OWNER_ROLE_NAME = 'Owner';
const DEFAULT_BRANCH_CODE = 'MAIN';

// First-run bootstrap: seeds the permission catalog, a default Branch, an
// "Owner" system role holding every permission, and one User to log in
// with — otherwise there's no way to reach the app at all on a fresh
// database. Every step is idempotent (checks before creating), so this is
// safe to run on every boot.
@Injectable()
export class InitialDataSeeder implements OnApplicationBootstrap {
  private readonly logger = new Logger(InitialDataSeeder.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly permissionsSeeder: PermissionsSeeder,
    @InjectRepository(Branch)
    private readonly branchesRepository: Repository<Branch>,
    @InjectRepository(Role) private readonly rolesRepository: Repository<Role>,
    @InjectRepository(RolePermission)
    private readonly rolePermissionsRepository: Repository<RolePermission>,
    @InjectRepository(Permission)
    private readonly permissionsRepository: Repository<Permission>,
    @InjectRepository(User) private readonly usersRepository: Repository<User>,
    @InjectRepository(UserRole)
    private readonly userRolesRepository: Repository<UserRole>,
  ) {}

  async onApplicationBootstrap() {
    // Explicit dependency instead of relying on module bootstrap order.
    await this.permissionsSeeder.onApplicationBootstrap();

    const branch = await this.ensureDefaultBranch();
    const ownerRole = await this.ensureOwnerRole();
    await this.ensureInitialUser(branch, ownerRole);
  }

  private async ensureDefaultBranch(): Promise<Branch> {
    const existing = await this.branchesRepository.findOne({
      where: { code: DEFAULT_BRANCH_CODE },
    });
    if (existing) {
      return existing;
    }

    const branch = this.branchesRepository.create({
      name: this.configService.get('DEFAULT_BRANCH_NAME', 'Main Branch'),
      code: DEFAULT_BRANCH_CODE,
    });
    const saved = await this.branchesRepository.save(branch);
    this.logger.log(`Created default branch "${saved.name}" (${saved.code})`);
    return saved;
  }

  private async ensureOwnerRole(): Promise<Role> {
    let role = await this.rolesRepository.findOne({
      where: { name: OWNER_ROLE_NAME },
    });

    if (!role) {
      role = await this.rolesRepository.save(
        this.rolesRepository.create({
          name: OWNER_ROLE_NAME,
          description: 'Full system access — every permission, every branch.',
          is_system_role: true,
        }),
      );
      this.logger.log(`Created system role "${OWNER_ROLE_NAME}"`);
    }

    const allPermissions = await this.permissionsRepository.find();
    const existingGrants = await this.rolePermissionsRepository.find({
      where: { role_id: role.id },
    });
    const grantedPermissionIds = new Set(
      existingGrants.map((grant) => grant.permission_id),
    );

    const missing = allPermissions.filter(
      (permission) => !grantedPermissionIds.has(permission.id),
    );
    if (missing.length > 0) {
      await this.rolePermissionsRepository.save(
        missing.map((permission) =>
          this.rolePermissionsRepository.create({
            role_id: role!.id,
            permission_id: permission.id,
          }),
        ),
      );
      this.logger.log(
        `Granted ${missing.length} permission(s) to "${OWNER_ROLE_NAME}"`,
      );
    }

    return role;
  }

  private async ensureInitialUser(
    branch: Branch,
    ownerRole: Role,
  ): Promise<void> {
    const existingUserCount = await this.usersRepository.count();
    if (existingUserCount > 0) {
      return;
    }

    const username = this.configService.get('ADMIN_USERNAME', 'admin');
    const email = this.configService.get('ADMIN_EMAIL', 'admin@example.com');
    const password = this.configService.get('ADMIN_PASSWORD', 'ChangeMe123!');
    const passwordHash = await bcrypt.hash(password, 10);

    const user = await this.usersRepository.save(
      this.usersRepository.create({
        username,
        email,
        name: 'System Owner',
        password_hash: passwordHash,
        primary_branch_id: branch.id,
      }),
    );

    // branch_id: null — an Owner holds this role across all branches.
    await this.userRolesRepository.save(
      this.userRolesRepository.create({
        user_id: user.id,
        role_id: ownerRole.id,
        branch_id: null,
      }),
    );

    this.logger.warn(
      `Created initial user "${username}" with the ${
        this.configService.get('ADMIN_PASSWORD') ? 'configured' : 'default'
      } password — log in and change it. Set ADMIN_USERNAME/ADMIN_EMAIL/ADMIN_PASSWORD env vars to control this on first boot.`,
    );
  }
}
