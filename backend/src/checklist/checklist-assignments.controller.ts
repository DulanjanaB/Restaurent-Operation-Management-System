import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ChecklistAssignmentsService } from './checklist-assignments.service';
import { CreateChecklistAssignmentDto } from './dto/create-checklist-assignment.dto';
import { PermissionsGuard } from '../rbac/permissions.guard';
import { RequirePermissions } from '../rbac/require-permissions.decorator';
import { CurrentUser } from '../auth/current-user.decorator';
import { User } from '../users/user.entity';

@UseGuards(PermissionsGuard)
@Controller('checklist/assignments')
export class ChecklistAssignmentsController {
  constructor(
    private readonly assignmentsService: ChecklistAssignmentsService,
  ) {}

  @RequirePermissions('checklist.view')
  @Get()
  findAll(
    @Query('employee_id') employeeId?: string,
    @Query('template_id') templateId?: string,
  ) {
    return this.assignmentsService.findAll(employeeId, templateId);
  }

  @RequirePermissions('checklist.assign')
  @Post()
  create(
    @Body() dto: CreateChecklistAssignmentDto,
    @CurrentUser() actor: User,
  ) {
    return this.assignmentsService.create(dto, actor.id);
  }

  @RequirePermissions('checklist.assign')
  @Post(':id/deactivate')
  deactivate(@Param('id') id: string) {
    return this.assignmentsService.deactivate(id);
  }
}
