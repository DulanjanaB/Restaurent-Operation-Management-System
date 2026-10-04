import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { PreservedItemsService } from './preserved-items.service';
import { CreatePreservedItemDto } from './dto/create-preserved-item.dto';
import { UpdatePreservedItemDto } from './dto/update-preserved-item.dto';
import { PermissionsGuard } from '../rbac/permissions.guard';
import { RequirePermissions } from '../rbac/require-permissions.decorator';

@UseGuards(PermissionsGuard)
@Controller('food-preservation/items')
export class PreservedItemsController {
  constructor(private readonly preservedItemsService: PreservedItemsService) {}

  @RequirePermissions('food_preservation.view')
  @Get()
  findAll() {
    return this.preservedItemsService.findAll();
  }

  @RequirePermissions('food_preservation.view')
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.preservedItemsService.findOne(id);
  }

  @RequirePermissions('food_preservation.create')
  @Post()
  create(@Body() dto: CreatePreservedItemDto) {
    return this.preservedItemsService.create(dto);
  }

  @RequirePermissions('food_preservation.update')
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdatePreservedItemDto) {
    return this.preservedItemsService.update(id, dto);
  }

  @RequirePermissions('food_preservation.delete')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.preservedItemsService.remove(id);
  }
}
