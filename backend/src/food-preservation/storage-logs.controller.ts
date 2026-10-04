import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { StorageLogsService } from './storage-logs.service';
import { LogStorageDto } from './dto/log-storage.dto';
import { PermissionsGuard } from '../rbac/permissions.guard';
import { RequirePermissions } from '../rbac/require-permissions.decorator';
import { CurrentUser } from '../auth/current-user.decorator';
import { User } from '../users/user.entity';

@UseGuards(PermissionsGuard)
@Controller('food-preservation/storage-locations/:storageLocationId/logs')
export class StorageLogsController {
  constructor(private readonly storageLogsService: StorageLogsService) {}

  @RequirePermissions('food_preservation.view')
  @Get()
  findAll(@Param('storageLocationId') storageLocationId: string) {
    return this.storageLogsService.findAll(storageLocationId);
  }

  // Kept on food_preservation.log_storage rather than .update — a kitchen
  // worker can log a freezer check without batch-edit rights. See
  // docs/food-preservation-design.md.
  @RequirePermissions('food_preservation.log_storage')
  @Post()
  log(
    @Param('storageLocationId') storageLocationId: string,
    @Body() dto: LogStorageDto,
    @CurrentUser() actor: User,
  ) {
    return this.storageLogsService.log(storageLocationId, dto, actor.id);
  }
}
