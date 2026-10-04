import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { Request } from 'express';
import { TipPayoutsService } from './tip-payouts.service';
import { TipEmployeeAccessService } from './tip-employee-access.service';
import { PayoutDto } from './dto/payout.dto';
import { PermissionsGuard } from '../rbac/permissions.guard';
import { RequirePermissions } from '../rbac/require-permissions.decorator';
import { CurrentUser } from '../auth/current-user.decorator';
import { User } from '../users/user.entity';

@UseGuards(PermissionsGuard)
@Controller('tip')
export class TipEmployeesController {
  constructor(
    private readonly tipPayoutsService: TipPayoutsService,
    private readonly tipEmployeeAccess: TipEmployeeAccessService,
  ) {}

  // Self-service — always "your own," no permission needed.
  @Get('my-balance')
  async myBalance(@CurrentUser() actor: User) {
    const employeeId = await this.tipEmployeeAccess.resolveOwnEmployeeId(actor);
    return this.tipPayoutsService.getBalance(employeeId);
  }

  @Get('my-allocations')
  async myAllocations(@CurrentUser() actor: User) {
    const employeeId = await this.tipEmployeeAccess.resolveOwnEmployeeId(actor);
    return this.tipPayoutsService.getAllocationHistory(employeeId);
  }

  // Self-or-tip.view — no @RequirePermissions here since the requirement
  // depends on whose data it is; checked inside TipEmployeeAccessService.
  @Get('employees/:employeeId/balance')
  async balance(
    @Param('employeeId') employeeId: string,
    @CurrentUser() actor: User,
    @Req() request: Request,
  ) {
    await this.tipEmployeeAccess.assertCanAccess(employeeId, actor, request);
    return this.tipPayoutsService.getBalance(employeeId);
  }

  @Get('employees/:employeeId/allocations')
  async allocations(
    @Param('employeeId') employeeId: string,
    @CurrentUser() actor: User,
    @Req() request: Request,
  ) {
    await this.tipEmployeeAccess.assertCanAccess(employeeId, actor, request);
    return this.tipPayoutsService.getAllocationHistory(employeeId);
  }

  @Get('employees/:employeeId/payouts')
  async payouts(
    @Param('employeeId') employeeId: string,
    @CurrentUser() actor: User,
    @Req() request: Request,
  ) {
    await this.tipEmployeeAccess.assertCanAccess(employeeId, actor, request);
    return this.tipPayoutsService.listPayouts(employeeId);
  }

  @RequirePermissions('tip.payout')
  @Post('employees/:employeeId/payout')
  payout(
    @Param('employeeId') employeeId: string,
    @Body() dto: PayoutDto,
    @CurrentUser() actor: User,
  ) {
    return this.tipPayoutsService.payout(employeeId, actor.id, dto.notes);
  }
}
