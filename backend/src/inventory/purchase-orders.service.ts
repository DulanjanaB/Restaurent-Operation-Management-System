import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PurchaseOrder } from './purchase-order.entity';
import { PurchaseOrderItem } from './purchase-order-item.entity';
import { PurchaseOrderStatus } from './purchase-order.enum';
import { Item } from './item.entity';
import { StockBatch } from './stock-batch.entity';
import { StockMovementType } from './stock-movement.enum';
import { StockLedgerService } from './stock-ledger.service';
import { CreatePurchaseOrderDto } from './dto/create-purchase-order.dto';
import { ReceivePurchaseOrderDto } from './dto/receive-purchase-order.dto';

@Injectable()
export class PurchaseOrdersService {
  constructor(
    @InjectRepository(PurchaseOrder)
    private readonly purchaseOrdersRepository: Repository<PurchaseOrder>,
    @InjectRepository(PurchaseOrderItem)
    private readonly purchaseOrderItemsRepository: Repository<PurchaseOrderItem>,
    @InjectRepository(Item)
    private readonly itemsRepository: Repository<Item>,
    @InjectRepository(StockBatch)
    private readonly stockBatchesRepository: Repository<StockBatch>,
    private readonly stockLedger: StockLedgerService,
  ) {}

  findAll(): Promise<PurchaseOrder[]> {
    return this.purchaseOrdersRepository.find({
      relations: { branch: true, supplier: true },
      order: { order_date: 'DESC' },
    });
  }

  async findOne(
    id: string,
  ): Promise<PurchaseOrder & { items: PurchaseOrderItem[] }> {
    const order = await this.purchaseOrdersRepository.findOne({
      where: { id },
      relations: { branch: true, supplier: true },
    });
    if (!order) {
      throw new NotFoundException('Purchase order not found');
    }
    const items = await this.purchaseOrderItemsRepository.find({
      where: { purchase_order_id: id },
      relations: { item: true },
    });
    return { ...order, items };
  }

  async create(
    dto: CreatePurchaseOrderDto,
    createdBy: string,
  ): Promise<PurchaseOrder> {
    const order = await this.purchaseOrdersRepository.save(
      this.purchaseOrdersRepository.create({
        branch_id: dto.branch_id,
        supplier_id: dto.supplier_id,
        order_date: dto.order_date,
        expected_date: dto.expected_date ?? null,
        created_by: createdBy,
      }),
    );

    await this.purchaseOrderItemsRepository.save(
      dto.items.map((line) =>
        this.purchaseOrderItemsRepository.create({
          purchase_order_id: order.id,
          item_id: line.item_id,
          quantity_ordered: line.quantity_ordered,
          unit_price: line.unit_price,
        }),
      ),
    );

    return order;
  }

  async submit(id: string): Promise<PurchaseOrder> {
    const order = await this.requireStatus(id, PurchaseOrderStatus.DRAFT);
    order.status = PurchaseOrderStatus.SUBMITTED;
    return this.purchaseOrdersRepository.save(order);
  }

  async approve(id: string, approverId: string): Promise<PurchaseOrder> {
    const order = await this.requireStatus(id, PurchaseOrderStatus.SUBMITTED);
    order.status = PurchaseOrderStatus.APPROVED;
    order.approved_by = approverId;
    return this.purchaseOrdersRepository.save(order);
  }

  async cancel(id: string): Promise<PurchaseOrder> {
    const order = await this.getOrder(id);
    if (
      order.status === PurchaseOrderStatus.RECEIVED ||
      order.status === PurchaseOrderStatus.PARTIALLY_RECEIVED
    ) {
      throw new BadRequestException(
        'A purchase order with received stock cannot be cancelled',
      );
    }
    order.status = PurchaseOrderStatus.CANCELLED;
    return this.purchaseOrdersRepository.save(order);
  }

  // Records a delivery (full or partial) — writes stock_in movements (and
  // StockBatch rows for track_expiry items), then recomputes the order's
  // status from how much of each line has now been received. See
  // docs/inventory-management-design.md's Procurement section.
  async receive(
    id: string,
    dto: ReceivePurchaseOrderDto,
    performedBy: string,
  ): Promise<PurchaseOrder> {
    const order = await this.getOrder(id);
    if (
      order.status !== PurchaseOrderStatus.APPROVED &&
      order.status !== PurchaseOrderStatus.PARTIALLY_RECEIVED
    ) {
      throw new BadRequestException(
        `Purchase order must be approved or partially received (currently ${order.status})`,
      );
    }

    for (const line of dto.lines) {
      const orderItem = await this.purchaseOrderItemsRepository.findOne({
        where: { id: line.purchase_order_item_id, purchase_order_id: id },
      });
      if (!orderItem) {
        throw new NotFoundException(
          `Purchase order item ${line.purchase_order_item_id} not found on this order`,
        );
      }

      const alreadyReceived = Number(orderItem.quantity_received);
      const receivingNow = Number(line.quantity_received);
      const ordered = Number(orderItem.quantity_ordered);
      if (alreadyReceived + receivingNow > ordered) {
        throw new BadRequestException(
          `Receiving ${line.quantity_received} would exceed the ${orderItem.quantity_ordered} ordered for item ${orderItem.item_id}`,
        );
      }

      const item = await this.itemsRepository.findOne({
        where: { id: orderItem.item_id },
      });
      let stockBatchId: string | undefined;
      if (item?.track_expiry) {
        if (!line.batch_no || !line.expiry_date) {
          throw new BadRequestException(
            'batch_no and expiry_date are required for items that track expiry',
          );
        }
        const batch = await this.stockBatchesRepository.save(
          this.stockBatchesRepository.create({
            item_id: orderItem.item_id,
            warehouse_id: dto.warehouse_id,
            batch_no: line.batch_no,
            quantity: line.quantity_received,
            expiry_date: line.expiry_date,
            received_at: new Date().toISOString().slice(0, 10),
          }),
        );
        stockBatchId = batch.id;
      }

      await this.stockLedger.applyMovement({
        itemId: orderItem.item_id,
        warehouseId: dto.warehouse_id,
        type: StockMovementType.STOCK_IN,
        quantity: line.quantity_received,
        stockBatchId,
        referenceType: 'purchase_order',
        referenceId: order.id,
        performedBy,
      });

      orderItem.quantity_received = (alreadyReceived + receivingNow).toFixed(3);
      await this.purchaseOrderItemsRepository.save(orderItem);
    }

    const allItems = await this.purchaseOrderItemsRepository.find({
      where: { purchase_order_id: id },
    });
    const fullyReceived = allItems.every(
      (item) => Number(item.quantity_received) >= Number(item.quantity_ordered),
    );
    order.status = fullyReceived
      ? PurchaseOrderStatus.RECEIVED
      : PurchaseOrderStatus.PARTIALLY_RECEIVED;
    return this.purchaseOrdersRepository.save(order);
  }

  private async getOrder(id: string): Promise<PurchaseOrder> {
    const order = await this.purchaseOrdersRepository.findOne({
      where: { id },
    });
    if (!order) {
      throw new NotFoundException('Purchase order not found');
    }
    return order;
  }

  private async requireStatus(
    id: string,
    status: PurchaseOrderStatus,
  ): Promise<PurchaseOrder> {
    const order = await this.getOrder(id);
    if (order.status !== status) {
      throw new BadRequestException(
        `Purchase order must be ${status} for this action (currently ${order.status})`,
      );
    }
    return order;
  }
}
