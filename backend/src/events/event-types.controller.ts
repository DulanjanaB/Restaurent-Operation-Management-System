import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { EventTypesService } from './event-types.service';
import { CreateEventTypeDto } from './dto/create-event-type.dto';
import { UpdateEventTypeDto } from './dto/update-event-type.dto';
import { PermissionsGuard } from '../rbac/permissions.guard';
import { RequirePermissions } from '../rbac/require-permissions.decorator';

@UseGuards(PermissionsGuard)
@Controller('events/types')
export class EventTypesController {
  constructor(private readonly eventTypesService: EventTypesService) {}

  @RequirePermissions('event.view')
  @Get()
  findAll() {
    return this.eventTypesService.findAll();
  }

  @RequirePermissions('event.view')
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.eventTypesService.findOne(id);
  }

  @RequirePermissions('event.create')
  @Post()
  create(@Body() dto: CreateEventTypeDto) {
    return this.eventTypesService.create(dto);
  }

  @RequirePermissions('event.update')
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateEventTypeDto) {
    return this.eventTypesService.update(id, dto);
  }

  @RequirePermissions('event.delete')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.eventTypesService.remove(id);
  }
}
