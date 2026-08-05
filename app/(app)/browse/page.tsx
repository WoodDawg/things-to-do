import Link from 'next/link';
import { asc } from 'drizzle-orm';
import { getDb } from '@/db';
import { places, type Place } from '@/db/schema';
import { StatusBlaze } from '@/components/StatusBlaze';
import { TypeIcon } from '@/components/TypeIcon';
import { US_STATES } from '@/lib/states';

export const metadata = { title: 'Browse — Things To Do' };

const stateNames = new Map(US_STATES.map((s) => [s.code, s.name]));

// Derived grouping only (spec §2): no towns table, just GROUP-BY-shaped JS.
export default async function BrowsePage() {
  const rows = await getDb()
    .select()
    .from(places)
    .orderBy(asc(places.state), asc(places.locality), asc(places.name));

  if (rows.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 py-16 text-center">
        <h1 className="font-display text-3xl font-bold uppercase tracking-wide">
          Nothing to browse yet
        </h1>
        <p className="max-w-xs text-mist">Once you add places, they group by state and town here.</p>
        <Link href="/places/new" className="font-bold text-spruce underline">
          Add a place
        </Link>
      </div>
    );
  }

  const byState = new Map<string, Map<string, Place[]>>();
  for (const p of rows) {
    const locality = p.locality ?? '';
    const state = byState.get(p.state) ?? new Map<string, Place[]>();
    state.set(locality, [...(state.get(locality) ?? []), p]);
    byState.set(p.state, state);
  }

  const been = (list: Place[]) => list.filter((p) => p.status === 'been').length;

  return (
    <div className="flex flex-col gap-2">
      <h1 className="sr-only">Browse by state</h1>
      {[...byState.entries()].map(([state, localities]) => {
        const all = [...localities.values()].flat();
        return (
          <details
            key={state}
            className="group rounded-xl border border-gravel/15 bg-card"
            open={byState.size === 1}
          >
            <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between px-4 [&::-webkit-details-marker]:hidden">
              <span className="font-display text-xl font-bold uppercase tracking-wide">
                {stateNames.get(state) ?? state}
              </span>
              <span className="text-sm text-mist">
                {been(all)}/{all.length} been
                <span className="ml-2 inline-block transition-transform group-open:rotate-180">
                  ▾
                </span>
              </span>
            </summary>
            <div className="flex flex-col gap-3 border-t border-gravel/10 p-4">
              {[...localities.entries()]
                .sort(([a], [b]) => (a === '' ? 1 : b === '' ? -1 : a.localeCompare(b)))
                .map(([locality, list]) => (
                  <section key={locality || '(none)'}>
                    <h3 className="mb-1 flex items-baseline justify-between text-sm font-bold">
                      {locality || <span className="text-mist">No town listed</span>}
                      <span className="font-normal text-mist">
                        {been(list)}/{list.length} been
                      </span>
                    </h3>
                    <ul className="flex flex-col">
                      {list.map((p) => (
                        <li key={p.id}>
                          <Link
                            href={`/places/${p.id}`}
                            className="flex min-h-11 items-center gap-2 rounded-lg px-2 -mx-2 active:bg-limestone"
                          >
                            <TypeIcon type={p.type} className="size-4 shrink-0 text-spruce" />
                            <span className="min-w-0 flex-1 truncate">{p.name}</span>
                            <StatusBlaze status={p.status} />
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </section>
                ))}
            </div>
          </details>
        );
      })}
    </div>
  );
}
