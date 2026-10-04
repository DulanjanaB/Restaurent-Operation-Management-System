import { Controller, Get, Query, Res, UseGuards } from '@nestjs/common';
import type { Response } from 'express';
import { AuditLogService } from './audit-log.service';
import { ExportService, ExportColumn } from '../export/export.service';
import { PermissionsGuard } from '../rbac/permissions.guard';
import { RequirePermissions } from '../rbac/require-permissions.decorator';

type Format = 'json' | 'csv' | 'excel';

const EXPORT_COLUMNS: ExportColumn[] = [
  { key: 'created_at', header: 'When' },
  { key: 'actor_name', header: 'Actor' },
  { key: 'action', header: 'Action' },
  { key: 'entity_type', header: 'Entity type' },
  { key: 'entity_label', header: 'Entity' },
  { key: 'branch_id', header: 'Branch' },
  { key: 'ip_address', header: 'IP address' },
];

// View-only — deliberately no create/update/delete endpoints. Entries are
// written exclusively by AuditSubscriber and AuditLogService.record(),
// never through a user-facing write. See docs/audit-log-design.md#permissions.
@UseGuards(PermissionsGuard)
@Controller('audit-log')
export class AuditLogController {
  constructor(
    private readonly auditLogService: AuditLogService,
    private readonly exportService: ExportService,
  ) {}

  @RequirePermissions('audit.view')
  @Get()
  findAll(
    @Query('actor_id') actorId?: string,
    @Query('entity_type') entityType?: string,
    @Query('entity_id') entityId?: string,
    @Query('date_from') dateFrom?: string,
    @Query('date_to') dateTo?: string,
  ) {
    return this.auditLogService.findAll({
      actorId,
      entityType,
      entityId,
      dateFrom,
      dateTo,
    });
  }

  // Same query, gated by .export rather than .view — matches the
  // Screen-vs-Export permission split in reports-architecture.md.
  // format=json (default) keeps the original response shape; csv/excel
  // produce a real file download via the shared ExportService.
  @RequirePermissions('audit.export')
  @Get('export')
  async export(
    @Res({ passthrough: true }) res: Response,
    @Query('actor_id') actorId?: string,
    @Query('entity_type') entityType?: string,
    @Query('entity_id') entityId?: string,
    @Query('date_from') dateFrom?: string,
    @Query('date_to') dateTo?: string,
    @Query('format') format: Format = 'json',
  ) {
    const rows = await this.auditLogService.findAll({
      actorId,
      entityType,
      entityId,
      dateFrom,
      dateTo,
    });

    if (format === 'csv') {
      const csv = this.exportService.toCsv(
        EXPORT_COLUMNS,
        rows as unknown as Record<string, unknown>[],
      );
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader(
        'Content-Disposition',
        'attachment; filename="audit-log.csv"',
      );
      return csv;
    }

    if (format === 'excel') {
      const buffer = await this.exportService.toExcel(
        EXPORT_COLUMNS,
        rows as unknown as Record<string, unknown>[],
      );
      res.setHeader(
        'Content-Type',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      );
      res.setHeader(
        'Content-Disposition',
        'attachment; filename="audit-log.xlsx"',
      );
      res.send(buffer);
      return;
    }

    return rows;
  }
}
