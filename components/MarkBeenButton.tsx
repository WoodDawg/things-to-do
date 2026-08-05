'use client';

import { useState, useTransition } from 'react';
import { Check, Undo2 } from 'lucide-react';

export function MarkBeenButton({
  action,
  undoAction,
}: {
  action: () => Promise<void>;
  undoAction: () => Promise<void>;
}) {
  const [done, setDone] = useState(false);
  const [, startTransition] = useTransition();

  if (done) {
    return (
      <button
        type="button"
        onClick={() => {
          setDone(false);
          startTransition(() => undoAction());
        }}
        className="flex min-h-11 shrink-0 items-center gap-1 rounded-lg border border-spruce bg-spruce px-2.5 text-sm font-bold text-white"
        aria-label="Marked as been — undo"
      >
        <Undo2 className="size-4" aria-hidden="true" />
        Undo
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={() => {
        setDone(true); // optimistic; commit runs in the background
        startTransition(() => action());
      }}
      className="flex min-h-11 shrink-0 items-center gap-1 rounded-lg border border-gravel/25 bg-card px-2.5 text-sm font-bold text-spruce active:bg-limestone"
      aria-label="Mark as been"
    >
      <Check className="size-4" aria-hidden="true" />
      Been
    </button>
  );
}
