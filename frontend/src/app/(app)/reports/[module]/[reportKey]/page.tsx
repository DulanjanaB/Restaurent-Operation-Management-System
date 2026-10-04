import { notFound } from 'next/navigation';
import { getMe } from '@/lib/auth/dal';
import { getReportConfig } from '@/lib/reports/registry';
import { getReportRows } from '@/lib/reports/queries';
import { getMyBranches } from '@/lib/server/branch/queries';
import { getEmployees } from '@/lib/server/roster/queries';
import { getBrand } from '@/lib/server/settings/queries';
import { hasPermission } from '@/lib/permissions';
import { ApiError } from '@/lib/api/client';
import { ReportFilterBar } from '@/components/shared/report-filter-bar';
import { ReportOutput } from '@/components/shared/report-output';
import { ReportAccessError } from '@/components/shared/report-access-error';
import { AccessDenied } from '@/components/shared/access-denied';
import { PageHeader } from '@/components/shared/page-header';

export default async function ReportPage({
  params,
  searchParams,
}: {
  params: Promise<{ module: string; reportKey: string }>;
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const [{ module, reportKey }, query, me] = await Promise.all([
    params,
    searchParams,
    getMe(),
  ]);

  const config = getReportConfig(module, reportKey);
  if (!config) notFound();

  const canView = hasPermission(me, config.reportPermission);
  const canExport = hasPermission(me, config.exportPermission);
  if (!canView) {
    // Rendered inline rather than thrown — a thrown error only reaches
    // (app)/error.tsx as an opaque digest (Next.js redacts the real
    // message in production), so a page that already knows exactly why
    // access was denied should say so directly instead.
    return (
      <div className="space-y-4">
        <div className="no-print">
          <ReportHeader title={config.title} description={config.description} />
        </div>
        <AccessDenied
          description={`This report requires the "${config.reportPermission}" permission, which you don't currently hold.`}
        />
      </div>
    );
  }

  const { branches } = await getMyBranches();

  // Employee filters list the current branch's staff. Without roster.view
  // there's nothing to choose from, so the filter is hidden.
  const employees =
    config.extraFilters?.some((filter) => filter.name === 'employee_id') &&
    hasPermission(me, 'roster.view')
      ? await getEmployees(me!.current_branch_id).catch(() => [])
      : [];
  const extraFilters = (config.extraFilters ?? [])
    .map((filter) =>
      filter.name === 'employee_id'
        ? {
            ...filter,
            options: employees.map((employee) => ({
              value: employee.id,
              label: employee.name,
            })),
          }
        : filter,
    )
    .filter((filter) => filter.options.length > 0);

  let rows: Record<string, unknown>[];
  try {
    rows = await getReportRows(module, reportKey, query);
  } catch (error) {
    if (error instanceof ApiError && error.status === 403 && query.branch_id) {
      const branchName = branches.find((b) => b.id === query.branch_id)?.name;
      return (
        <div className="space-y-4">
          <div className="no-print">
            <ReportHeader
              title={config.title}
              description={config.description}
            />
          </div>
          <ReportFilterBar
            branches={branches}
            searchParams={query}
            extraFilters={extraFilters}
          />
          <ReportAccessError branchName={branchName} />
        </div>
      );
    }
    throw error;
  }

  const brand = await getBrand().catch(() => null);
  const branchName =
    !query.branch_id || query.branch_id === 'all'
      ? 'All accessible branches'
      : (branches.find((branch) => branch.id === query.branch_id)?.name ??
        'Selected branch');
  const filters: string[] = [];
  if (query.status) filters.push(`Status: ${query.status}`);
  if (query.employee_id) {
    const employee = employees.find((item) => item.id === query.employee_id);
    filters.push(`Employee: ${employee?.name ?? 'Selected'}`);
  }
  const meta = {
    brandName: brand?.business_name ?? 'Restaurant Ops',
    logoUrl: brand?.logo_url ?? null,
    title: config.title,
    description: config.description,
    period:
      query.date_from || query.date_to
        ? `${query.date_from ?? 'Start'} to ${query.date_to ?? 'Today'}`
        : 'All dates',
    branch: branchName,
    filters,
    generatedAt: new Date().toLocaleString(),
    generatedBy: me!.name,
  };

  return (
    <div className="space-y-4">
      <div className="no-print">
        <ReportHeader title={config.title} description={config.description} />
      </div>
      <ReportFilterBar
        branches={branches}
        searchParams={query}
        extraFilters={extraFilters}
      />
      <ReportOutput
        module={module}
        reportKey={reportKey}
        columns={config.columns}
        rows={rows}
        searchParams={query}
        canExport={canExport}
        meta={meta}
      />
    </div>
  );
}

function ReportHeader({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  return (
    <PageHeader
      tone="sky"
      title={<>{title}</>}
      description={description ? <>{description}</> : undefined}
    />
  );
}
