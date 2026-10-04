import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { Request } from 'express';
import { ChecklistRecordsService } from './checklist-records.service';
import { AnswerChecklistItemDto } from './dto/answer-checklist-item.dto';
import { ChecklistRecordStatus } from './checklist-record-status.enum';
import { PermissionsGuard } from '../rbac/permissions.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { User } from '../users/user.entity';

// No static @RequirePermissions on most routes — self-vs-permission is
// decided inside ChecklistRecordsService, same pattern as EmployeeDocument
// access and Tip Sharing balances. See docs/checklist-design.md#permissions.
@UseGuards(PermissionsGuard)
@Controller('checklist/records')
export class ChecklistRecordsController {
  constructor(private readonly recordsService: ChecklistRecordsService) {}

  // Self-service shortcut — today's (or a given date's) checklist for the
  // caller's own account. Also what the dashboard's incomplete-checklist
  // widget calls, filtered to status=pending.
  @Get('my')
  async myRecords(
    @CurrentUser() actor: User,
    @Query('status') status?: ChecklistRecordStatus,
    @Query('date') date?: string,
  ) {
    const employeeId = await this.recordsService.resolveOwnEmployeeId(actor);
    return this.recordsService.findAll({ employeeId, status, date });
  }

  @Get()
  async findAll(
    @Query('employee_id') employeeId: string | undefined,
    @Query('status') status: ChecklistRecordStatus | undefined,
    @Query('date') date: string | undefined,
    @CurrentUser() actor: User,
    @Req() request: Request,
  ) {
    await this.recordsService.assertCanList(employeeId, actor, request);
    return this.recordsService.findAll({ employeeId, status, date });
  }

  @Get(':id')
  async findOne(
    @Param('id') id: string,
    @CurrentUser() actor: User,
    @Req() request: Request,
  ) {
    await this.recordsService.assertCanAccess(
      id,
      actor,
      request,
      'checklist.view',
    );
    return this.recordsService.findOne(id);
  }

  @Post(':id/items/:itemId/answer')
  async answerItem(
    @Param('id') id: string,
    @Param('itemId') itemId: string,
    @Body() dto: AnswerChecklistItemDto,
    @CurrentUser() actor: User,
    @Req() request: Request,
  ) {
    await this.recordsService.assertCanAccess(
      id,
      actor,
      request,
      'checklist.complete',
    );
    return this.recordsService.answerItem(id, itemId, dto, actor);
  }
}
