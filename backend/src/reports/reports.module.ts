import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TipPool } from '../tip-sharing/tip-pool.entity';
import { TipAllocation } from '../tip-sharing/tip-allocation.entity';
import { TipPayout } from '../tip-sharing/tip-payout.entity';
import { TipReportsService } from './tip-reports.service';
import { ReportsService } from './reports.service';
import { ReportsController } from './reports.controller';
import { BranchAccessService } from './branch-access.service';
import { ExportModule } from '../export/export.module';
import { RbacModule } from '../rbac/rbac.module';
import { AuditLogModule } from '../audit-log/audit-log.module';
import { InventoryModule } from '../inventory/inventory.module';
import { EventsModule } from '../events/events.module';
import { RosterModule } from '../roster/roster.module';
import { BarModule } from '../bar/bar.module';
import { FoodPreservationModule } from '../food-preservation/food-preservation.module';
import { ChecklistModule } from '../checklist/checklist.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([TipPool, TipAllocation, TipPayout]),
    RbacModule,
    AuditLogModule,
    InventoryModule,
    EventsModule,
    RosterModule,
    BarModule,
    FoodPreservationModule,
    ChecklistModule,
    ExportModule,
  ],
  controllers: [ReportsController],
  providers: [ReportsService, BranchAccessService, TipReportsService],
})
export class ReportsModule {}
