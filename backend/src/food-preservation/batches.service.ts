import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, LessThan, LessThanOrEqual, Like, Repository } from 'typeorm';
import { AuditLogService } from '../audit-log/audit-log.service';
import { WasteDisposal } from './waste-disposal.entity';
import { buildBatchTimeline } from './batch-timeline';
import { Employee } from '../roster/employee.entity';
import { Batch } from './batch.entity';
import { BatchStatus } from './batch-status.enum';
import { PreservedItem } from './preserved-item.entity';
import { CreateBatchDto } from './dto/create-batch.dto';

@Injectable()
export class BatchesService {
  constructor(
    @InjectRepository(Batch)
    private readonly batchesRepository: Repository<Batch>,
    @InjectRepository(PreservedItem)
    private readonly preservedItemsRepository: Repository<PreservedItem>,
    @InjectRepository(Employee)
    private readonly employeesRepository: Repository<Employee>,
    @InjectRepository(WasteDisposal)
    private readonly wasteDisposalsRepository: Repository<WasteDisposal>,
    private readonly auditLogService: AuditLogService,
  ) {}

  // Chronological history of one batch: recorded, status changes, and the
  // disposal requests and decisions made on it. See batch-timeline.ts.
  async timeline(id: string) {
    const batch = await this.findOne(id);
    const disposals = await this.wasteDisposalsRepository.find({
      where: { batch_id: id },
    });
    const logs = await Promise.all([
      this.auditLogService.findAll({ entityType: 'Batch', entityId: id }),
      ...disposals.map((disposal) =>
        this.auditLogService.findAll({
          entityType: 'WasteDisposal',
          entityId: disposal.id,
        }),
      ),
    ]);
    return buildBatchTimeline(batch, logs.flat(), disposals);
  }

  async findAll(
    preservedItemId?: string,
    storageLocationId?: string,
  ): Promise<Batch[]> {
    await this.syncExpiredBatches();
    return this.batchesRepository.find({
      where: {
        ...(preservedItemId ? { preserved_item_id: preservedItemId } : {}),
        ...(storageLocationId
          ? { storage_location_id: storageLocationId }
          : {}),
      },
      relations: {
        preserved_item: true,
        storage_location: true,
        preparers: true,
      },
      order: { expiry_date: 'ASC' },
    });
  }

  async findOne(id: string): Promise<Batch> {
    await this.syncExpiredBatches();
    const batch = await this.batchesRepository.findOne({
      where: { id },
      relations: {
        preserved_item: true,
        storage_location: true,
        preparers: true,
      },
    });
    if (!batch) {
      throw new NotFoundException('Batch not found');
    }
    return batch;
  }

  // Not a stored entity — a query over `active` batches nearing expiry.
  // See docs/food-preservation-design.md#status.
  async expiryAlerts(thresholdDays = 3): Promise<Batch[]> {
    await this.syncExpiredBatches();
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() + thresholdDays);
    return this.batchesRepository.find({
      where: {
        status: BatchStatus.ACTIVE,
        expiry_date: LessThanOrEqual(cutoff.toISOString().slice(0, 10)),
      },
      relations: {
        preserved_item: true,
        storage_location: true,
        preparers: true,
      },
      order: { expiry_date: 'ASC' },
    });
  }

  async create(dto: CreateBatchDto, producedBy: string): Promise<Batch> {
    const preservedItem = await this.preservedItemsRepository.findOne({
      where: { id: dto.preserved_item_id },
    });
    if (!preservedItem) {
      throw new NotFoundException('Preserved item not found');
    }

    const { prepared_by_ids, ...fields } = dto;
    const preparers = await this.employeesRepository.find({
      where: { id: In(prepared_by_ids) },
    });
    if (preparers.length !== new Set(prepared_by_ids).size) {
      throw new BadRequestException('One or more preparers were not found');
    }

    const batchCode = await this.generateBatchCode(preservedItem);

    return this.batchesRepository.save(
      this.batchesRepository.create({
        ...fields,
        batch_code: batchCode,
        unit: preservedItem.default_unit,
        produced_by: producedBy,
        preparers,
      }),
    );
  }

  // active -> consumed, manual (food_preservation.update_status). The
  // active -> expired transition is automatic — see syncExpiredBatches.
  async markConsumed(id: string): Promise<Batch> {
    const batch = await this.getBatch(id);
    if (batch.status !== BatchStatus.ACTIVE) {
      throw new BadRequestException(
        `Only an active batch can be marked consumed (currently ${batch.status})`,
      );
    }
    batch.status = BatchStatus.CONSUMED;
    return this.batchesRepository.save(batch);
  }

  async markDisposed(id: string): Promise<Batch> {
    const batch = await this.getBatch(id);
    batch.status = BatchStatus.DISPOSED;
    return this.batchesRepository.save(batch);
  }

  private async getBatch(id: string): Promise<Batch> {
    const batch = await this.batchesRepository.findOne({ where: { id } });
    if (!batch) {
      throw new NotFoundException('Batch not found');
    }
    return batch;
  }

  // active -> expired happens automatically based on the date, not a
  // permission-gated action — run as a lazy sync on read rather than
  // needing a scheduled job. See docs/food-preservation-design.md#status.
  private async syncExpiredBatches(): Promise<void> {
    const today = new Date().toISOString().slice(0, 10);
    const expired = await this.batchesRepository.find({
      where: { status: BatchStatus.ACTIVE, expiry_date: LessThan(today) },
    });
    if (expired.length === 0) return;
    for (const batch of expired) batch.status = BatchStatus.EXPIRED;
    await this.batchesRepository.save(expired);
  }

  private async generateBatchCode(
    preservedItem: PreservedItem,
  ): Promise<string> {
    const year = new Date().getFullYear();
    const prefix = `${preservedItem.code}-${year}-`;
    const count = await this.batchesRepository.count({
      where: { batch_code: Like(`${prefix}%`) },
    });
    const sequence = String(count + 1).padStart(3, '0');
    return `${prefix}${sequence}`;
  }
}
