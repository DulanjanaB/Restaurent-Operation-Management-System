import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Category } from './category.entity';
import { Unit } from './unit.entity';
import { Supplier } from './supplier.entity';
import { Warehouse } from './warehouse.entity';
import { Item } from './item.entity';
import { Stock } from './stock.entity';
import { StockBatch } from './stock-batch.entity';
import { StockMovement } from './stock-movement.entity';
import { StockTransfer } from './stock-transfer.entity';
import { StockTransferItem } from './stock-transfer-item.entity';
import { Wastage } from './wastage.entity';
import { PurchaseOrder } from './purchase-order.entity';
import { PurchaseOrderItem } from './purchase-order-item.entity';
import { ItemRequest } from './item-request.entity';
import { ItemRequestItem } from './item-request-item.entity';

import { CategoriesService } from './categories.service';
import { CategoriesController } from './categories.controller';
import { UnitsService } from './units.service';
import { UnitsController } from './units.controller';
import { SuppliersService } from './suppliers.service';
import { SuppliersController } from './suppliers.controller';
import { WarehousesService } from './warehouses.service';
import { WarehousesController } from './warehouses.controller';
import { ItemsService } from './items.service';
import { ItemsController } from './items.controller';
import { StockLedgerService } from './stock-ledger.service';
import { StockService } from './stock.service';
import { StockController } from './stock.controller';
import { StockTransfersService } from './stock-transfers.service';
import { StockTransfersController } from './stock-transfers.controller';
import { WastageService } from './wastage.service';
import { WastageController } from './wastage.controller';
import { PurchaseOrdersService } from './purchase-orders.service';
import { PurchaseOrdersController } from './purchase-orders.controller';
import { ItemRequestsService } from './item-requests.service';
import { ItemRequestsController } from './item-requests.controller';

import { RbacModule } from '../rbac/rbac.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Category,
      Unit,
      Supplier,
      Warehouse,
      Item,
      Stock,
      StockBatch,
      StockMovement,
      StockTransfer,
      StockTransferItem,
      Wastage,
      PurchaseOrder,
      PurchaseOrderItem,
      ItemRequest,
      ItemRequestItem,
    ]),
    RbacModule,
  ],
  controllers: [
    CategoriesController,
    UnitsController,
    SuppliersController,
    WarehousesController,
    ItemsController,
    StockController,
    StockTransfersController,
    WastageController,
    PurchaseOrdersController,
    ItemRequestsController,
  ],
  providers: [
    CategoriesService,
    UnitsService,
    SuppliersService,
    WarehousesService,
    ItemsService,
    StockLedgerService,
    StockService,
    StockTransfersService,
    WastageService,
    PurchaseOrdersService,
    ItemRequestsService,
  ],
  exports: [
    TypeOrmModule,
    StockLedgerService,
    StockTransfersService,
    WastageService,
  ],
})
export class InventoryModule {}
