import Link from 'next/link';
import { CalendarCheck, Star } from 'lucide-react';
import { getDb } from '@/db';
import { tags } from '@/db/schema';
import { FilterBar } from '@/components/FilterBar';
import { RememberListView } from '@/components/ListMemory';
import { MarkBeenButton } from '@/components/MarkBeenButton';
import { SortSelect } from '@/components/SortSelect';
import { StatusBlaze } from '@/components/StatusBlaze';
import { TypeIcon } from '@/components/TypeIcon';
import { COST_LABELS, DURATION_LABELS, TYPE_LABELS } from '@/lib/labels';
import { countActivePanelFilters, parseFilters } from '@/lib/filters';
import { homeCoords, queryPlaces, tagsForPlaces } from '@/lib/queries';
import { deletePlaceInline, markAsBeen, undoMarkAsBeen } from '@/app/(app)/places/actions';
import { SwipeRow } from '@/components/SwipeRow';

export default async function ListPage({ searchParams }: PageProps<'/'>) {
  const sp = await searchParams;
  const f = parseFilters(sp);
  const origin = f.from ?? homeCoords();

  const [rows, allTags] = await Promise.all([
    queryPlaces(f),
    getDb().select({ name: tags.name }).from(tags).orderBy(tags.name),
  ]);
  const tagsByPlace = await tagsForPlaces(rows.map((r) => r.id));

  const activeCount = countActivePanelFilters(f);
  const anyChip = f.close || f.rainy || f.free || f.quick || f.nores || f.priority;
  const anyFilter = activeCount > 0 || anyChip || f.status !== 'want_to_go';

  return (
    <div className="flex flex-col gap-3">
      <RememberListView />
      <FilterBar
        filters={f}
        allTags={allTags.map((t) => t.name)}
        hasHome={origin !== null}
        basePath="/"
      />

      <div className="flex items-center justify-between">
        <p className="text-sm text-mist">
          {rows.length} place{rows.length === 1 ? '' : 's'}
          {f.from ? ` · distances from ${f.fromLabel ?? 'custom point'}` : ''}
        </p>
        <SortSelect current={f.sort} hasHome={origin !== null} />
      </div>

      {rows.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-14 text-center">
          {anyFilter ? (
            <>
              <h1 className="font-display text-3xl font-bold uppercase tracking-wide">
                No places match these filters
              </h1>
              <p className="max-w-xs text-mist">Loosen one or start over.</p>
              <Link href="/" className="font-bold text-spruce underline">
                Clear all filters
              </Link>
            </>
          ) : (
            <>
              <h1 className="font-display text-3xl font-bold uppercase tracking-wide">
                No places yet
              </h1>
              <p className="max-w-xs text-mist">
                Add the first spot you want to check out — name, type, and state is all it takes.
              </p>
              <Link href="/places/new" className="font-bold text-spruce underline">
                Add a place
              </Link>
            </>
          )}
        </div>
      ) : (
        <ul className="flex flex-col gap-2">
          {rows.map((p) => {
            const placeTagNames = tagsByPlace.get(p.id) ?? [];
            return (
              <li key={p.id}>
                <SwipeRow
                  name={p.name}
                  editHref={`/places/${p.id}/edit`}
                  deleteAction={deletePlaceInline.bind(null, p.id)}
                >
                  <div className="flex items-stretch gap-2">
                <Link
                  href={`/places/${p.id}`}
                  className="flex min-h-16 min-w-0 flex-1 items-center gap-3 rounded-xl border border-gravel/15 bg-card p-3"
                >
                  <span
                    className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-limestone text-spruce"
                    title={TYPE_LABELS[p.type]}
                  >
                    <TypeIcon type={p.type} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-1.5">
                      <span className="truncate font-bold">{p.name}</span>
                      {p.priority ? (
                        <Star
                          className="size-3.5 shrink-0 fill-blaze text-blaze"
                          aria-label="Priority"
                        />
                      ) : null}
                    </span>
                    <span className="block truncate text-sm text-mist">
                      {p.locality ? `${p.locality}, ` : ''}
                      {p.state}
                      {p.distanceMiles != null ? ` · ${Math.round(p.distanceMiles)} mi away` : ''}
                      {p.cost ? ` · ${COST_LABELS[p.cost]}` : ''}
                      {p.duration ? ` · ${DURATION_LABELS[p.duration]}` : ''}
                      {p.rating != null ? ` · ★${p.rating}` : ''}
                    </span>
                    {placeTagNames.length > 0 || p.reservationRequired ? (
                      <span className="mt-1 flex flex-wrap items-center gap-1">
                        {p.reservationRequired ? (
                          <span className="flex items-center gap-0.5 rounded-full bg-limestone px-2 py-0.5 text-xs font-bold text-gravel">
                            <CalendarCheck className="size-3" aria-hidden="true" /> Res.
                          </span>
                        ) : null}
                        {placeTagNames.slice(0, 3).map((t) => (
                          <span
                            key={t}
                            className="rounded-full bg-limestone px-2 py-0.5 text-xs text-mist"
                          >
                            {t}
                          </span>
                        ))}
                      </span>
                    ) : null}
                  </span>
                  <StatusBlaze status={p.status} />
                </Link>
                {p.status === 'want_to_go' ? (
                  <MarkBeenButton
                    action={markAsBeen.bind(null, p.id)}
                    undoAction={undoMarkAsBeen.bind(null, p.id, p.lastVisitedAt)}
                  />
                ) : null}
                  </div>
                </SwipeRow>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
