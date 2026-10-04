import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TipPool } from './tip-pool.entity';
import { TipAllocation } from './tip-allocation.entity';
import { TipPayout } from './tip-payout.entity';

import { TipPoolsService } from './tip-pools.service';
import { TipPoolsController } from './tip-pools.controller';
import { TipPayoutsService } from './tip-payouts.service';
import { TipEmployeeAccessService } from './tip-employee-access.service';
import { TipEmployeesController } from './tip-employees.controller';

import { RosterModule } from '../roster/roster.module';
import { RbacModule } from '../rbac/rbac.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([TipPool, TipAllocation, TipPayout]),
    RosterModule,
    RbacModule,
  ],
  controllers: [TipPoolsController, TipEmployeesController],
  providers: [TipPoolsService, TipPayoutsService, TipEmployeeAccessService],
  exports: [TypeOrmModule],
})
export class TipSharingModule {}
