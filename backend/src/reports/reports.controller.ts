import {
  Controller,
  ForbiddenException,
  Get,
  Query,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { ReportsService } from './reports.service';
import { TipReportsService } from './tip-reports.service';
import { BranchAccessService } from './branch-access.service';
import { ExportService, ExportColumn } from '../export/export.service';
import { PermissionsResolverService } from '../rbac/permissions-resolver.service';
import { PermissionsGuard } from '../rbac/permissions.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { User } from '../users/user.entity';
import { AuditLogService } from '../audit-log/audit-log.service';

type Format = 'json' | 'csv' | 'excel';

interface ReportQuery {
  branch_id?: string;
  date_from?: string;
  date_to?: string;
  format?: Format;
  status?: string;
  employee_id?: string;
}

// One route per report, each following the same shape: resolve the branch
// filter (access-controlled), check .report or .export depending on
// `format`, run the query, and — for csv/excel — hand the rows to the
// shared ExportService. Every call is logged to AuditLog. See
// docs/reports-architecture.md.
@UseGuards(PermissionsGuard)
@Controller('reports')
export class ReportsController {
  constructor(
    private readonly reportsService: ReportsService,
    private readonly branchAccessService: BranchAccessService,
    private readonly exportService: ExportService,
    private readonly permissionsResolver: PermissionsResolverService,
    private readonly auditLogService: AuditLogService,
    private readonly tipReportsService: TipReportsService,
  ) {}

  @Get('inventory/stock-levels')
  async inventoryStockLevels(
    @Query() query: ReportQuery,
    @CurrentUser() actor: User,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const columns: ExportColumn[] = [
      { key: 'item_sku', header: 'SKU' },
      { key: 'item_name', header: 'Item' },
      { key: 'warehouse_name', header: 'Warehouse' },
      { key: 'quantity', header: 'Quantity' },
      { key: 'minimum_stock_level', header: 'Minimum' },
      { key: 'status', header: 'Status' },
    ];
    return this.runReport(
      'inventory',
      'stock_levels',
      query,
      actor,
      req,
      res,
      columns,
      (filters) => this.reportsService.inventoryStockLevels(filters),
    );
  }

  @Get('inventory/stock-movements')
  async inventoryStockMovements(
    @Query() query: ReportQuery,
    @CurrentUser() actor: User,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const columns: ExportColumn[] = [
      { key: 'occurred_at', header: 'Date' },
      { key: 'item_name', header: 'Item' },
      { key: 'warehouse_name', header: 'Warehouse' },
      { key: 'type', header: 'Type' },
      { key: 'quantity', header: 'Quantity' },
      { key: 'reference_type', header: 'Reference' },
      { key: 'performed_by', header: 'Performed By' },
    ];
    return this.runReport(
      'inventory',
      'stock_movements',
      query,
      actor,
      req,
      res,
      columns,
      (filters) => this.reportsService.inventoryStockMovements(filters),
    );
  }

  @Get('events/profit-and-loss')
  async eventProfitAndLoss(
    @Query() query: ReportQuery,
    @CurrentUser() actor: User,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const columns: ExportColumn[] = [
      { key: 'event_date', header: 'Date' },
      { key: 'customer_name', header: 'Customer' },
      { key: 'venue_name', header: 'Venue' },
      { key: 'status', header: 'Status' },
      { key: 'guest_count', header: 'Guests' },
      { key: 'cost', header: 'Cost' },
      { key: 'revenue', header: 'Revenue' },
      { key: 'profit', header: 'Profit' },
    ];
    return this.runReport(
      'event',
      'profit_and_loss',
      query,
      actor,
      req,
      res,
      columns,
      (filters) => this.reportsService.eventProfitAndLoss(filters),
    );
  }

  @Get('roster/attendance')
  async rosterAttendance(
    @Query() query: ReportQuery,
    @CurrentUser() actor: User,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const columns: ExportColumn[] = [
      { key: 'date', header: 'Date' },
      { key: 'employee_code', header: 'Employee Code' },
      { key: 'employee_name', header: 'Employee' },
      { key: 'status', header: 'Status' },
      { key: 'clock_in', header: 'Clock In' },
      { key: 'clock_out', header: 'Clock Out' },
    ];
    return this.runReport(
      'roster',
      'attendance',
      query,
      actor,
      req,
      res,
      columns,
      (filters) => this.reportsService.rosterAttendance(filters),
    );
  }

  @Get('tip/pool-summary')
  async tipPoolSummary(
    @Query() query: ReportQuery,
    @CurrentUser() actor: User,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const columns: ExportColumn[] = [
      { key: 'date', header: 'Date' },
      { key: 'branch_name', header: 'Branch' },
      { key: 'status', header: 'Status' },
      { key: 'total_amount', header: 'Total' },
      { key: 'participants', header: 'Participants' },
      { key: 'distributed', header: 'Distributed' },
    ];
    return this.runReport(
      'tip',
      'pool-summary',
      query,
      actor,
      req,
      res,
      columns,
      (filters) => this.tipReportsService.poolSummary(filters),
    );
  }

  @Get('tip/employee-balances')
  async tipEmployeeBalances(
    @Query() query: ReportQuery,
    @CurrentUser() actor: User,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const columns: ExportColumn[] = [
      { key: 'employee_code', header: 'Employee Code' },
      { key: 'employee_name', header: 'Employee' },
      { key: 'earned', header: 'Earned' },
      { key: 'paid_out', header: 'Paid Out' },
      { key: 'balance', header: 'Balance' },
    ];
    return this.runReport(
      'tip',
      'employee-balances',
      query,
      actor,
      req,
      res,
      columns,
      (filters) => this.tipReportsService.employeeBalances(filters),
    );
  }

  @Get('tip/payout-history')
  async tipPayoutHistory(
    @Query() query: ReportQuery,
    @CurrentUser() actor: User,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const columns: ExportColumn[] = [
      { key: 'paid_on', header: 'Paid On' },
      { key: 'employee_code', header: 'Employee Code' },
      { key: 'employee_name', header: 'Employee' },
      { key: 'amount', header: 'Amount' },
      { key: 'paid_by', header: 'Paid By' },
      { key: 'notes', header: 'Notes' },
    ];
    return this.runReport(
      'tip',
      'payout-history',
      query,
      actor,
      req,
      res,
      columns,
      (filters) => this.tipReportsService.payoutHistory(filters),
    );
  }

  @Get('bar/sales')
  async barSales(
    @Query() query: ReportQuery,
    @CurrentUser() actor: User,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const columns: ExportColumn[] = [
      { key: 'sold_at', header: 'Date' },
      { key: 'warehouse_name', header: 'Warehouse' },
      { key: 'recipe_name', header: 'Recipe' },
      { key: 'quantity', header: 'Quantity' },
      { key: 'unit_price', header: 'Unit Price' },
      { key: 'total_amount', header: 'Total' },
    ];
    return this.runReport(
      'bar',
      'sales',
      query,
      actor,
      req,
      res,
      columns,
      (filters) => this.reportsService.barSales(filters),
    );
  }

  @Get('food-preservation/expiry-alerts')
  async foodPreservationExpiryAlerts(
    @Query() query: ReportQuery,
    @CurrentUser() actor: User,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const columns: ExportColumn[] = [
      { key: 'batch_code', header: 'Batch' },
      { key: 'preserved_item_name', header: 'Item' },
      { key: 'storage_location_name', header: 'Storage Location' },
      { key: 'quantity', header: 'Quantity' },
      { key: 'unit', header: 'Unit' },
      { key: 'expiry_date', header: 'Expiry Date' },
    ];
    return this.runReport(
      'food_preservation',
      'expiry_alerts',
      query,
      actor,
      req,
      res,
      columns,
      (filters) => this.reportsService.foodPreservationExpiryAlerts(filters),
    );
  }

  @Get('checklist/completions')
  async checklistCompletions(
    @Query() query: ReportQuery,
    @CurrentUser() actor: User,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const columns: ExportColumn[] = [
      { key: 'date', header: 'Date' },
      { key: 'template_name', header: 'Checklist' },
      { key: 'area', header: 'Area' },
      { key: 'employee_code', header: 'Employee Code' },
      { key: 'employee_name', header: 'Employee' },
      { key: 'status', header: 'Status' },
      { key: 'completed_at', header: 'Completed At' },
      { key: 'completed_by', header: 'Completed By' },
    ];
    return this.runReport(
      'checklist',
      'completions',
      query,
      actor,
      req,
      res,
      columns,
      (filters) => this.reportsService.checklistCompletions(filters),
    );
  }

  private async runReport(
    module: string,
    reportKey: string,
    query: ReportQuery,
    actor: User,
    req: Request,
    res: Response,
    columns: ExportColumn[],
    load: (filters: {
      branchIds: string[] | null;
      dateFrom?: string;
      dateTo?: string;
      status?: string;
      employeeId?: string;
    }) => Promise<Record<string, unknown>[]>,
  ) {
    const format: Format = query.format ?? 'json';
    const requiredPermission =
      format === 'json' ? `${module}.report` : `${module}.export`;

    // Branch context comes from the query param here (a report explicitly
    // filters by branch), not the X-Branch-Id header used elsewhere. With
    // no branch requested, "can you use this report at all" is checked
    // across any branch they hold it in — BranchAccessService below is
    // what actually restricts which branches' data comes back.
    const allowed = query.branch_id
      ? await this.permissionsResolver.hasPermission(
          actor.id,
          query.branch_id,
          requiredPermission,
        )
      : (
          await this.permissionsResolver.getEffectivePermissionsAnyBranch(
            actor.id,
          )
        ).has(requiredPermission);
    if (!allowed) {
      throw new ForbiddenException(
        `Missing required permission: ${requiredPermission}`,
      );
    }

    const branchIds = await this.branchAccessService.resolveBranchFilter(
      actor.id,
      query.branch_id,
    );
    const rows = await load({
      branchIds,
      dateFrom: query.date_from,
      dateTo: query.date_to,
      status: query.status,
      employeeId: query.employee_id,
    });

    await this.auditLogService.record({
      action: format === 'json' ? 'report_viewed' : 'report_exported',
      entityType: reportKey,
      actorId: actor.id,
      actorName: actor.name,
      ipAddress: req.ip ?? null,
      userAgent: (req.headers['user-agent'] as string) ?? null,
    });

    if (format === 'csv') {
      const csv = this.exportService.toCsv(columns, rows);
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="${reportKey}.csv"`,
      );
      return csv;
    }

    if (format === 'excel') {
      const buffer = await this.exportService.toExcel(columns, rows);
      // A Buffer returned normally would go through Nest's default
      // response handling and get JSON-serialized (Buffer.toJSON() ->
      // {type:"Buffer",data:[...]}) instead of sent as binary — send it
      // directly and return nothing.
      res.setHeader(
        'Content-Type',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      );
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="${reportKey}.xlsx"`,
      );
      res.send(buffer);
      return;
    }

    return rows;
  }
}
