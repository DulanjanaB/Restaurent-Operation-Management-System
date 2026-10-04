import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StockTransfer } from './stock-transfer.entity';
import { StockTransferItem } from './stock-transfer-item.entity';
import { StockTransferStatus } from './stock-transfer.enum';
import { StockMovementType } from './stock-movement.enum';
import { StockLedgerService } from './stock-ledger.service';
import { CreateStockTransferDto } from './dto/create-stock-transfer.dto';

@Injectable()
export class StockTransfersService {
  constructor(
    @InjectRepository(StockTransfer)
    private readonly stockTransfersRepository: Repository<StockTransfer>,
    @InjectRepository(StockTransferItem)
    private readonly stockTransferItemsRepository: Repository<StockTransferItem>,
    private readonly stockLedger: StockLedgerService,
  ) {}

  findAll(): Promise<StockTransfer[]> {
    return this.stockTransfersRepository.find({
      relations: { from_warehouse: true, to_warehouse: true },
      order: { id: 'DESC' },
    });
  }

  async findOne(
    id: string,
  ): Promise<StockTransfer & { items: StockTransferItem[] }> {
    const transfer = await this.stockTransfersRepository.findOne({
      where: { id },
      relations: { from_warehouse: true, to_warehouse: true },
    });
    if (!transfer) {
      throw new NotFoundException('Stock transfer not found');
    }
    const items = await this.stockTransferItemsRepository.find({
      where: { stock_transfer_id: id },
      relations: { item: true },
    });
    return { ...transfer, items };
  }

  async create(
    dto: CreateStockTransferDto,
    requestedBy: string,
  ): Promise<StockTransfer> {
    if (dto.from_warehouse_id === dto.to_warehouse_id) {
      throw new BadRequestException(
        'from_warehouse_id and to_warehouse_id must differ',
      );
    }

    const transfer = await this.stockTransfersRepository.save(
      this.stockTransfersRepository.create({
        from_warehouse_id: dto.from_warehouse_id,
        to_warehouse_id: dto.to_warehouse_id,
        requested_by: requestedBy,
      }),
    );

    await this.stockTransferItemsRepository.save(
      dto.items.map((line) =>
        this.stockTransferItemsRepository.create({
          stock_transfer_id: transfer.id,
          item_id: line.item_id,
          quantity: line.quantity,
        }),
      ),
    );

    return transfer;
  }

  async approve(id: string, approverId: string): Promise<StockTransfer> {
    const transfer = await this.requireStatus(id, StockTransferStatus.PENDING);
    transfer.status = StockTransferStatus.APPROVED;
    transfer.approved_by = approverId;
    return this.stockTransfersRepository.save(transfer);
  }

  async cancel(id: string): Promise<StockTransfer> {
    const transfer = await this.stockTransfersRepository.findOne({
      where: { id },
    });
    if (!transfer) {
      throw new NotFoundException('Stock transfer not found');
    }
    if (transfer.status === StockTransferStatus.COMPLETED) {
      throw new BadRequestException('A completed transfer cannot be cancelled');
    }
    transfer.status = StockTransferStatus.CANCELLED;
    return this.stockTransfersRepository.save(transfer);
  }

  // Writes the actual transfer_out / transfer_in StockMovements — see
  // docs/inventory-management-design.md's StockTransfer note.
  async complete(id: string, performedBy: string): Promise<StockTransfer> {
    const transfer = await this.requireStatus(id, StockTransferStatus.APPROVED);
    const items = await this.stockTransferItemsRepository.find({
      where: { stock_transfer_id: id },
    });

    for (const line of items) {
      await this.stockLedger.applyMovement({
        itemId: line.item_id,
        warehouseId: transfer.from_warehouse_id,
        type: StockMovementType.TRANSFER_OUT,
        quantity: line.quantity,
        referenceType: 'stock_transfer',
        referenceId: transfer.id,
        performedBy,
      });
      await this.stockLedger.applyMovement({
        itemId: line.item_id,
        warehouseId: transfer.to_warehouse_id,
        type: StockMovementType.TRANSFER_IN,
        quantity: line.quantity,
        referenceType: 'stock_transfer',
        referenceId: transfer.id,
        performedBy,
      });
    }

    transfer.status = StockTransferStatus.COMPLETED;
    return this.stockTransfersRepository.save(transfer);
  }

  private async requireStatus(
    id: string,
    status: StockTransferStatus,
  ): Promise<StockTransfer> {
    const transfer = await this.stockTransfersRepository.findOne({
      where: { id },
    });
    if (!transfer) {
      throw new NotFoundException('Stock transfer not found');
    }
    if (transfer.status !== status) {
      throw new BadRequestException(
        `Stock transfer must be ${status} for this action (currently ${transfer.status})`,
      );
    }
    return transfer;
  }
}
