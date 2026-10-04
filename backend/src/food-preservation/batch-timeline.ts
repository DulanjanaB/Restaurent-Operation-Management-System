type Tone = 'sky' | 'emerald' | 'amber' | 'rose' | 'teal' | 'slate' | 'violet';

export interface BatchTimelineEvent {
  at: string;
  title: string;
  detail: string | null;
  tone: Tone;
  actor: string | null;
}

interface AuditRow {
  entity_type: string;
  entity_id: string | null;
  action: string;
  changes: Record<string, { old: unknown; new: unknown }> | null;
  actor_name: string | null;
  created_at: Date;
}

interface DisposalRow {
  id: string;
  reason: string;
  quantity: string;
  status: string;
  disposed_at: Date | null;
}

interface BatchRow {
  production_date: string;
  quantity: string;
  unit: string;
  expiry_date: string;
  status: string;
}

const BATCH_STATUS: Record<string, { title: string; tone: Tone }> = {
  active: { title: 'Back in storage', tone: 'sky' },
  expired: { title: 'Passed its use-by date', tone: 'rose' },
  consumed: { title: 'Marked as used up', tone: 'teal' },
  disposed: { title: 'Disposed', tone: 'slate' },
};

const DISPOSAL_STATUS: Record<string, { title: string; tone: Tone }> = {
  pending: { title: 'Disposal requested', tone: 'amber' },
  approved: { title: 'Disposal approved', tone: 'emerald' },
  rejected: { title: 'Disposal rejected', tone: 'rose' },
};

const TIME_NOT_RECORDED =
  'Exact time not recorded — happened before history tracking';

function dayStart(isoDate: string): string {
  return new Date(`${isoDate}T00:00:00Z`).toISOString();
}

export function buildBatchTimeline(
  batch: BatchRow,
  rows: AuditRow[],
  disposals: DisposalRow[],
): BatchTimelineEvent[] {
  const events: BatchTimelineEvent[] = [];
  const recorded = rows.some(
    (row) => row.entity_type === 'Batch' && row.action === 'create',
  );
  if (!recorded) {
    events.push({
      at: dayStart(batch.production_date),
      title: 'Batch prepared',
      detail: `${batch.quantity} ${batch.unit}`,
      tone: 'sky',
      actor: null,
    });
  }

  for (const row of rows) {
    const at = new Date(row.created_at).toISOString();
    const actor = row.actor_name;
    const status = row.changes?.status;

    if (row.entity_type === 'Batch') {
      if (row.action === 'create') {
        events.push({
          at,
          title: 'Batch recorded',
          detail: `${batch.quantity} ${batch.unit} · use by ${batch.expiry_date}`,
          tone: 'sky',
          actor,
        });
      } else if (row.action === 'delete') {
        events.push({
          at,
          title: 'Batch deleted',
          detail: null,
          tone: 'rose',
          actor,
        });
      } else if (status) {
        const mapped = BATCH_STATUS[String(status.new)];
        if (mapped) {
          events.push({
            at,
            title: mapped.title,
            detail: null,
            tone: mapped.tone,
            actor,
          });
        }
      } else if (row.changes) {
        events.push({
          at,
          title: 'Details updated',
          detail: Object.keys(row.changes).join(', '),
          tone: 'violet',
          actor,
        });
      }
    } else if (row.entity_type === 'WasteDisposal') {
      if (row.action === 'create') {
        events.push({
          at,
          title: 'Disposal requested',
          detail: null,
          tone: 'amber',
          actor,
        });
      } else if (status) {
        const mapped = DISPOSAL_STATUS[String(status.new)];
        if (mapped) {
          events.push({
            at,
            title: mapped.title,
            detail: null,
            tone: mapped.tone,
            actor,
          });
        }
      }
    }
  }

  // Disposals recorded before auditing have no audit rows, so read them
  // straight from the disposal table.
  const audited = new Set(
    rows
      .filter((row) => row.entity_type === 'WasteDisposal')
      .map((row) => row.entity_id),
  );
  for (const disposal of disposals) {
    if (audited.has(disposal.id)) continue;
    const reason = disposal.reason.replace(/_/g, ' ');
    const detail = `${reason} · ${disposal.quantity} ${batch.unit}`;
    if (disposal.status === 'approved' && disposal.disposed_at) {
      events.push({
        at: new Date(disposal.disposed_at).toISOString(),
        title: 'Disposed',
        detail,
        tone: 'slate',
        actor: null,
      });
    } else {
      const mapped =
        DISPOSAL_STATUS[disposal.status] ?? DISPOSAL_STATUS.pending;
      events.push({
        at: dayStart(batch.production_date),
        title: mapped.title,
        detail: `${detail} · ${TIME_NOT_RECORDED}`,
        tone: mapped.tone,
        actor: null,
      });
    }
  }

  // The batch's current status, when no audit entry recorded it.
  const statusRecorded = rows.some(
    (row) =>
      row.entity_type === 'Batch' &&
      row.changes?.status !== undefined &&
      String(row.changes.status.new) === batch.status,
  );
  const fallback = BATCH_STATUS[batch.status];
  const coveredByDisposal = disposals.some(
    (disposal) => disposal.status === 'approved' && batch.status === 'disposed',
  );
  if (
    fallback &&
    batch.status !== 'active' &&
    !statusRecorded &&
    !coveredByDisposal
  ) {
    const expired = batch.status === 'expired';
    events.push({
      at: expired
        ? dayStart(batch.expiry_date)
        : dayStart(batch.production_date),
      title: fallback.title,
      detail: expired ? 'Reached its use-by date' : TIME_NOT_RECORDED,
      tone: fallback.tone,
      actor: null,
    });
  }

  return events.sort((a, b) => a.at.localeCompare(b.at));
}
