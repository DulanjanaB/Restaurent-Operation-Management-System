import { Check, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { RevenueOverrideForm } from './revenue-override-form';
import type { Event, EventFinancials } from '@/lib/server/events/types';
import { Money } from '@/components/shared/money';

function ProgressRow({ done, label }: { done: boolean; label: string }) {
  return (
    <li className="flex items-center gap-2 text-sm">
      {done ? (
        <Check className="size-4 text-emerald-600" />
      ) : (
        <X className="size-4 text-muted-foreground" />
      )}
      <span className={cn(!done && 'text-muted-foreground')}>{label}</span>
    </li>
  );
}

export function OverviewTab({
  event,
  financials,
  staffCount,
  requirementCount,
  canUpdate,
}: {
  event: Event;
  financials: EventFinancials;
  staffCount: number;
  requirementCount: number;
  canUpdate: boolean;
}) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-xs font-medium text-muted-foreground">
              Cost
            </CardTitle>
          </CardHeader>
          <CardContent className="text-lg font-semibold">
            <Money value={financials.cost} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-xs font-medium text-muted-foreground">
              Revenue {event.revenue_override != null && '(overridden)'}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-lg font-semibold">
            <Money value={financials.revenue} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-xs font-medium text-muted-foreground">
              Profit
            </CardTitle>
          </CardHeader>
          <CardContent
            className={cn(
              'text-lg font-semibold',
              Number(financials.profit) < 0 && 'text-destructive',
            )}
          >
            <Money value={financials.profit} />
          </CardContent>
        </Card>
      </div>

      <div>
        <h2 className="mb-2 text-sm font-semibold text-muted-foreground">
          Progress
        </h2>
        <p className="mb-2 text-xs text-muted-foreground">
          Informational only — none of these are required by the backend to move
          the event forward.
        </p>
        <ul className="space-y-1">
          <ProgressRow
            done={event.package_id != null}
            label="Package selected"
          />
          <ProgressRow done={staffCount > 0} label="Staff assigned" />
          <ProgressRow
            done={requirementCount > 0}
            label="Inventory requirements set"
          />
        </ul>
      </div>

      {canUpdate && (
        <div className="max-w-sm">
          <h2 className="mb-2 text-sm font-semibold text-muted-foreground">
            Revenue override
          </h2>
          <RevenueOverrideForm
            eventId={event.id}
            currentOverride={event.revenue_override}
          />
          <p className="mt-1 text-xs text-muted-foreground">
            Leave blank to use the selected package&apos;s pricing instead.
          </p>
        </div>
      )}
    </div>
  );
}
