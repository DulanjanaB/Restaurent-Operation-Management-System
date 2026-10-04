import Image from 'next/image';
import { cn } from '@/lib/utils';

export const DEFAULT_BRAND_NAME = 'Restaurant Ops';

export type Brand = { name: string; logoUrl: string | null };

// The business name and logo set in Settings → Business profile. The logo
// is served from the app's own /uploads route, so it stays same-origin.
// `inverse` is for use on a coloured background (e.g. the login panel).
export function Brand({
  brand,
  className,
  inverse = false,
  size = 'sm',
}: {
  brand: Brand;
  className?: string;
  inverse?: boolean;
  size?: 'sm' | 'lg';
}) {
  const large = size === 'lg';
  const box = large ? 'size-20' : 'size-8';
  return (
    <div
      className={cn(
        'flex min-w-0 items-center',
        large ? 'flex-col gap-4 text-center' : 'gap-2.5',
        inverse && 'text-white',
        className,
      )}
    >
      {brand.logoUrl ? (
        <Image
          src={brand.logoUrl}
          alt={`${brand.name} logo`}
          width={large ? 80 : 32}
          height={large ? 80 : 32}
          unoptimized
          className={cn(
            'shrink-0 rounded-md bg-white/90 object-contain p-1',
            box,
          )}
        />
      ) : (
        <span
          className={cn(
            'flex shrink-0 items-center justify-center rounded-md font-semibold',
            box,
            large ? 'text-3xl' : 'text-sm',
            inverse
              ? 'bg-white/20 text-white'
              : 'bg-primary text-primary-foreground',
          )}
        >
          {brand.name.charAt(0).toUpperCase()}
        </span>
      )}
      <span
        className={cn(
          'truncate font-semibold',
          large && 'text-2xl tracking-wide',
        )}
      >
        {brand.name}
      </span>
    </div>
  );
}
