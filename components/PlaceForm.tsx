'use client';

import dynamic from 'next/dynamic';
import { useActionState, useRef, useState } from 'react';
import type { Place, PlaceTypeValue } from '@/db/schema';
import { COST_LABELS, DURATION_LABELS, SETTING_LABELS, TYPE_LABELS } from '@/lib/labels';
import { US_STATES } from '@/lib/states';
import { TypeIcon } from '@/components/TypeIcon';
import { TagInput } from '@/components/TagInput';
import type { PlaceFormState } from '@/app/(app)/places/actions';

const MapPreview = dynamic(() => import('@/components/MapPreview'), { ssr: false });

const TYPE_VALUES = Object.keys(TYPE_LABELS) as PlaceTypeValue[];

const inputCls = 'h-12 rounded-lg border border-gravel/25 bg-card px-4 text-base';
const labelCls = 'font-display text-lg font-semibold uppercase tracking-wide';
const smallLabelCls = 'text-sm font-bold';

type Initial = Partial<Place> & { tags?: string[] };

type Props = {
  action: (prev: PlaceFormState, formData: FormData) => Promise<PlaceFormState>;
  submitLabel: string;
  defaultState: string;
  existingTags: string[];
  initial?: Initial;
};

function Segmented<T extends string>({
  name,
  options,
  defaultValue,
  allowNone,
  cols = 4,
}: {
  name: string;
  options: Record<T, string>;
  defaultValue?: T | null;
  allowNone?: boolean;
  cols?: number;
}) {
  const entries = Object.entries(options) as [T, string][];
  return (
    <div className={`grid gap-2 ${cols === 3 ? 'grid-cols-3' : 'grid-cols-2 sm:grid-cols-4'}`}>
      {allowNone ? (
        <label className="cursor-pointer">
          <input
            type="radio"
            name={name}
            value=""
            defaultChecked={defaultValue == null}
            className="peer sr-only"
          />
          <span className="flex min-h-11 items-center justify-center rounded-lg border border-gravel/25 bg-card px-2 py-2 text-sm text-mist peer-checked:border-spruce peer-checked:bg-spruce peer-checked:font-bold peer-checked:text-white peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-spruce">
            Not sure
          </span>
        </label>
      ) : null}
      {entries.map(([value, label]) => (
        <label key={value} className="cursor-pointer">
          <input
            type="radio"
            name={name}
            value={value}
            defaultChecked={defaultValue === value}
            className="peer sr-only"
          />
          <span className="flex min-h-11 items-center justify-center rounded-lg border border-gravel/25 bg-card px-2 py-2 text-sm peer-checked:border-spruce peer-checked:bg-spruce peer-checked:font-bold peer-checked:text-white peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-spruce">
            {label}
          </span>
        </label>
      ))}
    </div>
  );
}

export function PlaceForm({ action, submitLabel, defaultState, existingTags, initial }: Props) {
  const [state, formAction, pending] = useActionState(action, { error: null });

  const [name, setName] = useState(initial?.name ?? '');
  const [type, setType] = useState<PlaceTypeValue | ''>(initial?.type ?? '');
  const [usState, setUsState] = useState(initial?.state ?? defaultState);

  const [address, setAddress] = useState(initial?.address ?? '');
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(
    initial?.latitude != null && initial?.longitude != null
      ? { lat: initial.latitude, lng: initial.longitude }
      : null,
  );
  const [geocoding, setGeocoding] = useState(false);
  const [geocodeFailed, setGeocodeFailed] = useState(false);
  const lastGeocoded = useRef(initial?.address ?? '');

  const ready = name.trim().length > 0 && type !== '' && usState !== '';

  // Geocode once per distinct address, on blur, and never block the save (§6).
  async function geocodeAddress() {
    const a = address.trim();
    if (a.length < 4 || a === lastGeocoded.current) return;
    lastGeocoded.current = a;
    setGeocoding(true);
    setGeocodeFailed(false);
    try {
      const res = await fetch('/api/geocode', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address: a, state: usState }),
      });
      const data = res.ok ? await res.json() : { result: null };
      if (data.result) {
        setCoords({ lat: data.result.latitude, lng: data.result.longitude });
      } else {
        setGeocodeFailed(true);
      }
    } catch {
      setGeocodeFailed(true);
    } finally {
      setGeocoding(false);
    }
  }

  return (
    <form action={formAction} className="flex flex-col gap-5">
      <input type="hidden" name="latitude" value={coords?.lat ?? ''} />
      <input type="hidden" name="longitude" value={coords?.lng ?? ''} />

      <div className="flex flex-col gap-1.5">
        <label htmlFor="name" className={labelCls}>
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
          className={inputCls}
          placeholder="Great Falls overlook"
        />
      </div>

      <fieldset className="flex flex-col gap-1.5">
        <legend className={labelCls}>Type</legend>
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
        <label htmlFor="state" className={labelCls}>
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

      <details className="group rounded-xl border border-gravel/15 bg-card" open={Boolean(initial)}>
        <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between px-4 font-display text-lg font-semibold uppercase tracking-wide [&::-webkit-details-marker]:hidden">
          More details
          <span className="text-mist transition-transform group-open:rotate-180" aria-hidden="true">
            ▾
          </span>
        </summary>

        <div className="flex flex-col gap-5 border-t border-gravel/10 p-4">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="address" className={smallLabelCls}>
              Address <span className="font-normal text-mist">(paste from Apple Maps)</span>
            </label>
            <input
              id="address"
              name="address"
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              onBlur={geocodeAddress}
              className={inputCls}
              placeholder="123 Falls Rd, Potomac"
            />
            {geocoding ? <p className="text-sm text-mist">Locating…</p> : null}
            {geocodeFailed && !coords ? (
              <p className="text-sm text-mist">
                Couldn&apos;t locate this address — the place still saves fine without a map
                position.
              </p>
            ) : null}
            {geocodeFailed && coords ? (
              <p className="text-sm text-mist">
                Couldn&apos;t locate the new address — keeping the previous pin. Drag it to
                correct.
              </p>
            ) : null}
          </div>

          {coords ? (
            <div className="flex flex-col gap-1.5">
              <p className={smallLabelCls}>
                Pin <span className="font-normal text-mist">(drag to correct)</span>
              </p>
              <MapPreview
                latitude={coords.lat}
                longitude={coords.lng}
                onMove={(lat, lng) => setCoords({ lat, lng })}
              />
            </div>
          ) : null}

          <div className="flex flex-col gap-1.5">
            <label htmlFor="locality" className={smallLabelCls}>
              Town / city
            </label>
            <input
              id="locality"
              name="locality"
              type="text"
              defaultValue={initial?.locality ?? ''}
              className={inputCls}
              placeholder="Potomac"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <p className={smallLabelCls}>Tags</p>
            <TagInput existingTags={existingTags} initial={initial?.tags} />
          </div>

          <fieldset className="flex flex-col gap-1.5">
            <legend className={smallLabelCls}>Setting</legend>
            <div className="mt-1.5">
              <Segmented
                name="setting"
                options={SETTING_LABELS}
                defaultValue={initial?.setting ?? 'either'}
                cols={3}
              />
            </div>
          </fieldset>

          <fieldset className="flex flex-col gap-1.5">
            <legend className={smallLabelCls}>How long</legend>
            <div className="mt-1.5">
              <Segmented
                name="duration"
                options={DURATION_LABELS}
                defaultValue={initial?.duration ?? null}
                allowNone
              />
            </div>
          </fieldset>

          <fieldset className="flex flex-col gap-1.5">
            <legend className={smallLabelCls}>Cost</legend>
            <div className="mt-1.5">
              <Segmented
                name="cost"
                options={COST_LABELS}
                defaultValue={initial?.cost ?? null}
                allowNone
              />
            </div>
          </fieldset>

          <div className="flex flex-col gap-3">
            <label className="flex min-h-11 items-center gap-3">
              <input
                type="checkbox"
                name="reservationRequired"
                defaultChecked={initial?.reservationRequired ?? false}
                className="size-5 accent-spruce"
              />
              <span className={smallLabelCls}>Reservation required</span>
            </label>
            <label className="flex min-h-11 items-center gap-3">
              <input
                type="checkbox"
                name="priority"
                defaultChecked={initial?.priority ?? false}
                className="size-5 accent-blaze"
              />
              <span className={smallLabelCls}>Priority</span>
            </label>
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="websiteUrl" className={smallLabelCls}>
              Website <span className="font-normal text-mist">(tickets, hours)</span>
            </label>
            <input
              id="websiteUrl"
              name="websiteUrl"
              type="url"
              inputMode="url"
              defaultValue={initial?.websiteUrl ?? ''}
              className={inputCls}
              placeholder="https://…"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="sourceUrl" className={smallLabelCls}>
              Where I found it
            </label>
            <input
              id="sourceUrl"
              name="sourceUrl"
              type="url"
              inputMode="url"
              defaultValue={initial?.sourceUrl ?? ''}
              className={inputCls}
              placeholder="https://…"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="notes" className={smallLabelCls}>
              Notes
            </label>
            <textarea
              id="notes"
              name="notes"
              rows={4}
              defaultValue={initial?.notes ?? ''}
              className="rounded-lg border border-gravel/25 bg-card px-4 py-3 text-base"
            />
          </div>
        </div>
      </details>

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
