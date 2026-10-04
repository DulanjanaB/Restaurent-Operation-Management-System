import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WasteDisposal } from './waste-disposal.entity';
import { WasteDisposalStatus } from './waste-disposal.enums';
import { Batch } from './batch.entity';
import { BatchStatus } from './batch-status.enum';
import { CreateWasteDisposalDto } from './dto/create-waste-disposal.dto';

@Injectable()
export class WasteDisposalsService {
  constructor(
    @InjectRepository(WasteDisposal)
    private readonly wasteDisposalsRepository: Repository<WasteDisposal>,
    @InjectRepository(Batch)
    private readonly batchesRepository: Repository<Batch>,
  ) {}

  findAll(): Promise<WasteDisposal[]> {
    return this.wasteDisposalsRepository.find({
      relations: { batch: true },
      order: { id: 'DESC' },
    });
  }

  async findOne(id: string): Promise<WasteDisposal> {
    const disposal = await this.wasteDisposalsRepository.findOne({
      where: { id },
      relations: { batch: true },
    });
    if (!disposal) {
      throw new NotFoundException('Waste disposal request not found');
    }
    return disposal;
  }

  create(
    dto: CreateWasteDisposalDto,
    requestedBy: string,
  ): Promise<WasteDisposal> {
    return this.wasteDisposalsRepository.save(
      this.wasteDisposalsRepository.create({
        ...dto,
        requested_by: requestedBy,
      }),
    );
  }

  // Approving deducts Batch.quantity, and moves the batch to `disposed` if
  // it reaches zero. See docs/food-preservation-design.md's WasteDisposal
  // entity note.
  async decide(
    id: string,
    approve: boolean,
    approverId: string,
  ): Promise<WasteDisposal> {
    const disposal = await this.findOne(id);
    if (disposal.status !== WasteDisposalStatus.PENDING) {
      throw new BadRequestException(
        'This disposal request has already been decided',
      );
    }

    if (approve) {
      const batch = await this.batchesRepository.findOne({
        where: { id: disposal.batch_id },
      });
      if (!batch) {
        throw new NotFoundException('Batch not found');
      }

      const remaining = Number(batch.quantity) - Number(disposal.quantity);
      if (remaining < 0) {
        throw new BadRequestException(
          'Disposal quantity exceeds the batch’s remaining quantity',
        );
      }

      batch.quantity = remaining.toFixed(3);
      if (remaining === 0) {
        batch.status = BatchStatus.DISPOSED;
      }
      await this.batchesRepository.save(batch);

      disposal.disposed_at = new Date();
    }

    disposal.status = approve
      ? WasteDisposalStatus.APPROVED
      : WasteDisposalStatus.REJECTED;
    disposal.approved_by = approverId;
    return this.wasteDisposalsRepository.save(disposal);
  }
}
