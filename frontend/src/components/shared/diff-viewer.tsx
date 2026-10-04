// Renders an AuditLog entry's { field: { old, new } } changes map — reused
// on the Audit Log page and embedded as User Detail's Activity tab.
function formatValue(value: unknown): string {
  if (value === null || value === undefined) return '—';
  if (typeof value === 'object') return JSON.stringify(value);
  return String(value);
}

export function DiffViewer({
  changes,
}: {
  changes: Record<string, { old: unknown; new: unknown }> | null;
}) {
  if (!changes || Object.keys(changes).length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No field changes recorded.
      </p>
    );
  }

  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="text-left text-xs text-muted-foreground">
          <th className="py-1 pr-4 font-medium">Field</th>
          <th className="py-1 pr-4 font-medium">Before</th>
          <th className="py-1 font-medium">After</th>
        </tr>
      </thead>
      <tbody>
        {Object.entries(changes).map(([field, { old, new: next }]) => (
          <tr key={field} className="border-t">
            <td className="py-1.5 pr-4 font-medium">{field}</td>
            <td className="py-1.5 pr-4 text-muted-foreground line-through decoration-muted-foreground/50">
              {formatValue(old)}
            </td>
            <td className="py-1.5">{formatValue(next)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
