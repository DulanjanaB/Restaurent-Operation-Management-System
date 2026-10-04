import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ChecklistTemplate } from './checklist-template.entity';
import { ChecklistItem } from './checklist-item.entity';
import { ChecklistAssignment } from './checklist-assignment.entity';
import { ChecklistRecord } from './checklist-record.entity';
import { ChecklistRecordResponse } from './checklist-record-response.entity';

import { ChecklistTemplatesService } from './checklist-templates.service';
import { ChecklistTemplatesController } from './checklist-templates.controller';
import { ChecklistAssignmentsService } from './checklist-assignments.service';
import { ChecklistAssignmentsController } from './checklist-assignments.controller';
import { ChecklistRecordsService } from './checklist-records.service';
import { ChecklistRecordsController } from './checklist-records.controller';

import { RbacModule } from '../rbac/rbac.module';
import { RosterModule } from '../roster/roster.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ChecklistTemplate,
      ChecklistItem,
      ChecklistAssignment,
      ChecklistRecord,
      ChecklistRecordResponse,
    ]),
    RbacModule,
    RosterModule,
  ],
  controllers: [
    ChecklistTemplatesController,
    ChecklistAssignmentsController,
    ChecklistRecordsController,
  ],
  providers: [
    ChecklistTemplatesService,
    ChecklistAssignmentsService,
    ChecklistRecordsService,
  ],
  exports: [TypeOrmModule],
})
export class ChecklistModule {}
