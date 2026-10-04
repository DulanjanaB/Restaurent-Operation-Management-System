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
import { ChecklistTemplatesService } from './checklist-templates.service';
import { CreateChecklistTemplateDto } from './dto/create-checklist-template.dto';
import { UpdateChecklistTemplateDto } from './dto/update-checklist-template.dto';
import { AddChecklistItemDto } from './dto/add-checklist-item.dto';
import { UpdateChecklistItemDto } from './dto/update-checklist-item.dto';
import { PermissionsGuard } from '../rbac/permissions.guard';
import { RequirePermissions } from '../rbac/require-permissions.decorator';
import { CurrentUser } from '../auth/current-user.decorator';
import { User } from '../users/user.entity';

@UseGuards(PermissionsGuard)
@Controller('checklist/templates')
export class ChecklistTemplatesController {
  constructor(private readonly templatesService: ChecklistTemplatesService) {}

  @RequirePermissions('checklist.view')
  @Get()
  findAll(@Query('branch_id') branchId?: string) {
    return this.templatesService.findAll(branchId);
  }

  @RequirePermissions('checklist.view')
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.templatesService.findOne(id);
  }

  // Privileged/admin users only — matches the requirement that creating
  // checklists is restricted. See docs/checklist-design.md.
  @RequirePermissions('checklist.create')
  @Post()
  create(@Body() dto: CreateChecklistTemplateDto, @CurrentUser() actor: User) {
    return this.templatesService.create(dto, actor.id);
  }

  @RequirePermissions('checklist.update')
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateChecklistTemplateDto) {
    return this.templatesService.update(id, dto);
  }

  @RequirePermissions('checklist.delete')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.templatesService.remove(id);
  }

  @RequirePermissions('checklist.update')
  @Post(':id/items')
  addItem(@Param('id') id: string, @Body() dto: AddChecklistItemDto) {
    return this.templatesService.addItem(id, dto);
  }

  @RequirePermissions('checklist.update')
  @Patch(':id/items/:itemId')
  updateItem(
    @Param('id') id: string,
    @Param('itemId') itemId: string,
    @Body() dto: UpdateChecklistItemDto,
  ) {
    return this.templatesService.updateItem(id, itemId, dto);
  }

  @RequirePermissions('checklist.update')
  @Delete(':id/items/:itemId')
  removeItem(@Param('id') id: string, @Param('itemId') itemId: string) {
    return this.templatesService.removeItem(id, itemId);
  }
}
