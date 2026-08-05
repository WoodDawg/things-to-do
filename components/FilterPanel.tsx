'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { SlidersHorizontal, X } from 'lucide-react';
import type { Filters } from '@/lib/filters';
import {
  COST_LABELS,
  DURATION_LABELS,
  STATUS_LABELS,
  TYPE_LABELS,
} from '@/lib/labels';
import { US_STATES } from '@/lib/states';

const chk =
  'flex min-h-10 cursor-pointer items-center justify-center rounded-lg border border-gravel/25 bg-limestone px-2 py-1.5 text-sm peer-checked:border-spruce peer-checked:bg-spruce peer-checked:font-bold peer-checked:text-white peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-spruce';
const label = 'text-sm font-bold';

export function FilterPanel({
  filters,
  activeCount,
  allTags,
  hasHome,
}: {
  filters: Filters;
  activeCount: number;
  allTags: string[];
  hasHome: boolean;
}) {
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const [maxdist, setMaxdist] = useState(filters.maxdist ?? 300);

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex min-h-9 shrink-0 items-center gap-1.5 rounded-full border border-gravel/25 bg-card px-3 text-sm font-bold"
      >
        <SlidersHorizontal className="size-4" aria-hidden="true" />
        Filters
        {activeCount > 0 ? (
          <span className="rounded-full bg-spruce px-1.5 text-xs text-white">{activeCount}</span>
        ) : null}
      </button>

      {open ? (
        <div className="fixed inset-0 z-30 flex flex-col justify-end bg-gravel/40" role="dialog" aria-modal="true" aria-label="Filters">
          <button
            type="button"
            aria-label="Close filters"
            onClick={() => setOpen(false)}
            className="flex-1"
          />
          <div ref={panelRef} className="max-h-[85dvh] overflow-y-auto rounded-t-2xl bg-limestone">
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gravel/10 bg-limestone px-4 py-3">
              <h2 className="font-display text-2xl font-bold uppercase tracking-wide">Filters</h2>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close"
                className="flex size-10 items-center justify-center rounded-lg"
              >
                <X className="size-5" aria-hidden="true" />
              </button>
            </div>

            {/* Native GET form -> everything lands in searchParams, shareable and refresh-proof */}
            <form method="get" action="/" className="flex flex-col gap-5 p-4">
              <div className="flex flex-col gap-1.5">
                <label htmlFor="f-q" className={label}>
                  Search
                </label>
                <input
                  id="f-q"
                  type="search"
                  name="q"
                  defaultValue={filters.q ?? ''}
                  placeholder="Name, notes, address…"
                  className="h-11 rounded-lg border border-gravel/25 bg-card px-3 text-base"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="f-status" className={label}>
                    Status
                  </label>
                  <select
                    id="f-status"
                    name="status"
                    defaultValue={filters.status}
                    className="h-11 rounded-lg border border-gravel/25 bg-card px-2 text-base"
                  >
                    {Object.entries(STATUS_LABELS).map(([v, l]) => (
                      <option key={v} value={v}>
                        {l}
                      </option>
                    ))}
                    <option value="all">Everything</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label htmlFor="f-state" className={label}>
                    State
                  </label>
                  <select
                    id="f-state"
                    name="state"
                    defaultValue={filters.state ?? ''}
                    className="h-11 rounded-lg border border-gravel/25 bg-card px-2 text-base"
                  >
                    <option value="">Any</option>
                    {US_STATES.map((s) => (
                      <option key={s.code} value={s.code}>
                        {s.code}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label htmlFor="f-locality" className={label}>
                  Town
                </label>
                <input
                  id="f-locality"
                  type="text"
                  name="locality"
                  defaultValue={filters.locality ?? ''}
                  className="h-11 rounded-lg border border-gravel/25 bg-card px-3 text-base"
                />
              </div>

              <fieldset>
                <legend className={label}>Type</legend>
                <div className="mt-1.5 grid grid-cols-3 gap-2">
                  {Object.entries(TYPE_LABELS).map(([v, l]) => (
                    <label key={v}>
                      <input
                        type="checkbox"
                        name="type"
                        value={v}
                        defaultChecked={filters.types.includes(v as never)}
                        className="peer sr-only"
                      />
                      <span className={chk}>{l}</span>
                    </label>
                  ))}
                </div>
              </fieldset>

              {allTags.length ? (
                <fieldset>
                  <legend className={label}>Tags</legend>
                  <div className="mt-1.5 flex flex-wrap gap-2">
                    {allTags.map((t) => (
                      <label key={t}>
                        <input
                          type="checkbox"
                          name="tag"
                          value={t}
                          defaultChecked={filters.tags.includes(t)}
                          className="peer sr-only"
                        />
                        <span className="flex min-h-9 cursor-pointer items-center rounded-full border border-gravel/25 bg-limestone px-3 py-1 text-sm peer-checked:border-spruce peer-checked:bg-spruce peer-checked:font-bold peer-checked:text-white peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-spruce">
                          {t}
                        </span>
                      </label>
                    ))}
                  </div>
                </fieldset>
              ) : null}

              <fieldset>
                <legend className={label}>Setting</legend>
                <div className="mt-1.5 grid grid-cols-4 gap-2">
                  <label>
                    <input
                      type="radio"
                      name="setting"
                      value=""
                      defaultChecked={filters.setting === null}
                      className="peer sr-only"
                    />
                    <span className={chk}>Any</span>
                  </label>
                  {(['indoor', 'outdoor', 'either'] as const).map((v) => (
                    <label key={v}>
                      <input
                        type="radio"
                        name="setting"
                        value={v}
                        defaultChecked={filters.setting === v}
                        className="peer sr-only"
                      />
                      <span className={chk}>{v === 'either' ? 'Either' : v === 'indoor' ? 'Indoor' : 'Outdoor'}</span>
                    </label>
                  ))}
                </div>
              </fieldset>

              <fieldset>
                <legend className={label}>How long</legend>
                <div className="mt-1.5 grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {Object.entries(DURATION_LABELS).map(([v, l]) => (
                    <label key={v}>
                      <input
                        type="checkbox"
                        name="duration"
                        value={v}
                        defaultChecked={filters.durations.includes(v as never)}
                        className="peer sr-only"
                      />
                      <span className={chk}>{l}</span>
                    </label>
                  ))}
                </div>
              </fieldset>

              <fieldset>
                <legend className={label}>Cost</legend>
                <div className="mt-1.5 grid grid-cols-4 gap-2">
                  {Object.entries(COST_LABELS).map(([v, l]) => (
                    <label key={v}>
                      <input
                        type="checkbox"
                        name="cost"
                        value={v}
                        defaultChecked={filters.costs.includes(v as never)}
                        className="peer sr-only"
                      />
                      <span className={chk}>{l}</span>
                    </label>
                  ))}
                </div>
              </fieldset>

              <fieldset>
                <legend className={label}>Reservation</legend>
                <div className="mt-1.5 grid grid-cols-3 gap-2">
                  {(
                    [
                      ['', 'Any'],
                      ['no', 'No booking'],
                      ['yes', 'Booking req.'],
                    ] as const
                  ).map(([v, l]) => (
                    <label key={v}>
                      <input
                        type="radio"
                        name="res"
                        value={v}
                        defaultChecked={(filters.res ?? '') === v}
                        className="peer sr-only"
                      />
                      <span className={chk}>{l}</span>
                    </label>
                  ))}
                </div>
              </fieldset>

              {hasHome ? (
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="f-maxdist" className={label}>
                    Max distance:{' '}
                    <output className="font-normal text-mist">
                      {maxdist >= 300 ? 'any' : `${maxdist} mi`}
                    </output>
                  </label>
                  <input
                    id="f-maxdist"
                    type="range"
                    name="maxdist"
                    min={10}
                    max={300}
                    step={10}
                    value={maxdist}
                    onChange={(e) => setMaxdist(Number(e.target.value))}
                    disabled={false}
                    className="accent-spruce"
                  />
                  {/* 300 = no limit: drop the param so it doesn't filter */}
                  {maxdist >= 300 ? <input type="hidden" name="maxdist" value="" /> : null}
                </div>
              ) : null}

              {filters.sort !== 'dist' ? (
                <input type="hidden" name="sort" value={filters.sort} />
              ) : null}

              <div className="sticky bottom-0 -mx-4 flex gap-2 border-t border-gravel/10 bg-limestone p-4">
                <Link
                  href="/"
                  onClick={() => setOpen(false)}
                  className="flex h-12 flex-1 items-center justify-center rounded-lg border border-gravel/25 bg-card font-display text-lg font-semibold uppercase tracking-wide"
                >
                  Clear all
                </Link>
                <button
                  type="submit"
                  className="flex h-12 flex-1 items-center justify-center rounded-lg bg-spruce font-display text-lg font-semibold uppercase tracking-wide text-white"
                >
                  Apply
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </>
  );
}
