import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { BarSalesService } from './bar-sales.service';
import { CreateBarSaleDto } from './dto/create-bar-sale.dto';
import { PermissionsGuard } from '../rbac/permissions.guard';
import { RequirePermissions } from '../rbac/require-permissions.decorator';
import { CurrentUser } from '../auth/current-user.decorator';
import { User } from '../users/user.entity';

@UseGuards(PermissionsGuard)
@Controller('bar/sales')
export class BarSalesController {
  constructor(private readonly barSalesService: BarSalesService) {}

  @RequirePermissions('bar.view')
  @Get()
  findAll(@Query('warehouse_id') warehouseId?: string) {
    return this.barSalesService.findAll(warehouseId);
  }

  // Kept on bar.record_sale rather than bar.create — a bartender records
  // sales all shift but shouldn't necessarily create new recipes. See
  // docs/bar-management-design.md.
  @RequirePermissions('bar.record_sale')
  @Post()
  create(@Body() dto: CreateBarSaleDto, @CurrentUser() actor: User) {
    return this.barSalesService.create(dto, actor.id);
  }
}
