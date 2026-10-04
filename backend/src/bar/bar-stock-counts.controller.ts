import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { BarStockCountsService } from './bar-stock-counts.service';
import { CreateBarStockCountDto } from './dto/create-bar-stock-count.dto';
import { PermissionsGuard } from '../rbac/permissions.guard';
import { RequirePermissions } from '../rbac/require-permissions.decorator';
import { CurrentUser } from '../auth/current-user.decorator';
import { User } from '../users/user.entity';

@UseGuards(PermissionsGuard)
@Controller('bar/stock-counts')
export class BarStockCountsController {
  constructor(private readonly barStockCountsService: BarStockCountsService) {}

  @RequirePermissions('bar.view')
  @Get()
  findAll(
    @Query('warehouse_id') warehouseId?: string,
    @Query('item_id') itemId?: string,
  ) {
    return this.barStockCountsService.findAll(warehouseId, itemId);
  }

  @RequirePermissions('bar.count_stock')
  @Post()
  create(@Body() dto: CreateBarStockCountDto, @CurrentUser() actor: User) {
    return this.barStockCountsService.create(dto, actor.id);
  }

  @RequirePermissions('bar.report')
  @Get('reconciliation')
  reconcile(
    @Query('warehouse_id') warehouseId: string,
    @Query('item_id') itemId: string,
    @Query('date_from') dateFrom: string,
    @Query('date_to') dateTo: string,
  ) {
    return this.barStockCountsService.reconcile(
      warehouseId,
      itemId,
      dateFrom,
      dateTo,
    );
  }
}
