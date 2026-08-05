'use client';

import { useState, useTransition } from 'react';
import { Star } from 'lucide-react';
import type { PlaceStatusValue } from '@/db/schema';
import { STATUS_LABELS } from '@/lib/labels';

const RATEABLE: PlaceStatusValue[] = ['been', 'favorite'];

export function StatusControl({
  action,
  status,
  rating,
  lastVisitedAt,
}: {
  action: (formData: FormData) => Promise<void>;
  status: PlaceStatusValue;
  rating: number | null;
  lastVisitedAt: string | null;
}) {
  const [s, setS] = useState<PlaceStatusValue>(status);
  const [r, setR] = useState<number | null>(rating);
  const [pending, startTransition] = useTransition();
  const canRate = RATEABLE.includes(s);

  return (
    <form
      action={(fd) => startTransition(() => action(fd))}
      className="flex flex-col gap-4 rounded-xl border border-gravel/15 bg-card p-4"
    >
      <input type="hidden" name="rating" value={canRate && r != null ? r : ''} />

      <fieldset>
        <legend className="text-sm font-bold">Status</legend>
        <div className="mt-1.5 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {(Object.keys(STATUS_LABELS) as PlaceStatusValue[]).map((v) => (
            <label key={v} className="cursor-pointer">
              <input
                type="radio"
                name="status"
                value={v}
                checked={s === v}
                onChange={() => setS(v)}
                className="peer sr-only"
              />
              <span className="flex min-h-10 items-center justify-center rounded-lg border border-gravel/25 bg-limestone px-2 text-sm peer-checked:border-spruce peer-checked:bg-spruce peer-checked:font-bold peer-checked:text-white peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-spruce">
                {STATUS_LABELS[v]}
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-bold">
          Rating
          {!canRate ? (
            <span className="block text-xs font-normal text-mist">
              Only for places you&apos;ve been
            </span>
          ) : null}
        </p>
        <div className="flex items-center gap-0.5" role="group" aria-label="Rating">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              disabled={!canRate}
              onClick={() => setR(r === n ? null : n)}
              aria-label={`${n} star${n > 1 ? 's' : ''}`}
              className="flex size-10 items-center justify-center disabled:opacity-30"
            >
              <Star
                className={`size-6 ${canRate && r != null && n <= r ? 'fill-blaze text-blaze' : 'text-mist'}`}
                aria-hidden="true"
              />
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between gap-3">
        <label htmlFor="lastVisitedAt" className="text-sm font-bold">
          Last visited
        </label>
        <input
          id="lastVisitedAt"
          type="date"
          name="lastVisitedAt"
          defaultValue={lastVisitedAt ?? ''}
          className="h-10 rounded-lg border border-gravel/25 bg-limestone px-2 text-sm"
        />
      </div>

      <button
        type="submit"
        disabled={pending}
        className="h-11 rounded-lg bg-spruce font-display text-lg font-semibold uppercase tracking-wide text-white disabled:opacity-60"
      >
        {pending ? 'Saving…' : 'Update status'}
      </button>
    </form>
  );
}
