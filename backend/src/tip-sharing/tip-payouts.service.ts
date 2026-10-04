import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Not, Repository } from 'typeorm';
import { TipAllocation } from './tip-allocation.entity';
import { TipPayout } from './tip-payout.entity';

@Injectable()
export class TipPayoutsService {
  constructor(
    @InjectRepository(TipAllocation)
    private readonly tipAllocationsRepository: Repository<TipAllocation>,
    @InjectRepository(TipPayout)
    private readonly tipPayoutsRepository: Repository<TipPayout>,
  ) {}

  // balance(employee) = SUM(TipAllocation.amount) WHERE employee_id = employee AND tip_payout_id IS NULL
  async getBalance(
    employeeId: string,
  ): Promise<{ employee_id: string; balance: string }> {
    const unpaid = await this.getUnpaidAllocations(employeeId);
    const balance = unpaid.reduce((sum, a) => sum + Number(a.amount ?? 0), 0);
    return { employee_id: employeeId, balance: balance.toFixed(2) };
  }

  getAllocationHistory(employeeId: string): Promise<TipAllocation[]> {
    return this.tipAllocationsRepository.find({
      where: { employee_id: employeeId },
      relations: { tip_pool: true },
      order: { id: 'DESC' },
    });
  }

  listPayouts(employeeId?: string): Promise<TipPayout[]> {
    return this.tipPayoutsRepository.find({
      where: employeeId ? { employee_id: employeeId } : {},
      order: { paid_at: 'DESC' },
    });
  }

  // Clears whatever's accumulated since the last payout — doesn't have to
  // happen daily. See docs/tip-sharing-design.md.
  async payout(
    employeeId: string,
    paidBy: string,
    notes: string | undefined,
  ): Promise<TipPayout> {
    const unpaid = await this.getUnpaidAllocations(employeeId);
    const balance = unpaid.reduce((sum, a) => sum + Number(a.amount ?? 0), 0);

    if (balance <= 0) {
      throw new BadRequestException('This employee has no unpaid tip balance');
    }

    const payout = await this.tipPayoutsRepository.save(
      this.tipPayoutsRepository.create({
        employee_id: employeeId,
        amount: balance.toFixed(2),
        paid_by: paidBy,
        notes,
      }),
    );

    for (const allocation of unpaid) {
      allocation.tip_payout_id = payout.id;
      await this.tipAllocationsRepository.save(allocation);
    }

    return payout;
  }

  // Only calculated (amount not null) and unpaid allocations count toward
  // balance/payout — a still-open pool hasn't produced an amount yet.
  private getUnpaidAllocations(employeeId: string): Promise<TipAllocation[]> {
    return this.tipAllocationsRepository.find({
      where: {
        employee_id: employeeId,
        tip_payout_id: IsNull(),
        amount: Not(IsNull()),
      },
    });
  }
}
