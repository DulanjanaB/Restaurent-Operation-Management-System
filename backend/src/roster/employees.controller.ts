import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { EmployeesService } from './employees.service';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import { PermissionsGuard } from '../rbac/permissions.guard';
import { RequirePermissions } from '../rbac/require-permissions.decorator';
import { CurrentUser } from '../auth/current-user.decorator';
import { User } from '../users/user.entity';

@UseGuards(PermissionsGuard)
@Controller('roster/employees')
export class EmployeesController {
  constructor(private readonly employeesService: EmployeesService) {}

  @RequirePermissions('roster.view')
  @Get()
  findAll(@Query('branch_id') branchId?: string) {
    return this.employeesService.findAll(branchId);
  }

  // Authenticated only, no roster.view needed — the self-service exception
  // for Employee Documents (view/upload your OWN documents, no permission
  // required) is otherwise unreachable: the page needs its employee_id
  // from somewhere, and GET /roster/employees/:id itself requires
  // roster.view. Must be registered before ':id' or that route would
  // swallow "me" as a literal id. See docs/roster-management-design.md's
  // self-service note.
  @Get('me')
  async findMine(@CurrentUser() actor: User) {
    const employee = await this.employeesService.findByUserId(actor.id);
    if (!employee) {
      throw new NotFoundException(
        'No employee record is linked to your account',
      );
    }
    return employee;
  }

  @RequirePermissions('roster.view')
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.employeesService.findOne(id);
  }

  @RequirePermissions('roster.create')
  @Post()
  create(@Body() dto: CreateEmployeeDto) {
    return this.employeesService.create(dto);
  }

  @RequirePermissions('roster.update')
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateEmployeeDto) {
    return this.employeesService.update(id, dto);
  }

  @RequirePermissions('roster.delete')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.employeesService.remove(id);
  }
}
