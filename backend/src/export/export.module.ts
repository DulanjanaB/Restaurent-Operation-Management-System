import { Module } from '@nestjs/common';
import { ExportService } from './export.service';

// Split out of ReportsModule so AuditLogModule can reuse it too, without a
// ReportsModule <-> AuditLogModule circular import (ReportsModule already
// depends on AuditLogModule for writing report_viewed/report_exported
// entries).
@Module({
  providers: [ExportService],
  exports: [ExportService],
})
export class ExportModule {}
