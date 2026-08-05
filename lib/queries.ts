import 'server-only';
import { and, asc, desc, eq, ilike, inArray, or, sql, type SQL } from 'drizzle-orm';
import { getDb } from '@/db';
import { places, placeTags, tags, type Place } from '@/db/schema';
import type { Filters } from '@/lib/filters';

export type PlaceWithDistance = Place & { distanceMiles: number | null };

export function homeCoords(): { lat: number; lng: number } | null {
  const lat = Number.parseFloat(process.env.HOME_LAT ?? '');
  const lng = Number.parseFloat(process.env.HOME_LNG ?? '');
  return Number.isFinite(lat) && Number.isFinite(lng) ? { lat, lng } : null;
}

/** Haversine distance in miles, in SQL so it can be sorted and filtered on. */
function distanceSql(home: { lat: number; lng: number }): SQL<number | null> {
  return sql<number | null>`
    CASE WHEN ${places.latitude} IS NULL OR ${places.longitude} IS NULL THEN NULL ELSE
      3958.8 * 2 * asin(sqrt(
        power(sin(radians((${places.latitude} - ${home.lat}) / 2)), 2) +
        cos(radians(${home.lat})) * cos(radians(${places.latitude})) *
        power(sin(radians((${places.longitude} - ${home.lng}) / 2)), 2)
      ))
    END`;
}

export async function queryPlaces(f: Filters): Promise<PlaceWithDistance[]> {
  const db = getDb();
  const home = homeCoords();
  const distance = home ? distanceSql(home) : sql<number | null>`NULL`;

  const conds: SQL[] = [];

  if (f.status === 'visited') conds.push(inArray(places.status, ['been', 'favorite']));
  else if (f.status !== 'all') conds.push(eq(places.status, f.status));
  if (f.rainy) conds.push(inArray(places.setting, ['indoor', 'either']));
  if (f.free) conds.push(eq(places.cost, 'free'));
  if (f.quick) conds.push(inArray(places.duration, ['quick', 'half_day']));
  if (f.nores) conds.push(eq(places.reservationRequired, false));
  if (f.priority) conds.push(eq(places.priority, true));

  if (f.state) conds.push(eq(places.state, f.state));
  if (f.locality) conds.push(ilike(places.locality, `%${f.locality}%`));
  if (f.types.length) conds.push(inArray(places.type, f.types));
  if (f.setting) conds.push(eq(places.setting, f.setting));
  if (f.durations.length) conds.push(inArray(places.duration, f.durations));
  if (f.costs.length) conds.push(inArray(places.cost, f.costs));
  if (f.res) conds.push(eq(places.reservationRequired, f.res === 'yes'));

  if (f.q) {
    const like = `%${f.q}%`;
    conds.push(
      or(
        ilike(places.name, like),
        ilike(places.notes, like),
        ilike(places.address, like),
      )!,
    );
  }

  // Places must carry EVERY selected tag.
  if (f.tags.length) {
    const tagged = db
      .select({ pid: placeTags.placeId })
      .from(placeTags)
      .innerJoin(tags, eq(tags.id, placeTags.tagId))
      .where(inArray(tags.name, f.tags))
      .groupBy(placeTags.placeId)
      .having(sql`count(DISTINCT ${tags.name}) = ${f.tags.length}`);
    conds.push(inArray(places.id, tagged));
  }

  // Distance limits require coordinates; null-coord places are excluded (spec §7).
  const maxdist = f.close ? Math.min(60, f.maxdist ?? 60) : f.maxdist;
  if (maxdist != null && home) {
    conds.push(sql`${distance} <= ${maxdist}`);
  }

  const orderBy =
    f.sort === 'new'
      ? [desc(places.createdAt)]
      : f.sort === 'old'
        ? [asc(places.createdAt)]
        : f.sort === 'rating'
          ? [sql`${places.rating} DESC NULLS LAST`, asc(places.name)]
          : f.sort === 'name'
            ? [asc(places.name)]
            : home
              ? [sql`${distance} ASC NULLS LAST`, desc(places.createdAt)]
              : [desc(places.createdAt)];

  const rows = await db
    .select({ place: places, distanceMiles: distance })
    .from(places)
    .where(conds.length ? and(...conds) : undefined)
    .orderBy(...orderBy);

  return rows.map((r) => ({ ...r.place, distanceMiles: r.distanceMiles }));
}

export async function tagsForPlaces(placeIds: string[]): Promise<Map<string, string[]>> {
  const map = new Map<string, string[]>();
  if (!placeIds.length) return map;
  const rows = await getDb()
    .select({ placeId: placeTags.placeId, name: tags.name })
    .from(placeTags)
    .innerJoin(tags, eq(placeTags.tagId, tags.id))
    .where(inArray(placeTags.placeId, placeIds));
  for (const r of rows) {
    map.set(r.placeId, [...(map.get(r.placeId) ?? []), r.name]);
  }
  return map;
}
