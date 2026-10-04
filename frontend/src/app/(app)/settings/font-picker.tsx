'use client';

import { RadioGroup as RadioGroupPrimitive } from 'radix-ui';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { FONTS, type FontKey } from '@/lib/theme/fonts';

export function FontPicker({
  name,
  defaultValue,
  disabled,
}: {
  name: string;
  defaultValue: FontKey;
  disabled?: boolean;
}) {
  return (
    <RadioGroupPrimitive.Root
      name={name}
      defaultValue={defaultValue}
      disabled={disabled}
      className="grid grid-cols-1 gap-3 sm:grid-cols-2"
    >
      {FONTS.map((font) => (
        <RadioGroupPrimitive.Item
          key={font.key}
          value={font.key}
          className={cn(
            'interactive group relative flex flex-col gap-1 rounded-lg border p-3 text-left outline-none',
            'hover:border-primary/50 hover:shadow-sm',
            'focus-visible:ring-3 focus-visible:ring-ring/50',
            'data-[state=checked]:border-primary data-[state=checked]:ring-2 data-[state=checked]:ring-primary/30',
            'disabled:cursor-not-allowed disabled:opacity-50',
          )}
        >
          <span className="flex items-center justify-between">
            <span
              className="text-lg leading-none"
              style={{ fontFamily: `var(${font.cssVariable})` }}
            >
              {font.label}
            </span>
            <RadioGroupPrimitive.Indicator>
              <Check className="size-4 text-primary" />
            </RadioGroupPrimitive.Indicator>
          </span>
          <span
            className="text-sm text-muted-foreground"
            style={{ fontFamily: `var(${font.cssVariable})` }}
          >
            The quick brown fox jumps over the lazy dog.
          </span>
          <span className="text-xs text-muted-foreground">
            {font.description}
          </span>
        </RadioGroupPrimitive.Item>
      ))}
    </RadioGroupPrimitive.Root>
  );
}
