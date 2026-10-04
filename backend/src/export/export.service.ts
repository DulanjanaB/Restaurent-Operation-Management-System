import { Injectable } from '@nestjs/common';
import ExcelJS from 'exceljs';

export interface ExportColumn {
  key: string;
  header: string;
}

// Shared by every module's export endpoint so formatting is consistent
// app-wide instead of a bespoke layout per report. See
// docs/reports-architecture.md#shared-implementation-nestjs.
@Injectable()
export class ExportService {
  toCsv(columns: ExportColumn[], rows: Record<string, unknown>[]): string {
    const escape = (value: unknown): string => {
      if (value === null || value === undefined) return '';
      const str = String(value);
      return /[",\n]/.test(str) ? `"${str.replace(/"/g, '""')}"` : str;
    };

    const header = columns.map((c) => escape(c.header)).join(',');
    const lines = rows.map((row) =>
      columns.map((c) => escape(row[c.key])).join(','),
    );
    return [header, ...lines].join('\n');
  }

  async toExcel(
    columns: ExportColumn[],
    rows: Record<string, unknown>[],
  ): Promise<Buffer> {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Report');

    sheet.columns = columns.map((c) => ({
      header: c.header,
      key: c.key,
      width: 20,
    }));
    sheet.addRows(rows);
    sheet.getRow(1).font = { bold: true };

    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(buffer);
  }
}
