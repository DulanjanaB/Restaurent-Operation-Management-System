import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TipPool } from '../tip-sharing/tip-pool.entity';
import { TipAllocation } from '../tip-sharing/tip-allocation.entity';
import { TipPayout } from '../tip-sharing/tip-payout.entity';
import type { ReportFilters } from './reports.service';

export interface TipReportFilters extends ReportFilters {
  status?: string;
  employeeId?: string;
}

// Tip Sharing reports are queries over the pool, allocation and payout
// tables that the tip-sharing module already owns — see
// docs/reports-architecture.md#principle-no-report-tables.
@Injectable()
export class TipReportsService {
  constructor(
    @InjectRepository(TipPool)
    private readonly poolsRepository: Repository<TipPool>,
    @InjectRepository(TipAllocation)
    private readonly allocationsRepository: Repository<TipAllocation>,
    @InjectRepository(TipPayout)
    private readonly payoutsRepository: Repository<TipPayout>,
  ) {}

  async poolSummary(filters: TipReportFilters) {
    const qb = this.poolsRepository
      .createQueryBuilder('pool')
      .innerJoinAndSelect('pool.branch', 'branch');
    if (filters.branchIds) {
      qb.andWhere('pool.branch_id IN (:...branchIds)', {
        branchIds: filters.branchIds,
      });
    }
    if (filters.dateFrom)
      qb.andWhere('pool.date >= :dateFrom', { dateFrom: filters.dateFrom });
    if (filters.dateTo)
      qb.andWhere('pool.date <= :dateTo', { dateTo: filters.dateTo });
    if (filters.status)
      qb.andWhere('pool.status = :status', { status: filters.status });
    const pools = await qb.orderBy('pool.date', 'DESC').getMany();
    if (pools.length === 0) return [];

    const totals = await this.allocationsRepository
      .createQueryBuilder('allocation')
      .select('allocation.tip_pool_id', 'pool_id')
      .addSelect('COUNT(*)', 'participants')
      .addSelect('COALESCE(SUM(allocation.amount), 0)', 'distributed')
      .where('allocation.tip_pool_id IN (:...poolIds)', {
        poolIds: pools.map((pool) => pool.id),
      })
      .groupBy('allocation.tip_pool_id')
      .getRawMany<{
        pool_id: string;
        participants: string;
        distributed: string;
      }>();
    const byPool = new Map(totals.map((total) => [total.pool_id, total]));

    return pools.map((pool) => {
      const total = byPool.get(pool.id);
      return {
        date: pool.date,
        branch_name: pool.branch.name,
        status: pool.status,
        total_amount: pool.total_amount,
        participants: Number(total?.participants ?? 0),
        distributed: Number(total?.distributed ?? 0).toFixed(2),
      };
    });
  }

  // Earned = calculated allocations in the window; paid out = those already
  // linked to a payout; balance = what is still owed.
  async employeeBalances(filters: TipReportFilters) {
    const qb = this.allocationsRepository
      .createQueryBuilder('allocation')
      .innerJoinAndSelect('allocation.employee', 'employee')
      .innerJoinAndSelect('allocation.tip_pool', 'pool')
      .where('allocation.amount IS NOT NULL');
    if (filters.branchIds) {
      qb.andWhere('pool.branch_id IN (:...branchIds)', {
        branchIds: filters.branchIds,
      });
    }
    if (filters.dateFrom)
      qb.andWhere('pool.date >= :dateFrom', { dateFrom: filters.dateFrom });
    if (filters.dateTo)
      qb.andWhere('pool.date <= :dateTo', { dateTo: filters.dateTo });
    if (filters.employeeId) {
      qb.andWhere('allocation.employee_id = :employeeId', {
        employeeId: filters.employeeId,
      });
    }
    const allocations = await qb.getMany();

    const rows = new Map<
      string,
      {
        employee_code: string;
        employee_name: string;
        earned: number;
        paid_out: number;
      }
    >();
    for (const allocation of allocations) {
      const row = rows.get(allocation.employee_id) ?? {
        employee_code: allocation.employee.employee_code,
        employee_name: allocation.employee.name,
        earned: 0,
        paid_out: 0,
      };
      const amount = Number(allocation.amount);
      row.earned += amount;
      if (allocation.tip_payout_id) row.paid_out += amount;
      rows.set(allocation.employee_id, row);
    }

    return [...rows.values()]
      .sort((a, b) => a.employee_name.localeCompare(b.employee_name))
      .map((row) => ({
        employee_code: row.employee_code,
        employee_name: row.employee_name,
        earned: row.earned.toFixed(2),
        paid_out: row.paid_out.toFixed(2),
        balance: (row.earned - row.paid_out).toFixed(2),
      }));
  }

  async payoutHistory(filters: TipReportFilters) {
    const qb = this.payoutsRepository
      .createQueryBuilder('payout')
      .innerJoinAndSelect('payout.employee', 'employee')
      .innerJoinAndSelect('payout.payer', 'payer');
    if (filters.branchIds) {
      qb.andWhere('employee.branch_id IN (:...branchIds)', {
        branchIds: filters.branchIds,
      });
    }
    if (filters.dateFrom) {
      qb.andWhere('CAST(payout.paid_at AS date) >= :dateFrom', {
        dateFrom: filters.dateFrom,
      });
    }
    if (filters.dateTo) {
      qb.andWhere('CAST(payout.paid_at AS date) <= :dateTo', {
        dateTo: filters.dateTo,
      });
    }
    if (filters.employeeId) {
      qb.andWhere('payout.employee_id = :employeeId', {
        employeeId: filters.employeeId,
      });
    }
    const payouts = await qb.orderBy('payout.paid_at', 'DESC').getMany();

    return payouts.map((payout) => ({
      paid_on: new Date(payout.paid_at).toISOString().slice(0, 10),
      employee_code: payout.employee.employee_code,
      employee_name: payout.employee.name,
      amount: payout.amount,
      paid_by: payout.payer?.name ?? '',
      notes: payout.notes ?? '',
    }));
  }
}
