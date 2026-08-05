'use client';

import { useActionState, useState } from 'react';
import type { PlaceTypeValue } from '@/db/schema';
import { TYPE_LABELS } from '@/lib/labels';
import { US_STATES } from '@/lib/states';
import { TypeIcon } from '@/components/TypeIcon';
import type { PlaceFormState } from '@/app/(app)/places/actions';

const TYPE_VALUES = Object.keys(TYPE_LABELS) as PlaceTypeValue[];

type Props = {
  action: (prev: PlaceFormState, formData: FormData) => Promise<PlaceFormState>;
  submitLabel: string;
  defaultState: string;
  initial?: { name: string; type: PlaceTypeValue; state: string };
};

export function PlaceForm({ action, submitLabel, defaultState, initial }: Props) {
  const [state, formAction, pending] = useActionState(action, { error: null });

  const [name, setName] = useState(initial?.name ?? '');
  const [type, setType] = useState<PlaceTypeValue | ''>(initial?.type ?? '');
  const [usState, setUsState] = useState(initial?.state ?? defaultState);

  const ready = name.trim().length > 0 && type !== '' && usState !== '';

  return (
    <form action={formAction} className="flex flex-col gap-5">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="name" className="font-display text-lg font-semibold uppercase tracking-wide">
          Name
        </label>
        <input
          id="name"
          name="name"
          type="text"
          required
          autoFocus={!initial}
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="h-12 rounded-lg border border-gravel/25 bg-card px-4 text-base"
          placeholder="Great Falls overlook"
        />
      </div>

      <fieldset className="flex flex-col gap-1.5">
        <legend className="font-display text-lg font-semibold uppercase tracking-wide">Type</legend>
        <div className="mt-1.5 grid grid-cols-3 gap-2">
          {TYPE_VALUES.map((t) => (
            <label key={t} className="cursor-pointer">
              <input
                type="radio"
                name="type"
                value={t}
                checked={type === t}
                onChange={() => setType(t)}
                className="peer sr-only"
                required
              />
              <span className="flex min-h-11 items-center justify-center gap-1.5 rounded-lg border border-gravel/25 bg-card px-2 py-2 text-sm peer-checked:border-spruce peer-checked:bg-spruce peer-checked:font-bold peer-checked:text-white peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-spruce">
                <TypeIcon type={t} className="size-4 shrink-0" />
                {TYPE_LABELS[t]}
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="state" className="font-display text-lg font-semibold uppercase tracking-wide">
          State
        </label>
        <select
          id="state"
          name="state"
          required
          value={usState}
          onChange={(e) => setUsState(e.target.value)}
          className="h-12 rounded-lg border border-gravel/25 bg-card px-3 text-base"
        >
          <option value="" disabled>
            Pick a state…
          </option>
          {US_STATES.map((s) => (
            <option key={s.code} value={s.code}>
              {s.name}
            </option>
          ))}
        </select>
      </div>

      {state.error ? (
        <p role="alert" className="text-sm font-bold text-blaze">
          {state.error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={!ready || pending}
        className="h-12 rounded-lg bg-spruce font-display text-lg font-semibold uppercase tracking-wide text-white active:bg-spruce-deep disabled:opacity-50"
      >
        {pending ? 'Saving…' : submitLabel}
      </button>
    </form>
  );
}
