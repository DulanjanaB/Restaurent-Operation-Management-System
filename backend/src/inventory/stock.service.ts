import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Stock } from './stock.entity';
import { StockBatch } from './stock-batch.entity';
import { StockMovement } from './stock-movement.entity';
import { StockMovementType } from './stock-movement.enum';
import { Item } from './item.entity';
import { StockLedgerService } from './stock-ledger.service';
import { StockInDto } from './dto/stock-in.dto';
import { StockOutDto } from './dto/stock-out.dto';
import { StockAdjustmentDto } from './dto/stock-adjustment.dto';

type StockStatus = 'available' | 'low_stock' | 'out_of_stock';

@Injectable()
export class StockService {
  constructor(
    @InjectRepository(Stock)
    private readonly stockRepository: Repository<Stock>,
    @InjectRepository(StockBatch)
    private readonly stockBatchesRepository: Repository<StockBatch>,
    @InjectRepository(StockMovement)
    private readonly stockMovementsRepository: Repository<StockMovement>,
    @InjectRepository(Item)
    private readonly itemsRepository: Repository<Item>,
    private readonly stockLedger: StockLedgerService,
  ) {}

  async findStock(warehouseId?: string, itemId?: string) {
    const rows = await this.stockRepository.find({
      where: {
        ...(warehouseId ? { warehouse_id: warehouseId } : {}),
        ...(itemId ? { item_id: itemId } : {}),
      },
      relations: { item: true, warehouse: true },
    });
    return rows.map((row) => ({ ...row, status: this.computeStatus(row) }));
  }

  findMovements(
    itemId?: string,
    warehouseId?: string,
    type?: StockMovementType,
  ) {
    return this.stockMovementsRepository.find({
      where: {
        ...(itemId ? { item_id: itemId } : {}),
        ...(warehouseId ? { warehouse_id: warehouseId } : {}),
        ...(type ? { type } : {}),
      },
      order: { occurred_at: 'DESC' },
    });
  }

  findBatches(itemId?: string, warehouseId?: string) {
    return this.stockBatchesRepository.find({
      where: {
        ...(itemId ? { item_id: itemId } : {}),
        ...(warehouseId ? { warehouse_id: warehouseId } : {}),
      },
      order: { expiry_date: 'ASC' },
    });
  }

  async stockIn(dto: StockInDto, performedBy: string) {
    const item = await this.getItem(dto.item_id);

    let stockBatchId: string | undefined;
    if (item.track_expiry) {
      if (!dto.batch_no || !dto.expiry_date) {
        throw new BadRequestException(
          'batch_no and expiry_date are required for items that track expiry',
        );
      }
      const batch = await this.stockBatchesRepository.save(
        this.stockBatchesRepository.create({
          item_id: dto.item_id,
          warehouse_id: dto.warehouse_id,
          batch_no: dto.batch_no,
          quantity: dto.quantity,
          expiry_date: dto.expiry_date,
          received_at: new Date().toISOString().slice(0, 10),
        }),
      );
      stockBatchId = batch.id;
    }

    return this.stockLedger.applyMovement({
      itemId: dto.item_id,
      warehouseId: dto.warehouse_id,
      type: StockMovementType.STOCK_IN,
      quantity: dto.quantity,
      stockBatchId,
      referenceType: 'manual',
      performedBy,
    });
  }

  stockOut(dto: StockOutDto, performedBy: string) {
    return this.stockLedger.applyMovement({
      itemId: dto.item_id,
      warehouseId: dto.warehouse_id,
      type: StockMovementType.STOCK_OUT,
      quantity: dto.quantity,
      referenceType: dto.reference_type ?? 'manual',
      referenceId: dto.reference_id,
      performedBy,
    });
  }

  async adjust(dto: StockAdjustmentDto, performedBy: string) {
    const stock = await this.stockRepository.findOne({
      where: { item_id: dto.item_id, warehouse_id: dto.warehouse_id },
    });
    const currentQuantity = stock ? Number(stock.quantity) : 0;
    const newQuantity = Number(dto.new_quantity);
    const delta = newQuantity - currentQuantity;

    if (delta === 0) {
      throw new BadRequestException(
        'new_quantity matches the current quantity — nothing to adjust',
      );
    }

    return this.stockLedger.applyMovement({
      itemId: dto.item_id,
      warehouseId: dto.warehouse_id,
      type:
        delta > 0
          ? StockMovementType.ADJUSTMENT_INCREASE
          : StockMovementType.ADJUSTMENT_DECREASE,
      quantity: Math.abs(delta).toFixed(3),
      referenceType: 'manual_adjustment',
      performedBy,
    });
  }

  private async getItem(id: string): Promise<Item> {
    const item = await this.itemsRepository.findOne({ where: { id } });
    if (!item) {
      throw new NotFoundException('Item not found');
    }
    return item;
  }

  private computeStatus(stock: Stock): StockStatus {
    const quantity = Number(stock.quantity);
    const minimum = Number(stock.minimum_stock_level);
    if (quantity <= 0) return 'out_of_stock';
    if (quantity <= minimum) return 'low_stock';
    return 'available';
  }
}
