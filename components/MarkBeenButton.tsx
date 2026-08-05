'use client';

import { useState, useTransition } from 'react';
import { Check } from 'lucide-react';

export function MarkBeenButton({ action }: { action: () => Promise<void> }) {
  const [done, setDone] = useState(false);
  const [, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={done}
      onClick={() => {
        setDone(true); // optimistic — the row updates server-side right after
        startTransition(() => action());
      }}
      className={`flex min-h-11 shrink-0 items-center gap-1 rounded-lg border px-2.5 text-sm font-bold ${
        done
          ? 'border-spruce bg-spruce text-white'
          : 'border-gravel/25 bg-card text-spruce active:bg-limestone'
      }`}
      aria-label={done ? 'Marked as been' : 'Mark as been'}
    >
      <Check className="size-4" aria-hidden="true" />
      {done ? 'Been!' : 'Been'}
    </button>
  );
}
