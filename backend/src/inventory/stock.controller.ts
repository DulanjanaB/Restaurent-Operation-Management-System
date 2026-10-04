import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { StockService } from './stock.service';
import { StockInDto } from './dto/stock-in.dto';
import { StockOutDto } from './dto/stock-out.dto';
import { StockAdjustmentDto } from './dto/stock-adjustment.dto';
import { PermissionsGuard } from '../rbac/permissions.guard';
import { RequirePermissions } from '../rbac/require-permissions.decorator';
import { CurrentUser } from '../auth/current-user.decorator';
import { User } from '../users/user.entity';
import { StockMovementType } from './stock-movement.enum';

@UseGuards(PermissionsGuard)
@Controller('inventory')
export class StockController {
  constructor(private readonly stockService: StockService) {}

  @RequirePermissions('inventory.view')
  @Get('stock')
  findStock(
    @Query('warehouse_id') warehouseId?: string,
    @Query('item_id') itemId?: string,
  ) {
    return this.stockService.findStock(warehouseId, itemId);
  }

  @RequirePermissions('inventory.view')
  @Get('stock-movements')
  findMovements(
    @Query('item_id') itemId?: string,
    @Query('warehouse_id') warehouseId?: string,
    @Query('type') type?: StockMovementType,
  ) {
    return this.stockService.findMovements(itemId, warehouseId, type);
  }

  @RequirePermissions('inventory.view')
  @Get('stock-batches')
  findBatches(
    @Query('item_id') itemId?: string,
    @Query('warehouse_id') warehouseId?: string,
  ) {
    return this.stockService.findBatches(itemId, warehouseId);
  }

  @RequirePermissions('inventory.stock_in')
  @Post('stock-in')
  stockIn(@Body() dto: StockInDto, @CurrentUser() actor: User) {
    return this.stockService.stockIn(dto, actor.id);
  }

  @RequirePermissions('inventory.stock_out')
  @Post('stock-out')
  stockOut(@Body() dto: StockOutDto, @CurrentUser() actor: User) {
    return this.stockService.stockOut(dto, actor.id);
  }

  @RequirePermissions('inventory.stock_adjustment')
  @Post('stock-adjustment')
  adjust(@Body() dto: StockAdjustmentDto, @CurrentUser() actor: User) {
    return this.stockService.adjust(dto, actor.id);
  }
}
