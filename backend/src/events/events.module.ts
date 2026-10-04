import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { EventType } from './event-type.entity';
import { Customer } from './customer.entity';
import { Venue } from './venue.entity';
import { Package } from './package.entity';
import { Event } from './event.entity';
import { EventStaffAssignment } from './event-staff-assignment.entity';
import { EventExpense } from './event-expense.entity';
import { EventInventoryRequirement } from './event-inventory-requirement.entity';

import { EventTypesService } from './event-types.service';
import { EventTypesController } from './event-types.controller';
import { CustomersService } from './customers.service';
import { CustomersController } from './customers.controller';
import { VenuesService } from './venues.service';
import { VenuesController } from './venues.controller';
import { PackagesService } from './packages.service';
import { PackagesController } from './packages.controller';
import { EventsService } from './events.service';
import { EventsController } from './events.controller';
import { EventStaffAssignmentsService } from './event-staff-assignments.service';
import { EventStaffAssignmentsController } from './event-staff-assignments.controller';
import { EventExpensesService } from './event-expenses.service';
import { EventExpensesController } from './event-expenses.controller';
import { EventInventoryRequirementsService } from './event-inventory-requirements.service';
import { EventInventoryRequirementsController } from './event-inventory-requirements.controller';

import { RbacModule } from '../rbac/rbac.module';
import { InventoryModule } from '../inventory/inventory.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      EventType,
      Customer,
      Venue,
      Package,
      Event,
      EventStaffAssignment,
      EventExpense,
      EventInventoryRequirement,
    ]),
    RbacModule,
    InventoryModule,
  ],
  controllers: [
    EventTypesController,
    CustomersController,
    VenuesController,
    PackagesController,
    EventsController,
    EventStaffAssignmentsController,
    EventExpensesController,
    EventInventoryRequirementsController,
  ],
  providers: [
    EventTypesService,
    CustomersService,
    VenuesService,
    PackagesService,
    EventsService,
    EventStaffAssignmentsService,
    EventExpensesService,
    EventInventoryRequirementsService,
  ],
  exports: [TypeOrmModule, EventsService],
})
export class EventsModule {}
