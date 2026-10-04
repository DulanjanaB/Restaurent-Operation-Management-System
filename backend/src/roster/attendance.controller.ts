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
import { AttendanceService } from './attendance.service';
import { CreateAttendanceDto } from './dto/create-attendance.dto';
import { UpdateAttendanceDto } from './dto/update-attendance.dto';
import { PermissionsGuard } from '../rbac/permissions.guard';
import { RequirePermissions } from '../rbac/require-permissions.decorator';

@UseGuards(PermissionsGuard)
@Controller('roster/attendance')
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  @RequirePermissions('roster.view')
  @Get()
  findAll(
    @Query('employee_id') employeeId?: string,
    @Query('date') date?: string,
    @Query('date_from') dateFrom?: string,
    @Query('date_to') dateTo?: string,
  ) {
    return this.attendanceService.findAll(employeeId, date, dateFrom, dateTo);
  }

  @RequirePermissions('roster.view')
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.attendanceService.findOne(id);
  }

  // Kept on roster.mark_attendance rather than roster.create — see
  // docs/roster-management-design.md: a shift supervisor can take
  // attendance without full roster-edit rights.
  @RequirePermissions('roster.mark_attendance')
  @Post()
  mark(@Body() dto: CreateAttendanceDto) {
    return this.attendanceService.mark(dto);
  }

  @RequirePermissions('roster.mark_attendance')
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateAttendanceDto) {
    return this.attendanceService.update(id, dto);
  }

  @RequirePermissions('roster.delete')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.attendanceService.remove(id);
  }
}
