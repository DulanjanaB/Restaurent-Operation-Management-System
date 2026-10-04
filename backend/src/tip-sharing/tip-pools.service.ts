import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TipPool } from './tip-pool.entity';
import { TipAllocation } from './tip-allocation.entity';
import { TipPoolStatus } from './tip-pool-status.enum';
import { Attendance } from '../roster/attendance.entity';
import { AttendanceStatus } from '../roster/attendance.enum';
import { CreateTipPoolDto } from './dto/create-tip-pool.dto';
import { UpdateTipPoolDto } from './dto/update-tip-pool.dto';

// Amounts are done with plain JS number arithmetic — same pragmatic
// simplification as the Inventory module's stock ledger.
@Injectable()
export class TipPoolsService {
  constructor(
    @InjectRepository(TipPool)
    private readonly tipPoolsRepository: Repository<TipPool>,
    @InjectRepository(TipAllocation)
    private readonly tipAllocationsRepository: Repository<TipAllocation>,
    @InjectRepository(Attendance)
    private readonly attendanceRepository: Repository<Attendance>,
  ) {}

  findAll(branchId?: string): Promise<TipPool[]> {
    return this.tipPoolsRepository.find({
      where: branchId ? { branch_id: branchId } : {},
      order: { date: 'DESC' },
    });
  }

  async findOne(
    id: string,
  ): Promise<TipPool & { allocations: TipAllocation[] }> {
    const pool = await this.getPool(id);
    const allocations = await this.tipAllocationsRepository.find({
      where: { tip_pool_id: id },
      relations: { employee: true },
    });
    return { ...pool, allocations };
  }

  create(dto: CreateTipPoolDto, createdBy: string): Promise<TipPool> {
    return this.tipPoolsRepository.save(
      this.tipPoolsRepository.create({ ...dto, created_by: createdBy }),
    );
  }

  async updateTotalAmount(id: string, dto: UpdateTipPoolDto): Promise<TipPool> {
    const pool = await this.requireOpen(id);
    pool.total_amount = dto.total_amount;
    return this.tipPoolsRepository.save(pool);
  }

  async remove(id: string): Promise<void> {
    const pool = await this.requireOpen(id);
    await this.tipPoolsRepository.remove(pool);
  }

  // Attendance for that branch/date is a convenience default — the actual
  // participant set is whoever's explicitly added via addParticipant.
  // See docs/tip-sharing-design.md#calculation.
  async suggestedParticipants(id: string) {
    const pool = await this.getPool(id);
    const attendance = await this.attendanceRepository.find({
      where: [
        { date: pool.date, status: AttendanceStatus.PRESENT },
        { date: pool.date, status: AttendanceStatus.LATE },
      ],
      relations: { employee: true },
    });
    const alreadyAdded = new Set(
      (
        await this.tipAllocationsRepository.find({ where: { tip_pool_id: id } })
      ).map((a) => a.employee_id),
    );
    return attendance
      .filter(
        (a) =>
          a.employee.branch_id === pool.branch_id &&
          !alreadyAdded.has(a.employee_id),
      )
      .map((a) => a.employee);
  }

  async addParticipant(id: string, employeeId: string): Promise<TipAllocation> {
    await this.requireOpen(id);
    const existing = await this.tipAllocationsRepository.findOne({
      where: { tip_pool_id: id, employee_id: employeeId },
    });
    if (existing) {
      return existing;
    }
    return this.tipAllocationsRepository.save(
      this.tipAllocationsRepository.create({
        tip_pool_id: id,
        employee_id: employeeId,
        percentage: '100',
      }),
    );
  }

  async removeParticipant(id: string, allocationId: string): Promise<void> {
    await this.requireOpen(id);
    const allocation = await this.tipAllocationsRepository.findOne({
      where: { id: allocationId, tip_pool_id: id },
    });
    if (!allocation) {
      throw new NotFoundException('Participant not found in this pool');
    }
    await this.tipAllocationsRepository.remove(allocation);
  }

  async updatePercentage(
    id: string,
    allocationId: string,
    percentage: string,
  ): Promise<TipAllocation> {
    await this.requireOpen(id);
    const allocation = await this.tipAllocationsRepository.findOne({
      where: { id: allocationId, tip_pool_id: id },
    });
    if (!allocation) {
      throw new NotFoundException('Participant not found in this pool');
    }
    allocation.percentage = percentage;
    return this.tipAllocationsRepository.save(allocation);
  }

  // Locks in amounts: amount(employee) = total_amount * (percentage / SUM(percentage)).
  // Rounding remainder carries forward into the next day's pool for the
  // same branch — see docs/tip-sharing-design.md#calculation.
  async calculate(id: string, actorId: string): Promise<TipPool> {
    const pool = await this.requireOpen(id);
    const allocations = await this.tipAllocationsRepository.find({
      where: { tip_pool_id: id },
    });

    if (allocations.length === 0) {
      throw new BadRequestException(
        'Cannot calculate a pool with no participants',
      );
    }

    const totalAmount = Number(pool.total_amount);
    const sumPercentage = allocations.reduce(
      (sum, a) => sum + Number(a.percentage),
      0,
    );
    if (sumPercentage <= 0) {
      throw new BadRequestException(
        'Total percentage across participants must be greater than zero',
      );
    }

    let distributed = 0;
    for (const allocation of allocations) {
      const share = Number(
        (totalAmount * (Number(allocation.percentage) / sumPercentage)).toFixed(
          2,
        ),
      );
      allocation.amount = share.toFixed(2);
      distributed += share;
      await this.tipAllocationsRepository.save(allocation);
    }

    pool.status = TipPoolStatus.CALCULATED;
    pool.calculated_at = new Date();
    pool.calculated_by = actorId;
    await this.tipPoolsRepository.save(pool);

    const remainder = Number((totalAmount - distributed).toFixed(2));
    if (remainder > 0) {
      await this.carryRemainderForward(pool, remainder, actorId);
    }

    return pool;
  }

  private async carryRemainderForward(
    pool: TipPool,
    remainder: number,
    actorId: string,
  ): Promise<void> {
    const nextDate = new Date(pool.date);
    nextDate.setDate(nextDate.getDate() + 1);
    const nextDateStr = nextDate.toISOString().slice(0, 10);

    const nextPool = await this.tipPoolsRepository.findOne({
      where: { branch_id: pool.branch_id, date: nextDateStr },
    });

    if (nextPool) {
      nextPool.total_amount = (
        Number(nextPool.total_amount) + remainder
      ).toFixed(2);
      await this.tipPoolsRepository.save(nextPool);
    } else {
      await this.tipPoolsRepository.save(
        this.tipPoolsRepository.create({
          branch_id: pool.branch_id,
          date: nextDateStr,
          total_amount: remainder.toFixed(2),
          created_by: actorId,
        }),
      );
    }
  }

  private async getPool(id: string): Promise<TipPool> {
    const pool = await this.tipPoolsRepository.findOne({ where: { id } });
    if (!pool) {
      throw new NotFoundException('Tip pool not found');
    }
    return pool;
  }

  private async requireOpen(id: string): Promise<TipPool> {
    const pool = await this.getPool(id);
    if (pool.status !== TipPoolStatus.OPEN) {
      throw new BadRequestException(
        'This pool has already been calculated and is locked',
      );
    }
    return pool;
  }
}
