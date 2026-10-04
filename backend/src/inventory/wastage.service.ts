import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Wastage } from './wastage.entity';
import { WastageStatus } from './wastage.enums';
import { StockMovementType } from './stock-movement.enum';
import { StockLedgerService } from './stock-ledger.service';
import { CreateWastageDto } from './dto/create-wastage.dto';

@Injectable()
export class WastageService {
  constructor(
    @InjectRepository(Wastage)
    private readonly wastageRepository: Repository<Wastage>,
    private readonly stockLedger: StockLedgerService,
  ) {}

  findAll(): Promise<Wastage[]> {
    return this.wastageRepository.find({
      relations: { item: true, warehouse: true },
      order: { id: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Wastage> {
    const wastage = await this.wastageRepository.findOne({
      where: { id },
      relations: { item: true, warehouse: true },
    });
    if (!wastage) {
      throw new NotFoundException('Wastage request not found');
    }
    return wastage;
  }

  create(dto: CreateWastageDto, requestedBy: string): Promise<Wastage> {
    return this.wastageRepository.save(
      this.wastageRepository.create({ ...dto, requested_by: requestedBy }),
    );
  }

  // Approving deducts stock via the ledger; rejecting just closes the
  // request with no stock effect. See docs/inventory-management-design.md.
  async decide(
    id: string,
    approve: boolean,
    approverId: string,
  ): Promise<Wastage> {
    const wastage = await this.findOne(id);
    if (wastage.status !== WastageStatus.PENDING) {
      throw new BadRequestException(
        'This wastage request has already been decided',
      );
    }

    if (approve) {
      await this.stockLedger.applyMovement({
        itemId: wastage.item_id,
        warehouseId: wastage.warehouse_id,
        type: StockMovementType.WASTAGE,
        quantity: wastage.quantity,
        referenceType: 'wastage',
        referenceId: wastage.id,
        performedBy: approverId,
      });
    }

    wastage.status = approve ? WastageStatus.APPROVED : WastageStatus.REJECTED;
    wastage.approved_by = approverId;
    return this.wastageRepository.save(wastage);
  }
}
