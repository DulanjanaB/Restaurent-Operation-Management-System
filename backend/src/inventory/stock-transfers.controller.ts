import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { StockTransfersService } from './stock-transfers.service';
import { CreateStockTransferDto } from './dto/create-stock-transfer.dto';
import { PermissionsGuard } from '../rbac/permissions.guard';
import { RequirePermissions } from '../rbac/require-permissions.decorator';
import { CurrentUser } from '../auth/current-user.decorator';
import { User } from '../users/user.entity';

@UseGuards(PermissionsGuard)
@Controller('inventory/transfers')
export class StockTransfersController {
  constructor(private readonly stockTransfersService: StockTransfersService) {}

  @RequirePermissions('inventory.view')
  @Get()
  findAll() {
    return this.stockTransfersService.findAll();
  }

  @RequirePermissions('inventory.view')
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.stockTransfersService.findOne(id);
  }

  @RequirePermissions('inventory.transfer')
  @Post()
  create(@Body() dto: CreateStockTransferDto, @CurrentUser() actor: User) {
    return this.stockTransfersService.create(dto, actor.id);
  }

  @RequirePermissions('inventory.approve')
  @Post(':id/approve')
  approve(@Param('id') id: string, @CurrentUser() actor: User) {
    return this.stockTransfersService.approve(id, actor.id);
  }

  @RequirePermissions('inventory.transfer')
  @Post(':id/complete')
  complete(@Param('id') id: string, @CurrentUser() actor: User) {
    return this.stockTransfersService.complete(id, actor.id);
  }

  @RequirePermissions('inventory.transfer')
  @Post(':id/cancel')
  cancel(@Param('id') id: string) {
    return this.stockTransfersService.cancel(id);
  }
}
