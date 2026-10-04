import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { EventInventoryRequirementsService } from './event-inventory-requirements.service';
import { CreateInventoryRequirementDto } from './dto/create-inventory-requirement.dto';
import { IssueInventoryDto } from './dto/issue-inventory.dto';
import { PermissionsGuard } from '../rbac/permissions.guard';
import { RequirePermissions } from '../rbac/require-permissions.decorator';
import { CurrentUser } from '../auth/current-user.decorator';
import { User } from '../users/user.entity';

@UseGuards(PermissionsGuard)
@Controller('events/:eventId/inventory-requirements')
export class EventInventoryRequirementsController {
  constructor(
    private readonly requirementsService: EventInventoryRequirementsService,
  ) {}

  @RequirePermissions('event.view')
  @Get()
  findAll(@Param('eventId') eventId: string) {
    return this.requirementsService.findAll(eventId);
  }

  @RequirePermissions('event.update')
  @Post()
  create(
    @Param('eventId') eventId: string,
    @Body() dto: CreateInventoryRequirementDto,
  ) {
    return this.requirementsService.create(eventId, dto);
  }

  @RequirePermissions('event.update')
  @Delete(':requirementId')
  remove(
    @Param('eventId') eventId: string,
    @Param('requirementId') requirementId: string,
  ) {
    return this.requirementsService.remove(eventId, requirementId);
  }

  // Actually pulling stock is an inventory action, not just an event-planning
  // one — gated on inventory.stock_out rather than an event.* permission.
  @RequirePermissions('inventory.stock_out')
  @Post(':requirementId/issue')
  issue(
    @Param('eventId') eventId: string,
    @Param('requirementId') requirementId: string,
    @Body() dto: IssueInventoryDto,
    @CurrentUser() actor: User,
  ) {
    return this.requirementsService.issue(
      eventId,
      requirementId,
      dto,
      actor.id,
    );
  }
}
