import { Module } from '@nestjs/common';
import { Employee } from '../roster/employee.entity';
import { AuditLogModule } from '../audit-log/audit-log.module';
import { TypeOrmModule } from '@nestjs/typeorm';

import { PreservedItem } from './preserved-item.entity';
import { StorageLocation } from './storage-location.entity';
import { Batch } from './batch.entity';
import { StorageLog } from './storage-log.entity';
import { WasteDisposal } from './waste-disposal.entity';

import { PreservedItemsService } from './preserved-items.service';
import { PreservedItemsController } from './preserved-items.controller';
import { StorageLocationsService } from './storage-locations.service';
import { StorageLocationsController } from './storage-locations.controller';
import { BatchesService } from './batches.service';
import { BatchesController } from './batches.controller';
import { StorageLogsService } from './storage-logs.service';
import { StorageLogsController } from './storage-logs.controller';
import { WasteDisposalsService } from './waste-disposals.service';
import { WasteDisposalsController } from './waste-disposals.controller';

import { RbacModule } from '../rbac/rbac.module';

@Module({
  imports: [
    AuditLogModule,
    TypeOrmModule.forFeature([
      PreservedItem,
      StorageLocation,
      Batch,
      StorageLog,
      Employee,
      WasteDisposal,
      WasteDisposal,
    ]),
    RbacModule,
  ],
  controllers: [
    PreservedItemsController,
    StorageLocationsController,
    BatchesController,
    StorageLogsController,
    WasteDisposalsController,
  ],
  providers: [
    PreservedItemsService,
    StorageLocationsService,
    BatchesService,
    StorageLogsService,
    WasteDisposalsService,
  ],
  exports: [TypeOrmModule],
})
export class FoodPreservationModule {}
