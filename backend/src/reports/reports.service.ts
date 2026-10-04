import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Stock } from '../inventory/stock.entity';
import { StockMovement } from '../inventory/stock-movement.entity';
import { Event } from '../events/event.entity';
import { Attendance } from '../roster/attendance.entity';
import { BarSale } from '../bar/bar-sale.entity';
import { Batch } from '../food-preservation/batch.entity';
import { BatchStatus } from '../food-preservation/batch-status.enum';
import { ChecklistRecord } from '../checklist/checklist-record.entity';
import { EventsService } from '../events/events.service';

export interface ReportFilters {
  branchIds: string[] | null;
  dateFrom?: string;
  dateTo?: string;
}

// Every method here is a query over data another module already owns —
// no report-specific storage. See docs/reports-architecture.md#principle-no-report-tables.
@Injectable()
export class ReportsService {
  constructor(
    @InjectRepository(Stock)
    private readonly stockRepository: Repository<Stock>,
    @InjectRepository(StockMovement)
    private readonly stockMovementsRepository: Repository<StockMovement>,
    @InjectRepository(Event)
    private readonly eventsRepository: Repository<Event>,
    @InjectRepository(Attendance)
    private readonly attendanceRepository: Repository<Attendance>,
    @InjectRepository(BarSale)
    private readonly barSalesRepository: Repository<BarSale>,
    @InjectRepository(Batch)
    private readonly batchesRepository: Repository<Batch>,
    @InjectRepository(ChecklistRecord)
    private readonly checklistRecordsRepository: Repository<ChecklistRecord>,
    private readonly eventsService: EventsService,
  ) {}

  // --- Inventory: Stock Levels ---
  async inventoryStockLevels(filters: ReportFilters) {
    const qb = this.stockRepository
      .createQueryBuilder('stock')
      .innerJoinAndSelect('stock.item', 'item')
      .innerJoinAndSelect('stock.warehouse', 'warehouse');

    if (filters.branchIds) {
      qb.andWhere('warehouse.branch_id IN (:...branchIds)', {
        branchIds: filters.branchIds,
      });
    }

    const rows = await qb.getMany();
    return rows.map((row) => ({
      item_sku: row.item.sku,
      item_name: row.item.name,
      warehouse_name: row.warehouse.name,
      quantity: row.quantity,
      minimum_stock_level: row.minimum_stock_level,
      status:
        Number(row.quantity) <= 0
          ? 'out_of_stock'
          : Number(row.quantity) <= Number(row.minimum_stock_level)
            ? 'low_stock'
            : 'available',
    }));
  }

  // --- Inventory: Stock Movements ---
  async inventoryStockMovements(filters: ReportFilters) {
    const qb = this.stockMovementsRepository
      .createQueryBuilder('movement')
      .innerJoinAndSelect('movement.item', 'item')
      .innerJoinAndSelect('movement.warehouse', 'warehouse')
      .leftJoinAndSelect('movement.performer', 'performer')
      .orderBy('movement.occurred_at', 'DESC');

    if (filters.branchIds) {
      qb.andWhere('warehouse.branch_id IN (:...branchIds)', {
        branchIds: filters.branchIds,
      });
    }
    if (filters.dateFrom && filters.dateTo) {
      qb.andWhere('movement.occurred_at BETWEEN :from AND :to', {
        from: new Date(`${filters.dateFrom}T00:00:00.000Z`),
        to: new Date(`${filters.dateTo}T23:59:59.999Z`),
      });
    }

    const rows = await qb.getMany();
    return rows.map((row) => ({
      occurred_at: row.occurred_at,
      item_name: row.item.name,
      warehouse_name: row.warehouse.name,
      type: row.type,
      quantity: row.quantity,
      reference_type: row.reference_type,
      performed_by: row.performer?.name,
    }));
  }

  // --- Events: P&L ---
  async eventProfitAndLoss(filters: ReportFilters) {
    const qb = this.eventsRepository
      .createQueryBuilder('event')
      .innerJoinAndSelect('event.customer', 'customer')
      .innerJoinAndSelect('event.venue', 'venue')
      .orderBy('event.event_date', 'DESC');

    if (filters.branchIds) {
      qb.andWhere('event.branch_id IN (:...branchIds)', {
        branchIds: filters.branchIds,
      });
    }
    if (filters.dateFrom && filters.dateTo) {
      qb.andWhere('event.event_date BETWEEN :from AND :to', {
        from: new Date(`${filters.dateFrom}T00:00:00.000Z`),
        to: new Date(`${filters.dateTo}T23:59:59.999Z`),
      });
    }

    const events = await qb.getMany();
    const rows = [];
    for (const event of events) {
      const financials = await this.eventsService.getFinancials(event.id);
      rows.push({
        event_date: event.event_date,
        customer_name: event.customer.name,
        venue_name: event.venue.name,
        status: event.status,
        guest_count: event.guest_count,
        ...financials,
      });
    }
    return rows;
  }

  // --- Roster: Attendance ---
  async rosterAttendance(filters: ReportFilters) {
    const qb = this.attendanceRepository
      .createQueryBuilder('attendance')
      .innerJoinAndSelect('attendance.employee', 'employee')
      .orderBy('attendance.date', 'DESC');

    if (filters.branchIds) {
      qb.andWhere('employee.branch_id IN (:...branchIds)', {
        branchIds: filters.branchIds,
      });
    }
    if (filters.dateFrom && filters.dateTo) {
      qb.andWhere('attendance.date BETWEEN :from AND :to', {
        from: filters.dateFrom,
        to: filters.dateTo,
      });
    }

    const rows = await qb.getMany();
    return rows.map((row) => ({
      date: row.date,
      employee_code: row.employee.employee_code,
      employee_name: row.employee.name,
      status: row.status,
      clock_in: row.clock_in,
      clock_out: row.clock_out,
    }));
  }

  // --- Bar: Sales ---
  async barSales(filters: ReportFilters) {
    const qb = this.barSalesRepository
      .createQueryBuilder('sale')
      .innerJoinAndSelect('sale.recipe', 'recipe')
      .innerJoinAndSelect('sale.warehouse', 'warehouse')
      .orderBy('sale.sold_at', 'DESC');

    if (filters.branchIds) {
      qb.andWhere('warehouse.branch_id IN (:...branchIds)', {
        branchIds: filters.branchIds,
      });
    }
    if (filters.dateFrom && filters.dateTo) {
      qb.andWhere('sale.sold_at BETWEEN :from AND :to', {
        from: new Date(`${filters.dateFrom}T00:00:00.000Z`),
        to: new Date(`${filters.dateTo}T23:59:59.999Z`),
      });
    }

    const rows = await qb.getMany();
    return rows.map((row) => ({
      sold_at: row.sold_at,
      warehouse_name: row.warehouse.name,
      recipe_name: row.recipe.name,
      quantity: row.quantity,
      unit_price: row.unit_price,
      total_amount: row.total_amount,
    }));
  }

  // --- Food Preservation: Expiry Alerts ---
  async foodPreservationExpiryAlerts(
    filters: ReportFilters,
    thresholdDays = 3,
  ) {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() + thresholdDays);

    const qb = this.batchesRepository
      .createQueryBuilder('batch')
      .innerJoinAndSelect('batch.preserved_item', 'preserved_item')
      .innerJoinAndSelect('batch.storage_location', 'storage_location')
      .where('batch.status = :status', { status: BatchStatus.ACTIVE })
      .andWhere('batch.expiry_date <= :cutoff', {
        cutoff: cutoff.toISOString().slice(0, 10),
      })
      .orderBy('batch.expiry_date', 'ASC');

    if (filters.branchIds) {
      qb.andWhere('storage_location.branch_id IN (:...branchIds)', {
        branchIds: filters.branchIds,
      });
    }

    const rows = await qb.getMany();
    return rows.map((row) => ({
      batch_code: row.batch_code,
      preserved_item_name: row.preserved_item.name,
      storage_location_name: row.storage_location.name,
      quantity: row.quantity,
      unit: row.unit,
      expiry_date: row.expiry_date,
    }));
  }

  // --- Checklist: Completions ---
  // Returns every record in range, completed and still-pending, so gaps
  // are visible — not just the completed sheets. See
  // docs/checklist-design.md#reports.
  async checklistCompletions(filters: ReportFilters) {
    const qb = this.checklistRecordsRepository
      .createQueryBuilder('record')
      .innerJoinAndSelect('record.checklist_template', 'template')
      .innerJoinAndSelect('record.employee', 'employee')
      .leftJoinAndSelect('record.completer', 'completer')
      .orderBy('record.date', 'DESC');

    if (filters.branchIds) {
      qb.andWhere('record.branch_id IN (:...branchIds)', {
        branchIds: filters.branchIds,
      });
    }
    if (filters.dateFrom && filters.dateTo) {
      qb.andWhere('record.date BETWEEN :from AND :to', {
        from: filters.dateFrom,
        to: filters.dateTo,
      });
    }

    const rows = await qb.getMany();
    return rows.map((row) => ({
      date: row.date,
      template_name: row.checklist_template.name,
      area: row.checklist_template.area,
      employee_code: row.employee.employee_code,
      employee_name: row.employee.name,
      status: row.status,
      completed_at: row.completed_at,
      completed_by: row.completer?.name,
    }));
  }
}
