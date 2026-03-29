'use client';

import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';

type SnackbarVariant = 'success' | 'error' | 'info';

type SnackbarPayload = {
  message: string;
  variant?: SnackbarVariant;
  durationMs?: number;
};

type SnackbarContextValue = {
  showSnackbar: (payload: SnackbarPayload) => void;
};

const SnackbarContext = createContext<SnackbarContextValue | null>(null);

export function useSnackbar() {
  const context = useContext(SnackbarContext);
  if (!context) {
    throw new Error('useSnackbar must be used within SnackbarProvider');
  }
  return context;
}

export default function SnackbarProvider({ children }: { children: React.ReactNode }) {
  const [snackbar, setSnackbar] = useState<{ message: string; variant: SnackbarVariant } | null>(null);

  const showSnackbar = useCallback(({ message, variant = 'info', durationMs = 3200 }: SnackbarPayload) => {
    setSnackbar({ message, variant });
    window.setTimeout(() => {
      setSnackbar((current) => (current?.message === message ? null : current));
    }, durationMs);
  }, []);

  const value = useMemo(() => ({ showSnackbar }), [showSnackbar]);

  const styles: Record<SnackbarVariant, string> = {
    success: 'border-green-500/50 bg-green-500/15 text-green-200',
    error: 'border-red-500/50 bg-red-500/15 text-red-200',
    info: 'border-neon-blue/50 bg-neon-blue/15 text-neon-blue'
  };

  return (
    <SnackbarContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed bottom-6 left-1/2 z-[200] w-full max-w-xl -translate-x-1/2 px-4">
        {snackbar && (
          <div className={`border px-4 py-3 text-[11px] uppercase tracking-widest shadow-2xl backdrop-blur-sm ${styles[snackbar.variant]}`}>
            {snackbar.message}
          </div>
        )}
      </div>
    </SnackbarContext.Provider>
  );
}

