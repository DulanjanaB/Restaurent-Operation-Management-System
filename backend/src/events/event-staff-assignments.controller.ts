import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { EventStaffAssignmentsService } from './event-staff-assignments.service';
import { AssignStaffDto } from './dto/assign-staff.dto';
import { PermissionsGuard } from '../rbac/permissions.guard';
import { RequirePermissions } from '../rbac/require-permissions.decorator';

@UseGuards(PermissionsGuard)
@Controller('events/:eventId/staff')
export class EventStaffAssignmentsController {
  constructor(
    private readonly assignmentsService: EventStaffAssignmentsService,
  ) {}

  @RequirePermissions('event.view')
  @Get()
  findAll(@Param('eventId') eventId: string) {
    return this.assignmentsService.findAll(eventId);
  }

  @RequirePermissions('event.assign_staff')
  @Post()
  assign(@Param('eventId') eventId: string, @Body() dto: AssignStaffDto) {
    return this.assignmentsService.assign(eventId, dto);
  }

  @RequirePermissions('event.assign_staff')
  @Delete(':assignmentId')
  remove(
    @Param('eventId') eventId: string,
    @Param('assignmentId') assignmentId: string,
  ) {
    return this.assignmentsService.remove(eventId, assignmentId);
  }
}
