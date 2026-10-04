import { cn } from '@/lib/utils';

// The production-day colour shown on batch lists, detail pages and stickers.
export function DayChip({
  day,
  color,
  className,
}: {
  day?: string;
  color?: { name: string; hex: string };
  className?: string;
}) {
  if (!day || !color) return <span className="text-muted-foreground">—</span>;
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-black/10',
        className,
      )}
      style={{ backgroundColor: `${color.hex}33` }}
    >
      <span
        className="size-2.5 rounded-full"
        style={{ backgroundColor: color.hex }}
      />
      {day} · {color.name}
    </span>
  );
}
