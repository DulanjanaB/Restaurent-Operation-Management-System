import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { RosterPeriodsService } from './roster-periods.service';
import { CreateRosterPeriodDto } from './dto/create-roster-period.dto';
import { UpdateRosterPeriodDto } from './dto/update-roster-period.dto';
import { PermissionsGuard } from '../rbac/permissions.guard';
import { RequirePermissions } from '../rbac/require-permissions.decorator';
import { CurrentUser } from '../auth/current-user.decorator';
import { User } from '../users/user.entity';

@UseGuards(PermissionsGuard)
@Controller('roster/periods')
export class RosterPeriodsController {
  constructor(private readonly rosterPeriodsService: RosterPeriodsService) {}

  @RequirePermissions('roster.view')
  @Get()
  findAll(@Query('branch_id') branchId?: string) {
    return this.rosterPeriodsService.findAll(branchId);
  }

  @RequirePermissions('roster.view')
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.rosterPeriodsService.findOne(id);
  }

  @RequirePermissions('roster.create')
  @Post()
  create(@Body() dto: CreateRosterPeriodDto) {
    return this.rosterPeriodsService.create(dto);
  }

  @RequirePermissions('roster.update')
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateRosterPeriodDto) {
    return this.rosterPeriodsService.update(id, dto);
  }

  @RequirePermissions('roster.delete')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.rosterPeriodsService.remove(id);
  }

  @RequirePermissions('roster.publish')
  @Post(':id/publish')
  publish(@Param('id') id: string, @CurrentUser() actor: User) {
    return this.rosterPeriodsService.publish(id, actor.id);
  }
}
