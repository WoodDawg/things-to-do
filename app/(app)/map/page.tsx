import Link from 'next/link';
import { getDb } from '@/db';
import { tags } from '@/db/schema';
import { FilterBar } from '@/components/FilterBar';
import { PlacesMap } from '@/components/PlacesMap';
import { StatusBlaze } from '@/components/StatusBlaze';
import { STATUS_LABELS } from '@/lib/labels';
import { parseFilters } from '@/lib/filters';
import { homeCoords, queryPlaces } from '@/lib/queries';

export const metadata = { title: 'Map — Things To Do' };

export default async function MapPage({ searchParams }: PageProps<'/map'>) {
  const sp = await searchParams;
  const f = parseFilters(sp);
  const home = homeCoords();

  const [rows, allTags] = await Promise.all([
    queryPlaces(f),
    getDb().select({ name: tags.name }).from(tags).orderBy(tags.name),
  ]);

  const mappable = rows.filter(
    (p): p is typeof p & { latitude: number; longitude: number } =>
      p.latitude != null && p.longitude != null,
  );
  const unmapped = rows.length - mappable.length;

  return (
    <div className="flex flex-col gap-3">
      <FilterBar
        filters={f}
        allTags={allTags.map((t) => t.name)}
        hasHome={home !== null}
        basePath="/map"
      />

      <div className="flex items-center justify-between text-sm text-mist">
        <p>
          {mappable.length} on map
          {unmapped > 0 ? ` · ${unmapped} without a location` : ''}
        </p>
        <span className="flex items-center gap-2" aria-hidden="true">
          {(['want_to_go', 'been', 'favorite'] as const).map((s) => (
            <span key={s} className="flex items-center gap-1 text-xs">
              <StatusBlaze status={s} />
              {STATUS_LABELS[s]}
            </span>
          ))}
        </span>
      </div>

      {mappable.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-14 text-center">
          <h1 className="font-display text-3xl font-bold uppercase tracking-wide">
            Nothing to map
          </h1>
          <p className="max-w-xs text-mist">
            No places with coordinates match these filters. Places get a location when their
            address geocodes or you drag the pin.
          </p>
          <Link href="/map" className="font-bold text-spruce underline">
            Clear all filters
          </Link>
        </div>
      ) : (
        <div className="h-[calc(100dvh-21rem)] min-h-72 overflow-hidden rounded-xl border border-gravel/15">
          <PlacesMap
            places={mappable.map((p) => ({
              id: p.id,
              name: p.name,
              status: p.status,
              latitude: p.latitude,
              longitude: p.longitude,
            }))}
            home={home ? { lat: home.lat, lng: home.lng } : null}
          />
        </div>
      )}

      <p className="text-xs text-mist">Geocoding © OpenStreetMap contributors, ODbL</p>
    </div>
  );
}
