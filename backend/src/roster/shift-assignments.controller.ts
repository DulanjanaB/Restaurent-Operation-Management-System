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
import { ShiftAssignmentsService } from './shift-assignments.service';
import { CreateShiftAssignmentDto } from './dto/create-shift-assignment.dto';
import { UpdateShiftAssignmentDto } from './dto/update-shift-assignment.dto';
import { PermissionsGuard } from '../rbac/permissions.guard';
import { RequirePermissions } from '../rbac/require-permissions.decorator';

@UseGuards(PermissionsGuard)
@Controller('roster/shift-assignments')
export class ShiftAssignmentsController {
  constructor(
    private readonly shiftAssignmentsService: ShiftAssignmentsService,
  ) {}

  @RequirePermissions('roster.view')
  @Get()
  findAll(@Query('shift_id') shiftId?: string) {
    return this.shiftAssignmentsService.findAll(shiftId);
  }

  @RequirePermissions('roster.view')
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.shiftAssignmentsService.findOne(id);
  }

  @RequirePermissions('roster.create')
  @Post()
  create(@Body() dto: CreateShiftAssignmentDto) {
    return this.shiftAssignmentsService.create(dto);
  }

  @RequirePermissions('roster.update')
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateShiftAssignmentDto) {
    return this.shiftAssignmentsService.update(id, dto);
  }

  @RequirePermissions('roster.delete')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.shiftAssignmentsService.remove(id);
  }
}
