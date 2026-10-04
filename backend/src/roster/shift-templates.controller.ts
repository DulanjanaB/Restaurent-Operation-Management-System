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
import { ShiftTemplatesService } from './shift-templates.service';
import { CreateShiftTemplateDto } from './dto/create-shift-template.dto';
import { UpdateShiftTemplateDto } from './dto/update-shift-template.dto';
import { PermissionsGuard } from '../rbac/permissions.guard';
import { RequirePermissions } from '../rbac/require-permissions.decorator';

@UseGuards(PermissionsGuard)
@Controller('roster/shift-templates')
export class ShiftTemplatesController {
  constructor(private readonly shiftTemplatesService: ShiftTemplatesService) {}

  @RequirePermissions('roster.view')
  @Get()
  findAll(@Query('branch_id') branchId?: string) {
    return this.shiftTemplatesService.findAll(branchId);
  }

  @RequirePermissions('roster.view')
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.shiftTemplatesService.findOne(id);
  }

  @RequirePermissions('roster.create')
  @Post()
  create(@Body() dto: CreateShiftTemplateDto) {
    return this.shiftTemplatesService.create(dto);
  }

  @RequirePermissions('roster.update')
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateShiftTemplateDto) {
    return this.shiftTemplatesService.update(id, dto);
  }

  @RequirePermissions('roster.delete')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.shiftTemplatesService.remove(id);
  }
}
