// Shown only when printing (hidden on screen). Laid out for A4 portrait:
// business identity, report title, the period, branch and filters that
// produced the figures below, and when and by whom it was generated.
export interface ReportPrintMeta {
  brandName: string;
  logoUrl: string | null;
  title: string;
  description?: string;
  period: string;
  branch: string;
  filters: string[];
  generatedAt: string;
  generatedBy: string;
}

export function ReportPrintHeader({ meta }: { meta: ReportPrintMeta }) {
  const facts: [string, string][] = [
    ['Period', meta.period],
    ['Branch', meta.branch],
    ['Filters', meta.filters.length ? meta.filters.join(' · ') : 'None'],
  ];

  return (
    <div className="hidden print:block">
      <style>{'@page { size: A4 portrait; margin: 12mm 12mm 16mm; }'}</style>
      <div className="flex items-center justify-between border-b-2 border-slate-800 pb-3">
        <div className="flex items-center gap-3">
          {meta.logoUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={meta.logoUrl} alt="" className="size-12 object-contain" />
          )}
          <div>
            <p className="text-lg font-bold text-slate-900">{meta.brandName}</p>
            <p className="text-xs text-slate-600">
              Restaurant operations report
            </p>
          </div>
        </div>
        <div className="text-right text-xs text-slate-600">
          <p>Generated {meta.generatedAt}</p>
          <p>by {meta.generatedBy}</p>
        </div>
      </div>

      <h1 className="mt-4 text-2xl font-bold text-slate-900">{meta.title}</h1>
      {meta.description && (
        <p className="mt-1 text-sm text-slate-600">{meta.description}</p>
      )}

      <div className="mt-4 grid grid-cols-4 gap-2">
        {facts.map(([label, value]) => (
          <div key={label} className="rounded border border-slate-300 p-2">
            <p className="text-[10px] uppercase tracking-wider text-slate-500">
              {label}
            </p>
            <p className="text-xs font-semibold text-slate-900">{value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
