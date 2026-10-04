'use client';

import { createContext, useContext } from 'react';
import { DEFAULT_FORMATTING, type FormattingSettings } from '@/lib/format';

const FormattingContext = createContext<FormattingSettings>(
  DEFAULT_FORMATTING,
);

// Fed by the (app) layout with real values once Phase 2 (Settings) wires
// the System category in — until then every consumer gets DEFAULT_FORMATTING.
export function FormattingProvider({
  value,
  children,
}: {
  value: FormattingSettings;
  children: React.ReactNode;
}) {
  return (
    <FormattingContext.Provider value={value}>
      {children}
    </FormattingContext.Provider>
  );
}

export function useFormatting(): FormattingSettings {
  return useContext(FormattingContext);
}
