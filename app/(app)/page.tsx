import Link from 'next/link';
import { desc, eq, inArray } from 'drizzle-orm';
import { CalendarCheck } from 'lucide-react';
import { getDb } from '@/db';
import { places, placeTags, tags } from '@/db/schema';
import { StatusBlaze } from '@/components/StatusBlaze';
import { TypeIcon } from '@/components/TypeIcon';
import { COST_LABELS, DURATION_LABELS, TYPE_LABELS } from '@/lib/labels';

export default async function ListPage() {
  const db = getDb();
  const rows = await db.select().from(places).orderBy(desc(places.createdAt));

  if (rows.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 py-16 text-center">
        <h1 className="font-display text-3xl font-bold uppercase tracking-wide">No places yet</h1>
        <p className="max-w-xs text-mist">
          Add the first spot you want to check out — name, type, and state is all it takes.
        </p>
        <Link href="/places/new" className="font-bold text-spruce underline">
          Add a place
        </Link>
      </div>
    );
  }

  const tagRows = await db
    .select({ placeId: placeTags.placeId, name: tags.name })
    .from(placeTags)
    .innerJoin(tags, eq(placeTags.tagId, tags.id))
    .where(inArray(placeTags.placeId, rows.map((r) => r.id)));
  const tagsByPlace = new Map<string, string[]>();
  for (const t of tagRows) {
    tagsByPlace.set(t.placeId, [...(tagsByPlace.get(t.placeId) ?? []), t.name]);
  }

  return (
    <ul className="flex flex-col gap-2">
      {rows.map((p) => {
        const placeTagNames = tagsByPlace.get(p.id) ?? [];
        return (
          <li key={p.id}>
            <Link
              href={`/places/${p.id}`}
              className="flex min-h-16 items-center gap-3 rounded-xl border border-gravel/15 bg-card p-3"
            >
              <span
                className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-limestone text-spruce"
                title={TYPE_LABELS[p.type]}
              >
                <TypeIcon type={p.type} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate font-bold">{p.name}</span>
                <span className="block truncate text-sm text-mist">
                  {p.locality ? `${p.locality}, ` : ''}
                  {p.state}
                  {p.cost ? ` · ${COST_LABELS[p.cost]}` : ''}
                  {p.duration ? ` · ${DURATION_LABELS[p.duration]}` : ''}
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
          </li>
        );
      })}
    </ul>
  );
}
