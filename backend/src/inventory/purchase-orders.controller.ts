import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { PurchaseOrdersService } from './purchase-orders.service';
import { CreatePurchaseOrderDto } from './dto/create-purchase-order.dto';
import { ReceivePurchaseOrderDto } from './dto/receive-purchase-order.dto';
import { PermissionsGuard } from '../rbac/permissions.guard';
import { RequirePermissions } from '../rbac/require-permissions.decorator';
import { CurrentUser } from '../auth/current-user.decorator';
import { User } from '../users/user.entity';

@UseGuards(PermissionsGuard)
@Controller('inventory/purchase-orders')
export class PurchaseOrdersController {
  constructor(private readonly purchaseOrdersService: PurchaseOrdersService) {}

  @RequirePermissions('inventory.view')
  @Get()
  findAll() {
    return this.purchaseOrdersService.findAll();
  }

  @RequirePermissions('inventory.view')
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.purchaseOrdersService.findOne(id);
  }

  @RequirePermissions('inventory.manage_purchase_orders')
  @Post()
  create(@Body() dto: CreatePurchaseOrderDto, @CurrentUser() actor: User) {
    return this.purchaseOrdersService.create(dto, actor.id);
  }

  @RequirePermissions('inventory.manage_purchase_orders')
  @Post(':id/submit')
  submit(@Param('id') id: string) {
    return this.purchaseOrdersService.submit(id);
  }

  @RequirePermissions('inventory.approve')
  @Post(':id/approve')
  approve(@Param('id') id: string, @CurrentUser() actor: User) {
    return this.purchaseOrdersService.approve(id, actor.id);
  }

  @RequirePermissions('inventory.manage_purchase_orders')
  @Post(':id/cancel')
  cancel(@Param('id') id: string) {
    return this.purchaseOrdersService.cancel(id);
  }

  @RequirePermissions('inventory.manage_purchase_orders')
  @Post(':id/receive')
  receive(
    @Param('id') id: string,
    @Body() dto: ReceivePurchaseOrderDto,
    @CurrentUser() actor: User,
  ) {
    return this.purchaseOrdersService.receive(id, dto, actor.id);
  }
}
