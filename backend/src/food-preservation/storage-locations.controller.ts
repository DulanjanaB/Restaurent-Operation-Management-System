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
import { StorageLocationsService } from './storage-locations.service';
import { CreateStorageLocationDto } from './dto/create-storage-location.dto';
import { UpdateStorageLocationDto } from './dto/update-storage-location.dto';
import { PermissionsGuard } from '../rbac/permissions.guard';
import { RequirePermissions } from '../rbac/require-permissions.decorator';

@UseGuards(PermissionsGuard)
@Controller('food-preservation/storage-locations')
export class StorageLocationsController {
  constructor(
    private readonly storageLocationsService: StorageLocationsService,
  ) {}

  @RequirePermissions('food_preservation.view')
  @Get()
  findAll(@Query('branch_id') branchId?: string) {
    return this.storageLocationsService.findAll(branchId);
  }

  @RequirePermissions('food_preservation.view')
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.storageLocationsService.findOne(id);
  }

  @RequirePermissions('food_preservation.create')
  @Post()
  create(@Body() dto: CreateStorageLocationDto) {
    return this.storageLocationsService.create(dto);
  }

  @RequirePermissions('food_preservation.update')
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateStorageLocationDto) {
    return this.storageLocationsService.update(id, dto);
  }

  @RequirePermissions('food_preservation.delete')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.storageLocationsService.remove(id);
  }
}
