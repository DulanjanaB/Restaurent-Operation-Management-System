import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { EventsService } from './events.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { PermissionsGuard } from '../rbac/permissions.guard';
import { RequirePermissions } from '../rbac/require-permissions.decorator';
import { CurrentUser } from '../auth/current-user.decorator';
import { User } from '../users/user.entity';

@UseGuards(PermissionsGuard)
@Controller('events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @RequirePermissions('event.view')
  @Get()
  findAll(@Query('branch_id') branchId?: string) {
    return this.eventsService.findAll(branchId);
  }

  @RequirePermissions('event.view')
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.eventsService.findOne(id);
  }

  @RequirePermissions('event.view')
  @Get(':id/financials')
  getFinancials(@Param('id') id: string) {
    return this.eventsService.getFinancials(id);
  }

  @RequirePermissions('event.create')
  @Post()
  create(@Body() dto: CreateEventDto, @CurrentUser() actor: User) {
    return this.eventsService.create(dto, actor.id);
  }

  @RequirePermissions('event.update')
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateEventDto) {
    return this.eventsService.update(id, dto);
  }

  @RequirePermissions('event.delete')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.eventsService.remove(id);
  }

  @RequirePermissions('event.approve')
  @Post(':id/approve')
  approve(@Param('id') id: string) {
    return this.eventsService.approve(id);
  }

  @RequirePermissions('event.update_status')
  @Post(':id/complete')
  complete(@Param('id') id: string) {
    return this.eventsService.complete(id);
  }

  @RequirePermissions('event.update_status')
  @Post(':id/close')
  close(@Param('id') id: string) {
    return this.eventsService.close(id);
  }

  @RequirePermissions('event.update_status')
  @Post(':id/cancel')
  cancel(@Param('id') id: string) {
    return this.eventsService.cancel(id);
  }
}
