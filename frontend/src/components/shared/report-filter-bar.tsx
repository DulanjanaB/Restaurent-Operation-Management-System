import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { MyBranch } from '@/lib/server/branch/queries';

export interface ReportSelectFilter {
  name: string;
  label: string;
  options: { value: string; label: string }[];
}

// Plain <form method="get"> — no client JS needed. Submitting re-navigates
// to the same report page with new searchParams, which the Server
// Component page re-reads to re-fetch. Every report page shares this one
// filter shape (date_from/date_to/branch_id + module-specific extras) per
// docs/reports-architecture.md.
export function ReportFilterBar({
  branches,
  searchParams,
  extraFilters = [],
}: {
  branches: MyBranch[];
  searchParams: Record<string, string | undefined>;
  extraFilters?: ReportSelectFilter[];
}) {
  return (
    <form method="get" className="no-print flex flex-wrap items-end gap-3">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="date_from">From</Label>
        <Input
          id="date_from"
          type="date"
          name="date_from"
          defaultValue={searchParams.date_from ?? ''}
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="date_to">To</Label>
        <Input
          id="date_to"
          type="date"
          name="date_to"
          defaultValue={searchParams.date_to ?? ''}
        />
      </div>
      {branches.length > 1 && (
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="branch_id">Branch</Label>
          <Select
            name="branch_id"
            defaultValue={searchParams.branch_id ?? 'all'}
          >
            <SelectTrigger id="branch_id" className="w-44">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All accessible branches</SelectItem>
              {branches.map((branch) => (
                <SelectItem key={branch.id} value={branch.id}>
                  {branch.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
      {extraFilters.map((filter) => (
        <div key={filter.name} className="flex flex-col gap-1.5">
          <Label htmlFor={filter.name}>{filter.label}</Label>
          <Select
            name={filter.name}
            defaultValue={searchParams[filter.name] ?? 'all'}
          >
            <SelectTrigger id={filter.name} className="w-44">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              {filter.options.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      ))}
      <Button type="submit">Apply</Button>
    </form>
  );
}
