import { Inbox } from 'lucide-react';

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-2xl bg-gradient-to-b from-primary/5 to-transparent px-6 py-14 text-center ring-1 ring-foreground/5">
      <span className="flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
        <Inbox className="size-7" />
      </span>
      <p className="font-semibold">{title}</p>
      {description && (
        <p className="max-w-sm text-sm text-muted-foreground">{description}</p>
      )}
      {action}
    </div>
  );
}
