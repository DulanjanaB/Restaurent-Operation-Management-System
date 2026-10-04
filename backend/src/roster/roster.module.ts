import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Department } from './department.entity';
import { Position } from './position.entity';
import { Employee } from './employee.entity';
import { ShiftTemplate } from './shift-template.entity';
import { RosterPeriod } from './roster-period.entity';
import { Shift } from './shift.entity';
import { ShiftAssignment } from './shift-assignment.entity';
import { Attendance } from './attendance.entity';
import { Leave } from './leave.entity';
import { DocumentType } from './document-type.entity';
import { EmployeeDocument } from './employee-document.entity';

import { DepartmentsService } from './departments.service';
import { DepartmentsController } from './departments.controller';
import { PositionsService } from './positions.service';
import { PositionsController } from './positions.controller';
import { EmployeesService } from './employees.service';
import { EmployeesController } from './employees.controller';
import { ShiftTemplatesService } from './shift-templates.service';
import { ShiftTemplatesController } from './shift-templates.controller';
import { RosterPeriodsService } from './roster-periods.service';
import { RosterPeriodsController } from './roster-periods.controller';
import { ShiftsService } from './shifts.service';
import { ShiftsController } from './shifts.controller';
import { ShiftAssignmentsService } from './shift-assignments.service';
import { ShiftAssignmentsController } from './shift-assignments.controller';
import { AttendanceService } from './attendance.service';
import { AttendanceController } from './attendance.controller';
import { LeaveService } from './leave.service';
import { LeaveController } from './leave.controller';
import { DocumentTypesService } from './document-types.service';
import { DocumentTypesController } from './document-types.controller';
import { EmployeeDocumentsService } from './employee-documents.service';
import { EmployeeDocumentsController } from './employee-documents.controller';

import { RbacModule } from '../rbac/rbac.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Department,
      Position,
      Employee,
      ShiftTemplate,
      RosterPeriod,
      Shift,
      ShiftAssignment,
      Attendance,
      Leave,
      DocumentType,
      EmployeeDocument,
    ]),
    RbacModule,
  ],
  controllers: [
    DepartmentsController,
    PositionsController,
    EmployeesController,
    ShiftTemplatesController,
    RosterPeriodsController,
    ShiftsController,
    ShiftAssignmentsController,
    AttendanceController,
    LeaveController,
    DocumentTypesController,
    EmployeeDocumentsController,
  ],
  providers: [
    DepartmentsService,
    PositionsService,
    EmployeesService,
    ShiftTemplatesService,
    RosterPeriodsService,
    ShiftsService,
    ShiftAssignmentsService,
    AttendanceService,
    LeaveService,
    DocumentTypesService,
    EmployeeDocumentsService,
  ],
  exports: [TypeOrmModule, EmployeesService],
})
export class RosterModule {}
