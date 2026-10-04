'use client';

import { RadioGroup as RadioGroupPrimitive } from 'radix-ui';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { THEMES, type ThemeKey } from '@/lib/theme/themes';

export function ThemeSwatchPicker({
  name,
  defaultValue,
  disabled,
}: {
  name: string;
  defaultValue: ThemeKey;
  disabled?: boolean;
}) {
  return (
    <RadioGroupPrimitive.Root
      name={name}
      defaultValue={defaultValue}
      disabled={disabled}
      className="grid grid-cols-2 gap-3 sm:grid-cols-4"
    >
      {THEMES.map((theme) => (
        <RadioGroupPrimitive.Item
          key={theme.key}
          value={theme.key}
          className={cn(
            'interactive group relative flex flex-col gap-2 rounded-lg border p-3 text-left outline-none',
            'hover:border-primary/50 hover:shadow-sm',
            'focus-visible:ring-3 focus-visible:ring-ring/50',
            'data-[state=checked]:border-primary data-[state=checked]:ring-2 data-[state=checked]:ring-primary/30',
            'disabled:cursor-not-allowed disabled:opacity-50',
          )}
        >
          <span
            className="flex h-10 w-full overflow-hidden rounded-md border"
            style={{ backgroundColor: theme.swatch.background }}
          >
            <span
              className="h-full w-1/2"
              style={{ backgroundColor: theme.swatch.primary }}
            />
            <span
              className="h-full w-1/2"
              style={{ backgroundColor: theme.swatch.accent }}
            />
          </span>
          <span className="flex items-center justify-between">
            <span className="text-sm font-medium">{theme.label}</span>
            <RadioGroupPrimitive.Indicator>
              <Check className="size-4 text-primary" />
            </RadioGroupPrimitive.Indicator>
          </span>
          <span className="text-xs text-muted-foreground">
            {theme.description}
          </span>
        </RadioGroupPrimitive.Item>
      ))}
    </RadioGroupPrimitive.Root>
  );
}
