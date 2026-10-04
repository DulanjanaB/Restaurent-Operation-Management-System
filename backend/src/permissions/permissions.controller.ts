import { Controller, Get, UseGuards } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Permission } from './permission.entity';
import { PermissionsGuard } from '../rbac/permissions.guard';
import { RequirePermissions } from '../rbac/require-permissions.decorator';

// Read-only catalog — see docs/permission-management (Administration →
// Permission Management): the list is seeded, never created through the UI.
// The Role Management screen's checklist reads this to know every
// module/action combination it can offer a checkbox for.
@UseGuards(PermissionsGuard)
@Controller('permissions')
export class PermissionsController {
  constructor(
    @InjectRepository(Permission)
    private readonly permissionsRepository: Repository<Permission>,
  ) {}

  @RequirePermissions('administration.permission.view')
  @Get()
  findAll() {
    return this.permissionsRepository.find({
      order: { module: 'ASC', resource: 'ASC', action: 'ASC' },
    });
  }
}
