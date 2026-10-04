import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, LessThan, Repository } from 'typeorm';
import { BarStockCount } from './bar-stock-count.entity';
import { Stock } from '../inventory/stock.entity';
import { StockMovement } from '../inventory/stock-movement.entity';
import { StockMovementType } from '../inventory/stock-movement.enum';
import { CreateBarStockCountDto } from './dto/create-bar-stock-count.dto';

@Injectable()
export class BarStockCountsService {
  constructor(
    @InjectRepository(BarStockCount)
    private readonly countsRepository: Repository<BarStockCount>,
    @InjectRepository(Stock)
    private readonly stockRepository: Repository<Stock>,
    @InjectRepository(StockMovement)
    private readonly movementsRepository: Repository<StockMovement>,
  ) {}

  findAll(warehouseId?: string, itemId?: string): Promise<BarStockCount[]> {
    return this.countsRepository.find({
      where: {
        ...(warehouseId ? { warehouse_id: warehouseId } : {}),
        ...(itemId ? { item_id: itemId } : {}),
      },
      order: { counted_at: 'DESC' },
    });
  }

  create(
    dto: CreateBarStockCountDto,
    countedBy: string,
  ): Promise<BarStockCount> {
    return this.countsRepository.save(
      this.countsRepository.create({ ...dto, counted_by: countedBy }),
    );
  }

  // opening + stock_in − sold − wastage = expected_closing, compared
  // against a physical count to surface variance (over-pouring, spillage,
  // theft). See docs/bar-management-design.md#stock-reconciliation.
  async reconcile(
    warehouseId: string,
    itemId: string,
    dateFrom: string,
    dateTo: string,
  ) {
    // Strictly BEFORE date_from — a count dated exactly on date_from is a
    // candidate for actual_closing below, not a stand-in for opening.
    const openingCount = await this.countsRepository.findOne({
      where: {
        warehouse_id: warehouseId,
        item_id: itemId,
        counted_at: LessThan(dateFrom),
      },
      order: { counted_at: 'DESC' },
    });

    const movementsInRange = await this.movementsRepository.find({
      where: {
        item_id: itemId,
        warehouse_id: warehouseId,
        occurred_at: Between(
          new Date(`${dateFrom}T00:00:00.000Z`),
          new Date(`${dateTo}T23:59:59.999Z`),
        ),
      },
    });

    const sumByType = (types: StockMovementType[], filterReference?: string) =>
      movementsInRange
        .filter(
          (m) =>
            types.includes(m.type) &&
            (!filterReference || m.reference_type === filterReference),
        )
        .reduce((sum, m) => sum + Number(m.quantity), 0);

    const stockIn = sumByType([
      StockMovementType.STOCK_IN,
      StockMovementType.TRANSFER_IN,
    ]);
    const sold = sumByType([StockMovementType.STOCK_OUT], 'bar_sale');
    const wastage = sumByType([StockMovementType.WASTAGE]);

    let opening: number;
    if (openingCount) {
      // Real historical anchor — the usual case.
      opening = Number(openingCount.counted_quantity);
    } else {
      // No prior count to anchor on. Falling back to the CURRENT live
      // balance and adding this range's movements on top would
      // double-count them, since the live balance already reflects
      // everything up to now. Instead work backward: opening = current
      // balance minus this range's net movement, so opening + movements
      // lands back on the current balance — the only defensible "expected
      // closing" when there's no real starting point. See
      // docs/bar-management-design.md#stock-reconciliation.
      const currentStock = await this.stockRepository.findOne({
        where: { item_id: itemId, warehouse_id: warehouseId },
      });
      const currentQuantity = currentStock ? Number(currentStock.quantity) : 0;
      opening = currentQuantity - stockIn + sold + wastage;
    }

    const expectedClosing = opening + stockIn - sold - wastage;

    const actualCount = await this.countsRepository.findOne({
      where: {
        warehouse_id: warehouseId,
        item_id: itemId,
        counted_at: Between(dateFrom, dateTo),
      },
      order: { counted_at: 'DESC' },
    });

    return {
      warehouse_id: warehouseId,
      item_id: itemId,
      date_from: dateFrom,
      date_to: dateTo,
      opening: opening.toFixed(3),
      stock_in: stockIn.toFixed(3),
      sold: sold.toFixed(3),
      wastage: wastage.toFixed(3),
      expected_closing: expectedClosing.toFixed(3),
      actual_closing: actualCount ? actualCount.counted_quantity : null,
      variance: actualCount
        ? (Number(actualCount.counted_quantity) - expectedClosing).toFixed(3)
        : null,
    };
  }
}
