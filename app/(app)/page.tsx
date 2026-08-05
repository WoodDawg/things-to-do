import Link from 'next/link';
import { desc } from 'drizzle-orm';
import { getDb } from '@/db';
import { places } from '@/db/schema';
import { StatusBlaze } from '@/components/StatusBlaze';
import { TypeIcon } from '@/components/TypeIcon';
import { TYPE_LABELS } from '@/lib/labels';

export default async function ListPage() {
  const rows = await getDb().select().from(places).orderBy(desc(places.createdAt));

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

  return (
    <ul className="flex flex-col gap-2">
      {rows.map((p) => (
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
              </span>
            </span>
            <StatusBlaze status={p.status} />
          </Link>
        </li>
      ))}
    </ul>
  );
}
