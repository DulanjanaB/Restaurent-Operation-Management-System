import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { WastageService } from './wastage.service';
import { CreateWastageDto } from './dto/create-wastage.dto';
import { PermissionsGuard } from '../rbac/permissions.guard';
import { RequirePermissions } from '../rbac/require-permissions.decorator';
import { CurrentUser } from '../auth/current-user.decorator';
import { User } from '../users/user.entity';

@UseGuards(PermissionsGuard)
@Controller('inventory/wastage')
export class WastageController {
  constructor(private readonly wastageService: WastageService) {}

  @RequirePermissions('inventory.view')
  @Get()
  findAll() {
    return this.wastageService.findAll();
  }

  @RequirePermissions('inventory.view')
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.wastageService.findOne(id);
  }

  @RequirePermissions('inventory.create')
  @Post()
  create(@Body() dto: CreateWastageDto, @CurrentUser() actor: User) {
    return this.wastageService.create(dto, actor.id);
  }

  @RequirePermissions('inventory.approve')
  @Post(':id/approve')
  approve(@Param('id') id: string, @CurrentUser() actor: User) {
    return this.wastageService.decide(id, true, actor.id);
  }

  @RequirePermissions('inventory.approve')
  @Post(':id/reject')
  reject(@Param('id') id: string, @CurrentUser() actor: User) {
    return this.wastageService.decide(id, false, actor.id);
  }
}
