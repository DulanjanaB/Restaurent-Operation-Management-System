'use client';

import { useMemo } from 'react';
import type { ColumnDef } from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DataTable } from './data-table';
import { PrintButton } from './print-button';
import { Money } from './money';
import { useFormatting } from '@/context/formatting-context';
import { formatCurrency } from '@/lib/format';
import { ReportPrintHeader, type ReportPrintMeta } from './report-print-header';

export interface ReportColumn {
  key: string;
  header: string;
  format?: 'date' | 'datetime' | 'badge' | 'money';
}

// Plain, serializable column configs — NOT TanStack ColumnDef objects.
// ColumnDefs with cell render functions can't cross the Server ->
// Client Component boundary as props (only serializable data can, same
// lesson as Administration's list tables), so this component (itself a
// Client Component) builds the actual ColumnDef array internally from
// this simple config, after the boundary has already been crossed with
// plain data.
function buildColumns(
  columns: ReportColumn[],
): ColumnDef<Record<string, unknown>, unknown>[] {
  return columns.map((column) => ({
    accessorKey: column.key,
    header: column.header,
    cell: ({ getValue }) => {
      const value = getValue();
      if (value === null || value === undefined) return '—';
      if (column.format === 'date') {
        return new Date(String(value)).toLocaleDateString();
      }
      if (column.format === 'datetime') {
        return new Date(String(value)).toLocaleString();
      }
      if (column.format === 'money') {
        return <Money value={String(value)} />;
      }
      if (column.format === 'badge') {
        return <Badge variant="outline">{String(value)}</Badge>;
      }
      return String(value);
    },
  }));
}

// A column gets a total when every value is a plain decimal number. Codes
// and identifiers (e.g. "002") look numeric, so they're excluded by name.
function totalableColumns(
  columns: ReportColumn[],
  rows: Record<string, unknown>[],
) {
  return columns.filter((column) => {
    if (column.format && column.format !== 'money') return false;
    if (/code|sku|id$/i.test(column.key)) return false;
    const values = rows
      .map((row) => row[column.key])
      .filter((value) => value !== null && value !== undefined && value !== '');
    return (
      values.length > 0 &&
      values.every((value) => /^-?\d+(\.\d+)?$/.test(String(value)))
    );
  });
}

function SummaryCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-card p-4 shadow-sm ring-1 ring-foreground/5 print:rounded-none print:shadow-none print:ring-slate-300">
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-indigo-500 to-fuchsia-500 print:hidden"
      />
      <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground print:text-slate-500">
        {label}
      </p>
      <p className="mt-1 text-xl font-semibold tabular-nums print:text-base print:text-slate-900">
        {value}
      </p>
    </div>
  );
}

// Paired with ReportFilterBar — one shared shape for every module's report
// page(s). `canExport` independently gates the CSV/Excel buttons from the
// on-screen table (`.report` vs `.export`, per reports-architecture.md).
export function ReportOutput({
  module,
  reportKey,
  columns,
  rows,
  searchParams,
  canExport,
  meta,
}: {
  module: string;
  reportKey: string;
  columns: ReportColumn[];
  rows: Record<string, unknown>[];
  searchParams: Record<string, string | undefined>;
  canExport: boolean;
  meta: ReportPrintMeta;
}) {
  const settings = useFormatting();
  const tableColumns = useMemo(() => buildColumns(columns), [columns]);
  const totals = useMemo(
    () => totalableColumns(columns, rows).slice(0, 3),
    [columns, rows],
  );

  const query = new URLSearchParams(
    Object.entries(searchParams).filter(
      (entry): entry is [string, string] => entry[1] !== undefined,
    ),
  );
  const exportHref = (format: 'csv' | 'excel') => {
    const params = new URLSearchParams(query);
    params.set('format', format);
    return `/api/reports/${module}/${reportKey}?${params.toString()}`;
  };

  return (
    <div className="space-y-5">
      <ReportPrintHeader meta={meta} />

      <div className="no-print flex justify-end gap-2">
        {canExport && (
          <>
            <Button variant="outline" size="sm" asChild>
              <a href={exportHref('csv')}>Export CSV</a>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <a href={exportHref('excel')}>Export Excel</a>
            </Button>
          </>
        )}
        <PrintButton />
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 print:grid-cols-4 print:gap-2">
        <SummaryCard label="Records" value={String(rows.length)} />
        {totals.map((column) => {
          const sum = rows.reduce(
            (total, row) => total + Number(row[column.key] ?? 0),
            0,
          );
          return (
            <SummaryCard
              key={column.key}
              label={`Total ${column.header}`}
              value={
                column.format === 'money'
                  ? formatCurrency(sum, settings)
                  : sum.toFixed(2)
              }
            />
          );
        })}
      </div>

      <DataTable
        columns={tableColumns}
        data={rows}
        emptyTitle="No results"
        emptyDescription="Try widening the date range or clearing filters."
      />

      <p className="hidden text-center text-[10px] text-slate-500 print:block">
        {meta.brandName} · {meta.title} · Generated {meta.generatedAt}
      </p>
    </div>
  );
}
