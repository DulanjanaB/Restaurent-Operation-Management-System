import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { LeaveService } from './leave.service';
import { CreateLeaveDto } from './dto/create-leave.dto';
import { PermissionsGuard } from '../rbac/permissions.guard';
import { RequirePermissions } from '../rbac/require-permissions.decorator';
import { CurrentUser } from '../auth/current-user.decorator';
import { User } from '../users/user.entity';

@UseGuards(PermissionsGuard)
@Controller('roster/leave')
export class LeaveController {
  constructor(private readonly leaveService: LeaveService) {}

  @RequirePermissions('roster.view')
  @Get()
  findAll(@Query('employee_id') employeeId?: string) {
    return this.leaveService.findAll(employeeId);
  }

  @RequirePermissions('roster.view')
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.leaveService.findOne(id);
  }

  @RequirePermissions('roster.create')
  @Post()
  create(@Body() dto: CreateLeaveDto) {
    return this.leaveService.create(dto);
  }

  @RequirePermissions('roster.delete')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.leaveService.remove(id);
  }

  // Matches the taxonomy's "leave/shift-swap request" Approve example —
  // see docs/rbac-design.md.
  @RequirePermissions('roster.approve')
  @Post(':id/approve')
  approve(@Param('id') id: string, @CurrentUser() actor: User) {
    return this.leaveService.decide(id, true, actor.id);
  }

  @RequirePermissions('roster.approve')
  @Post(':id/reject')
  reject(@Param('id') id: string, @CurrentUser() actor: User) {
    return this.leaveService.decide(id, false, actor.id);
  }
}
