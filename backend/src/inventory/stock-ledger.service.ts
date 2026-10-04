import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { Stock } from './stock.entity';
import { StockMovement } from './stock-movement.entity';
import { StockMovementType } from './stock-movement.enum';

const INCREASING_TYPES = new Set<StockMovementType>([
  StockMovementType.STOCK_IN,
  StockMovementType.ADJUSTMENT_INCREASE,
  StockMovementType.TRANSFER_IN,
]);

export interface ApplyMovementParams {
  itemId: string;
  warehouseId: string;
  type: StockMovementType;
  quantity: string;
  stockBatchId?: string | null;
  referenceType?: string;
  referenceId?: string;
  performedBy: string;
}

// The one place that ever changes Stock.quantity — every stock-affecting
// action (manual in/out, adjustment, transfer, wastage, PO receipt) goes
// through here so the ledger and the balance can never drift apart. See
// docs/inventory-management-design.md's StockMovement note.
//
// Quantities are done with plain JS number arithmetic rather than a bignum
// library — a pragmatic simplification fine for typical inventory
// quantities, revisit if this ever needs to handle very large or
// high-precision values.
@Injectable()
export class StockLedgerService {
  constructor(
    @InjectRepository(Stock)
    private readonly stockRepository: Repository<Stock>,
    @InjectRepository(StockMovement)
    private readonly stockMovementsRepository: Repository<StockMovement>,
  ) {}

  // `manager` lets a caller that needs atomicity across several movements
  // (e.g. one bar sale deducting several ingredients) run them inside its
  // own transaction — otherwise a mid-loop failure leaves earlier
  // movements committed and the caller's own row (already saved) orphaned.
  // Defaults to the injected repositories for every existing call site.
  async applyMovement(
    params: ApplyMovementParams,
    manager?: EntityManager,
  ): Promise<StockMovement> {
    const stockRepository = manager
      ? manager.getRepository(Stock)
      : this.stockRepository;
    const stockMovementsRepository = manager
      ? manager.getRepository(StockMovement)
      : this.stockMovementsRepository;

    const quantity = Number(params.quantity);
    if (!(quantity > 0)) {
      throw new BadRequestException('quantity must be greater than zero');
    }

    const delta = INCREASING_TYPES.has(params.type) ? quantity : -quantity;

    let stock = await stockRepository.findOne({
      where: { item_id: params.itemId, warehouse_id: params.warehouseId },
    });
    if (!stock) {
      stock = stockRepository.create({
        item_id: params.itemId,
        warehouse_id: params.warehouseId,
        quantity: '0',
        minimum_stock_level: '0',
      });
    }

    const newQuantity = Number(stock.quantity) + delta;
    if (newQuantity < 0) {
      throw new BadRequestException('Insufficient stock for this movement');
    }

    stock.quantity = newQuantity.toFixed(3);
    await stockRepository.save(stock);

    return stockMovementsRepository.save(
      stockMovementsRepository.create({
        item_id: params.itemId,
        warehouse_id: params.warehouseId,
        stock_batch_id: params.stockBatchId ?? null,
        type: params.type,
        quantity: quantity.toFixed(3),
        reference_type: params.referenceType,
        reference_id: params.referenceId,
        performed_by: params.performedBy,
      }),
    );
  }
}
