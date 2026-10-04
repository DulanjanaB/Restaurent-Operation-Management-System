import {
  ArrowLeftRight,
  CalendarDays,
  CalendarRange,
  CheckCircle2,
  ClipboardList,
  Coins,
  ListChecks,
  PartyPopper,
  ShoppingCart,
  Snowflake,
  type LucideIcon,
} from 'lucide-react';
import type { Me } from '@/lib/auth/dal';
import { hasPermission } from '@/lib/permissions';
import { getEvents } from '@/lib/server/events/queries';
import {
  getLeaveRequests,
  getRosterPeriods,
} from '@/lib/server/roster/queries';
import {
  getItemRequests,
  getMyItemRequests,
  getPurchaseOrders,
  getTransfers,
} from '@/lib/server/inventory/queries';
import { getBatches } from '@/lib/server/food-preservation/queries';
import { getChecklistRecords } from '@/lib/server/checklist/queries';
import { getTipPools } from '@/lib/server/tip-sharing/queries';
import { cn } from '@/lib/utils';
import { WidgetCard } from './widget-card';
import { TONE_STYLES, type Tone } from './tones';

type StatusRow = { status: string };

type Spec = {
  title: string;
  href: string;
  icon: LucideIcon;
  tone: Tone;
  statuses: string[];
  // Statuses that mean someone has work to do on this item.
  attention: string[];
  rows: Promise<StatusRow[]>;
};

// Each status gets a fixed colour everywhere it appears, so amber always
// means "waiting" and emerald always means "done" across every card.
const STATUS_TONE: Record<string, Tone> = {
  requested: 'amber',
  pending: 'amber',
  open: 'amber',
  draft: 'violet',
  submitted: 'sky',
  confirmed: 'sky',
  approved: 'sky',
  active: 'sky',
  in_transit: 'indigo',
  partially_received: 'violet',
  rejected: 'rose',
  expired: 'rose',
  completed: 'emerald',
  published: 'emerald',
  received: 'emerald',
  calculated: 'emerald',
  closed: 'teal',
  consumed: 'teal',
  cancelled: 'slate',
  disposed: 'slate',
};

// Plain-language labels so each status says what it means for the business,
// not what the database calls it.
const STATUS_LABEL: Record<string, string> = {
  requested: 'Awaiting confirmation',
  confirmed: 'Confirmed',
  completed: 'Completed',
  closed: 'Closed',
  cancelled: 'Cancelled',
  pending: 'Awaiting approval',
  approved: 'Approved',
  rejected: 'Rejected',
  draft: 'Being prepared',
  published: 'Published to staff',
  submitted: 'Sent to supplier',
  in_transit: 'On the way',
  partially_received: 'Partly received',
  received: 'Fully received',
  open: 'Open for distribution',
  calculated: 'Distributed',
  active: 'In storage',
  expired: 'Past expiry',
  consumed: 'Used up',
  disposed: 'Disposed',
};

const REQUEST_STATUSES = ['pending', 'approved', 'rejected'];
const REQUEST_ATTENTION = ['pending'];

// Every status a module can be in is listed, so a card shows the full
// picture even when a count is zero. Each card is gated by the same
// permission its list endpoint enforces on the backend.
export async function OperationsStatus({ me }: { me: Me }) {
  const branchId = me.current_branch_id;
  const today = new Date().toISOString().slice(0, 10);
  const specs: Spec[] = [];

  if (hasPermission(me, 'event.view')) {
    specs.push({
      title: 'Events',
      href: '/events',
      icon: PartyPopper,
      tone: 'violet',
      statuses: ['requested', 'confirmed', 'completed', 'closed', 'cancelled'],
      attention: ['requested'],
      rows: getEvents(branchId),
    });
  }
  if (hasPermission(me, 'roster.view')) {
    specs.push({
      title: 'Leave requests',
      href: '/roster/leave',
      icon: CalendarDays,
      tone: 'sky',
      statuses: ['pending', 'approved', 'rejected'],
      attention: ['pending'],
      rows: getLeaveRequests(),
    });
    specs.push({
      title: 'Roster periods',
      href: '/roster/periods',
      icon: CalendarRange,
      tone: 'teal',
      statuses: ['draft', 'published'],
      attention: ['draft'],
      rows: getRosterPeriods(branchId),
    });
  }
  if (hasPermission(me, 'inventory.view')) {
    specs.push({
      title: 'Stock transfers',
      href: '/inventory/transfers',
      icon: ArrowLeftRight,
      tone: 'indigo',
      statuses: ['pending', 'approved', 'in_transit', 'completed', 'cancelled'],
      attention: ['pending'],
      rows: getTransfers(),
    });
    specs.push({
      title: 'Purchase orders',
      href: '/inventory/purchase-orders',
      icon: ShoppingCart,
      tone: 'amber',
      statuses: [
        'draft',
        'submitted',
        'approved',
        'partially_received',
        'received',
        'cancelled',
      ],
      attention: ['draft', 'submitted'],
      rows: getPurchaseOrders(),
    });
  }
  if (hasPermission(me, 'inventory.approve')) {
    specs.push({
      title: 'Item requests',
      href: '/item-requests',
      icon: ClipboardList,
      tone: 'emerald',
      statuses: REQUEST_STATUSES,
      attention: REQUEST_ATTENTION,
      rows: getItemRequests(),
    });
  } else if (hasPermission(me, 'inventory.item_request.create')) {
    specs.push({
      title: 'My item requests',
      href: '/item-requests',
      icon: ClipboardList,
      tone: 'emerald',
      statuses: REQUEST_STATUSES,
      attention: REQUEST_ATTENTION,
      rows: getMyItemRequests(),
    });
  }
  if (hasPermission(me, 'checklist.view')) {
    specs.push({
      title: 'Checklists today',
      href: '/checklist/records',
      icon: ListChecks,
      tone: 'teal',
      statuses: ['pending', 'completed'],
      attention: ['pending'],
      rows: getChecklistRecords({ date: today }),
    });
  }
  if (hasPermission(me, 'tip.view')) {
    specs.push({
      title: 'Tip pools',
      href: '/tip-sharing/pools',
      icon: Coins,
      tone: 'emerald',
      statuses: ['open', 'calculated'],
      attention: ['open'],
      rows: getTipPools(branchId),
    });
  }
  if (hasPermission(me, 'food_preservation.view')) {
    specs.push({
      title: 'Preserved batches',
      href: '/food-preservation/batches',
      icon: Snowflake,
      tone: 'sky',
      statuses: ['active', 'expired', 'consumed', 'disposed'],
      attention: ['expired'],
      rows: getBatches({}),
    });
  }

  if (specs.length === 0) return null;

  const results = await Promise.all(
    specs.map((spec) => spec.rows.catch(() => null)),
  );

  const cards = specs.flatMap((spec, index) => {
    const rows = results[index];
    return rows === null ? [] : [{ spec, rows }];
  });

  const tracked = cards.reduce((sum, card) => sum + card.rows.length, 0);
  const needAction = cards.reduce(
    (sum, card) =>
      sum +
      card.rows.filter((row) => card.spec.attention.includes(row.status))
        .length,
    0,
  );

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-semibold tracking-tight">
          Operations status
        </h2>
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <span className="rounded-full bg-muted px-3 py-1 text-muted-foreground">
            {tracked} tracked across {cards.length} modules
          </span>
          {needAction > 0 ? (
            <span
              className={cn(
                'rounded-full px-3 py-1 font-medium',
                TONE_STYLES.amber.pill,
              )}
            >
              {needAction} need action
            </span>
          ) : (
            <span
              className={cn(
                'flex items-center gap-1 rounded-full px-3 py-1 font-medium',
                TONE_STYLES.emerald.pill,
              )}
            >
              <CheckCircle2 className="size-4" />
              All clear
            </span>
          )}
        </div>
      </div>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {cards.map(({ spec, rows }) => (
          <StatusCard key={spec.title} spec={spec} rows={rows} />
        ))}
      </div>
    </section>
  );
}

function StatusCard({ spec, rows }: { spec: Spec; rows: StatusRow[] }) {
  const counts = new Map(spec.statuses.map((status) => [status, 0]));
  for (const row of rows) {
    if (counts.has(row.status)) {
      counts.set(row.status, counts.get(row.status)! + 1);
    }
  }
  const total = rows.length;
  const waiting = spec.attention.reduce(
    (sum, status) => sum + (counts.get(status) ?? 0),
    0,
  );

  return (
    <WidgetCard
      title={spec.title}
      href={spec.href}
      icon={spec.icon}
      tone={spec.tone}
    >
      <div className="flex items-baseline justify-between gap-2">
        <p className="text-2xl font-semibold">
          {total}
          <span className="text-base font-normal text-muted-foreground">
            {' '}
            total
          </span>
        </p>
        {waiting > 0 && (
          <span
            className={cn(
              'rounded-full px-2 py-0.5 text-xs font-medium',
              TONE_STYLES.amber.pill,
            )}
          >
            {waiting} waiting
          </span>
        )}
      </div>

      <div className="mt-3 flex h-2.5 overflow-hidden rounded-full bg-muted">
        {total > 0 &&
          spec.statuses.map((status) => {
            const count = counts.get(status) ?? 0;
            if (count === 0) return null;
            const tone = STATUS_TONE[status] ?? 'slate';
            return (
              <span
                key={status}
                title={`${STATUS_LABEL[status] ?? status}: ${count}`}
                className={TONE_STYLES[tone].bar}
                style={{ width: `${(count / total) * 100}%` }}
              />
            );
          })}
      </div>

      <ul className="mt-3 space-y-1.5 text-sm">
        {spec.statuses.map((status) => {
          const count = counts.get(status) ?? 0;
          const percent = total > 0 ? Math.round((count / total) * 100) : 0;
          const tone = STATUS_TONE[status] ?? 'slate';
          return (
            <li
              key={status}
              className="flex items-center justify-between gap-2"
            >
              <span
                className={cn(
                  'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium',
                  TONE_STYLES[tone].pill,
                )}
              >
                <span
                  className={cn('size-1.5 rounded-full', TONE_STYLES[tone].dot)}
                />
                {STATUS_LABEL[status] ?? status}
              </span>
              <span className="flex items-baseline gap-2 tabular-nums">
                <span className="text-xs text-muted-foreground">
                  {percent}%
                </span>
                <span className="w-6 text-right font-medium">{count}</span>
              </span>
            </li>
          );
        })}
      </ul>
    </WidgetCard>
  );
}
