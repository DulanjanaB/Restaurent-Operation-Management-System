import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { WasteDisposalsService } from './waste-disposals.service';
import { CreateWasteDisposalDto } from './dto/create-waste-disposal.dto';
import { PermissionsGuard } from '../rbac/permissions.guard';
import { RequirePermissions } from '../rbac/require-permissions.decorator';
import { CurrentUser } from '../auth/current-user.decorator';
import { User } from '../users/user.entity';

@UseGuards(PermissionsGuard)
@Controller('food-preservation/waste-disposals')
export class WasteDisposalsController {
  constructor(private readonly wasteDisposalsService: WasteDisposalsService) {}

  @RequirePermissions('food_preservation.view')
  @Get()
  findAll() {
    return this.wasteDisposalsService.findAll();
  }

  @RequirePermissions('food_preservation.view')
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.wasteDisposalsService.findOne(id);
  }

  @RequirePermissions('food_preservation.create')
  @Post()
  create(@Body() dto: CreateWasteDisposalDto, @CurrentUser() actor: User) {
    return this.wasteDisposalsService.create(dto, actor.id);
  }

  // Matches the taxonomy's "disposal record" Approve example — see
  // docs/rbac-design.md.
  @RequirePermissions('food_preservation.approve')
  @Post(':id/approve')
  approve(@Param('id') id: string, @CurrentUser() actor: User) {
    return this.wasteDisposalsService.decide(id, true, actor.id);
  }

  @RequirePermissions('food_preservation.approve')
  @Post(':id/reject')
  reject(@Param('id') id: string, @CurrentUser() actor: User) {
    return this.wasteDisposalsService.decide(id, false, actor.id);
  }
}
