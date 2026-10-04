import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { EventExpensesService } from './event-expenses.service';
import { CreateEventExpenseDto } from './dto/create-event-expense.dto';
import { PermissionsGuard } from '../rbac/permissions.guard';
import { RequirePermissions } from '../rbac/require-permissions.decorator';

@UseGuards(PermissionsGuard)
@Controller('events/:eventId/expenses')
export class EventExpensesController {
  constructor(private readonly eventExpensesService: EventExpensesService) {}

  @RequirePermissions('event.view')
  @Get()
  findAll(@Param('eventId') eventId: string) {
    return this.eventExpensesService.findAll(eventId);
  }

  @RequirePermissions('event.manage_expenses')
  @Post()
  create(
    @Param('eventId') eventId: string,
    @Body() dto: CreateEventExpenseDto,
  ) {
    return this.eventExpensesService.create(eventId, dto);
  }

  @RequirePermissions('event.manage_expenses')
  @Delete(':expenseId')
  remove(
    @Param('eventId') eventId: string,
    @Param('expenseId') expenseId: string,
  ) {
    return this.eventExpensesService.remove(eventId, expenseId);
  }
}
