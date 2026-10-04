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
import { TipPoolsService } from './tip-pools.service';
import { CreateTipPoolDto } from './dto/create-tip-pool.dto';
import { UpdateTipPoolDto } from './dto/update-tip-pool.dto';
import { AddParticipantDto } from './dto/add-participant.dto';
import { UpdatePercentageDto } from './dto/update-percentage.dto';
import { PermissionsGuard } from '../rbac/permissions.guard';
import { RequirePermissions } from '../rbac/require-permissions.decorator';
import { CurrentUser } from '../auth/current-user.decorator';
import { User } from '../users/user.entity';

@UseGuards(PermissionsGuard)
@Controller('tip/pools')
export class TipPoolsController {
  constructor(private readonly tipPoolsService: TipPoolsService) {}

  @RequirePermissions('tip.view')
  @Get()
  findAll(@Query('branch_id') branchId?: string) {
    return this.tipPoolsService.findAll(branchId);
  }

  @RequirePermissions('tip.view')
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.tipPoolsService.findOne(id);
  }

  @RequirePermissions('tip.view')
  @Get(':id/suggested-participants')
  suggestedParticipants(@Param('id') id: string) {
    return this.tipPoolsService.suggestedParticipants(id);
  }

  @RequirePermissions('tip.create')
  @Post()
  create(@Body() dto: CreateTipPoolDto, @CurrentUser() actor: User) {
    return this.tipPoolsService.create(dto, actor.id);
  }

  @RequirePermissions('tip.update')
  @Patch(':id')
  updateTotalAmount(@Param('id') id: string, @Body() dto: UpdateTipPoolDto) {
    return this.tipPoolsService.updateTotalAmount(id, dto);
  }

  @RequirePermissions('tip.delete')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.tipPoolsService.remove(id);
  }

  // Both opening a pool and adding participants to it are gated on
  // tip.create — see docs/tip-sharing-design.md's permission table.
  @RequirePermissions('tip.create')
  @Post(':id/participants')
  addParticipant(@Param('id') id: string, @Body() dto: AddParticipantDto) {
    return this.tipPoolsService.addParticipant(id, dto.employee_id);
  }

  @RequirePermissions('tip.update')
  @Patch(':id/participants/:allocationId')
  updatePercentage(
    @Param('id') id: string,
    @Param('allocationId') allocationId: string,
    @Body() dto: UpdatePercentageDto,
  ) {
    return this.tipPoolsService.updatePercentage(
      id,
      allocationId,
      dto.percentage,
    );
  }

  @RequirePermissions('tip.delete')
  @Delete(':id/participants/:allocationId')
  removeParticipant(
    @Param('id') id: string,
    @Param('allocationId') allocationId: string,
  ) {
    return this.tipPoolsService.removeParticipant(id, allocationId);
  }

  @RequirePermissions('tip.calculate')
  @Post(':id/calculate')
  calculate(@Param('id') id: string, @CurrentUser() actor: User) {
    return this.tipPoolsService.calculate(id, actor.id);
  }
}
