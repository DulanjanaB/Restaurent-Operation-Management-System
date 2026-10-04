import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { Request } from 'express';
import { EmployeeDocumentsService } from './employee-documents.service';
import { CreateEmployeeDocumentDto } from './dto/create-employee-document.dto';
import { PermissionsGuard } from '../rbac/permissions.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { User } from '../users/user.entity';

// No @RequirePermissions here — access is self-or-permission, decided
// inside EmployeeDocumentsService. @UseGuards(PermissionsGuard) still
// authenticates the request even with no required permissions declared.
@UseGuards(PermissionsGuard)
@Controller('roster/employee-documents')
export class EmployeeDocumentsController {
  constructor(
    private readonly employeeDocumentsService: EmployeeDocumentsService,
  ) {}

  @Get()
  findAllForEmployee(
    @Query('employee_id') employeeId: string,
    @CurrentUser() actor: User,
    @Req() request: Request,
  ) {
    return this.employeeDocumentsService.findAllForEmployee(
      employeeId,
      actor,
      request,
    );
  }

  @Post()
  create(
    @Body() dto: CreateEmployeeDocumentDto,
    @CurrentUser() actor: User,
    @Req() request: Request,
  ) {
    return this.employeeDocumentsService.create(dto, actor, request);
  }

  @Delete(':id')
  remove(
    @Param('id') id: string,
    @CurrentUser() actor: User,
    @Req() request: Request,
  ) {
    return this.employeeDocumentsService.remove(id, actor, request);
  }
}
