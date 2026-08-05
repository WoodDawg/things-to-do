/**
 * Dev fixture data (spec §8) — invented places for testing filters, sorting,
 * and distance. Run: npx tsx scripts/seed-dev.ts
 *
 * - lat/lng are HARDCODED offsets from HOME_LAT/HOME_LNG — this script never
 *   geocodes and must never call Nominatim.
 * - Idempotent: matches on normalized (name, state); re-running adds nothing.
 * - Every row is prefixed [DEV]; scripts/reset-dev.ts removes them all.
 */
import { loadEnvFile } from 'node:process';
import { and, eq, ilike, inArray } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import * as schema from '../db/schema';
import { places, placeTags, tags } from '../db/schema';

try {
  loadEnvFile('.env.local');
} catch {}

const DATABASE_URL = process.env.DATABASE_URL;
const HOME_LAT = Number.parseFloat(process.env.HOME_LAT ?? '');
const HOME_LNG = Number.parseFloat(process.env.HOME_LNG ?? '');

if (!DATABASE_URL) {
  console.error('DATABASE_URL is not set in .env.local');
  process.exit(1);
}
if (!Number.isFinite(HOME_LAT) || !Number.isFinite(HOME_LNG)) {
  console.error('HOME_LAT / HOME_LNG must be set in .env.local so fixture distances make sense');
  process.exit(1);
}

const db = drizzle(neon(DATABASE_URL), { schema });

// Fixed offsets — deterministic, no network. 1° lat ≈ 69 mi.
function at(miles: number, bearingDeg: number): { latitude: number; longitude: number } {
  const rad = (bearingDeg * Math.PI) / 180;
  const latitude = HOME_LAT + (miles * Math.cos(rad)) / 69;
  const longitude =
    HOME_LNG + (miles * Math.sin(rad)) / (69 * Math.cos((HOME_LAT * Math.PI) / 180));
  return { latitude: +latitude.toFixed(6), longitude: +longitude.toFixed(6) };
}

const HOME_STATE = (process.env.HOME_STATE ?? 'MD').toUpperCase();
const OTHERS = ['VA', 'CO', 'PA'].filter((s) => s !== HOME_STATE);
const [S2, S3] = OTHERS; // two states that are not home

type Fixture = {
  name: string;
  type: (typeof schema.placeType.enumValues)[number];
  state: string;
  locality?: string;
  coords?: { latitude: number; longitude: number } | null;
  status?: (typeof schema.placeStatus.enumValues)[number];
  setting?: (typeof schema.placeSetting.enumValues)[number];
  duration?: (typeof schema.placeDuration.enumValues)[number] | null;
  cost?: (typeof schema.placeCost.enumValues)[number] | null;
  reservationRequired?: boolean;
  priority?: boolean;
  rating?: number;
  lastVisitedAt?: string;
  notes?: string;
  tags?: string[];
};

const fixtures: Fixture[] = [
  { name: '[DEV] Millbrook Falls Trail', type: 'outdoors', state: HOME_STATE, locality: 'Millbrook', coords: at(5, 40), setting: 'outdoor', duration: 'half_day', cost: 'free', tags: ['hike', 'waterfall', 'dog-friendly'], notes: 'Second parking lot fills late morning.\nUpper falls best after rain.' },
  { name: '[DEV] Harbor Glass Museum', type: 'museum', state: HOME_STATE, locality: 'Eastport', coords: at(8, 120), setting: 'indoor', duration: 'quick', cost: 'medium', status: 'been', rating: 4, lastVisitedAt: '2026-05-16', tags: ['kid-friendly'] },
  { name: '[DEV] Stone Bridge Brewery', type: 'drink', state: HOME_STATE, locality: 'Weller', coords: at(12, 200), setting: 'either', duration: 'quick', cost: 'low', status: 'favorite', rating: 5, lastVisitedAt: '2026-06-02', tags: ['brewery', 'date-night'] },
  { name: '[DEV] Old Copper Mine Tour', type: 'attraction', state: HOME_STATE, locality: 'Ridgeline', coords: at(22, 320), setting: 'indoor', duration: 'half_day', cost: 'high', reservationRequired: true, tags: ['historic', 'kid-friendly'] },
  { name: '[DEV] Pawpaw Orchard Farm Stand', type: 'food', state: HOME_STATE, locality: 'Levit', coords: at(30, 90), setting: 'outdoor', duration: 'quick', cost: 'low', tags: ['farm', 'seasonal'] },
  { name: '[DEV] Council Rock Overlook', type: 'landmark', state: HOME_STATE, locality: 'Tressle', coords: at(45, 270), setting: 'outdoor', duration: 'quick', cost: 'free', priority: true, tags: ['overlook', 'scenic-drive'] },
  { name: '[DEV] Blue Heron Aquarium', type: 'attraction', state: S2, locality: 'Norvale', coords: at(58, 150), setting: 'indoor', duration: 'half_day', cost: 'high', tags: ['aquarium', 'kid-friendly', 'crowded'] },
  { name: '[DEV] Foxglove Winery', type: 'drink', state: S2, locality: 'Carda', coords: at(75, 210), setting: 'either', duration: 'half_day', cost: 'medium', reservationRequired: true, status: 'been', rating: 3, lastVisitedAt: '2025-10-12', tags: ['winery', 'date-night'] },
  { name: '[DEV] Antler Ridge State Park', type: 'outdoors', state: S2, locality: 'Kesslers Gap', coords: at(110, 240), setting: 'outdoor', duration: 'full_day', cost: 'low', priority: true, tags: ['state-park', 'hike', 'overlook'] },
  { name: '[DEV] Grist & Gears Holiday Market', type: 'event', state: S2, locality: 'Brandt', coords: at(150, 30), setting: 'outdoor', duration: 'quick', cost: 'free', tags: ['seasonal', 'crowded'], status: 'ruled_out', notes: 'Only runs late November through December.' },
  { name: '[DEV] Cascade Hollow Lodge', type: 'lodging', state: S3, locality: 'Timberline', coords: at(300, 285), setting: 'either', duration: 'multi_day', cost: 'high', reservationRequired: true, tags: ['national-park'] },
  { name: '[DEV] High Desert Zoo', type: 'attraction', state: S3, locality: 'Sagebrush', coords: at(600, 275), setting: 'outdoor', duration: 'full_day', cost: 'medium', tags: ['zoo', 'kid-friendly'] },
  { name: '[DEV] Continental Divide Scenic Byway', type: 'outdoors', state: S3, locality: undefined, coords: at(1500, 278), setting: 'outdoor', duration: 'multi_day', cost: 'free', status: 'favorite', rating: 5, lastVisitedAt: '2024-08-20', tags: ['scenic-drive', 'national-park'] },
  // Null-handling rows (spec §8.4): no coordinates; one also has null duration + cost.
  { name: '[DEV] Hidden Springs Trailhead', type: 'outdoors', state: S2, locality: 'Verner', coords: null, setting: 'outdoor', duration: null, cost: null, notes: 'Unmarked pull-off — no address, needs the pin set by hand someday.', tags: ['hike'] },
  { name: '[DEV] The Tin Lantern Supper Club', type: 'shopping', state: HOME_STATE, locality: 'Weller', coords: null, setting: 'indoor', duration: 'quick', cost: 'medium', status: 'ruled_out', tags: [] },
];

async function main() {
  let inserted = 0;
  let skipped = 0;

  for (const f of fixtures) {
    const existing = await db
      .select({ id: places.id })
      .from(places)
      .where(and(ilike(places.name, f.name), eq(places.state, f.state)))
      .limit(1);
    if (existing.length) {
      skipped++;
      continue;
    }

    const [row] = await db
      .insert(places)
      .values({
        name: f.name,
        type: f.type,
        state: f.state,
        locality: f.locality ?? null,
        latitude: f.coords?.latitude ?? null,
        longitude: f.coords?.longitude ?? null,
        geocodedAt: null, // hardcoded, not geocoded
        status: f.status ?? 'want_to_go',
        setting: f.setting ?? 'either',
        duration: f.duration ?? null,
        cost: f.cost ?? null,
        reservationRequired: f.reservationRequired ?? false,
        priority: f.priority ?? false,
        rating: f.rating ?? null,
        lastVisitedAt: f.lastVisitedAt ?? null,
        notes: f.notes ?? null,
      })
      .returning({ id: places.id });

    if (f.tags?.length) {
      const tagRows = await db.select().from(tags).where(inArray(tags.name, f.tags));
      if (tagRows.length) {
        await db
          .insert(placeTags)
          .values(tagRows.map((t) => ({ placeId: row.id, tagId: t.id })))
          .onConflictDoNothing();
      }
    }
    inserted++;
  }

  console.log(`Fixtures: ${inserted} inserted, ${skipped} already present (idempotent).`);
}

main().then(() => process.exit(0));
