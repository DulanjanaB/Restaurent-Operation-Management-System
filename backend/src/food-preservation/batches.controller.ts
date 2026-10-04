import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { BatchesService } from './batches.service';
import { CreateBatchDto } from './dto/create-batch.dto';
import { PermissionsGuard } from '../rbac/permissions.guard';
import { RequirePermissions } from '../rbac/require-permissions.decorator';
import { CurrentUser } from '../auth/current-user.decorator';
import { User } from '../users/user.entity';

@UseGuards(PermissionsGuard)
@Controller('food-preservation/batches')
export class BatchesController {
  constructor(private readonly batchesService: BatchesService) {}

  @RequirePermissions('food_preservation.view')
  @Get()
  findAll(
    @Query('preserved_item_id') preservedItemId?: string,
    @Query('storage_location_id') storageLocationId?: string,
  ) {
    return this.batchesService.findAll(preservedItemId, storageLocationId);
  }

  @RequirePermissions('food_preservation.view')
  @Get('expiry-alerts')
  expiryAlerts(@Query('days') days?: string) {
    return this.batchesService.expiryAlerts(days ? Number(days) : undefined);
  }

  @RequirePermissions('food_preservation.view')
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.batchesService.findOne(id);
  }

  @RequirePermissions('food_preservation.view')
  @Get(':id/timeline')
  timeline(@Param('id') id: string) {
    return this.batchesService.timeline(id);
  }

  @RequirePermissions('food_preservation.create')
  @Post()
  create(@Body() dto: CreateBatchDto, @CurrentUser() actor: User) {
    return this.batchesService.create(dto, actor.id);
  }

  @RequirePermissions('food_preservation.update_status')
  @Post(':id/consume')
  markConsumed(@Param('id') id: string) {
    return this.batchesService.markConsumed(id);
  }
}
