/**
 * Export every place (with its tags) to a timestamped JSON file in ./backups.
 * Run: npm run export
 * Pair with scripts/import-data.ts to restore.
 */
import { loadEnvFile } from 'node:process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { eq } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import * as schema from '../db/schema';
import { places, placeTags, tags } from '../db/schema';

try {
  loadEnvFile('.env.local');
} catch {}

if (!process.env.DATABASE_URL) {
  console.error('DATABASE_URL is not set in .env.local');
  process.exit(1);
}

const db = drizzle(neon(process.env.DATABASE_URL), { schema });

async function main() {
  const allPlaces = await db.select().from(places);
  const allTagRows = await db
    .select({ placeId: placeTags.placeId, name: tags.name })
    .from(placeTags)
    .innerJoin(tags, eq(placeTags.tagId, tags.id));

  const tagsByPlace = new Map<string, string[]>();
  for (const t of allTagRows) {
    tagsByPlace.set(t.placeId, [...(tagsByPlace.get(t.placeId) ?? []), t.name]);
  }

  const payload = {
    exportedAt: new Date().toISOString(),
    placeCount: allPlaces.length,
    places: allPlaces.map((p) => ({ ...p, tags: tagsByPlace.get(p.id) ?? [] })),
  };

  mkdirSync('backups', { recursive: true });
  const file = join('backups', `things-to-do-${new Date().toISOString().slice(0, 10)}.json`);
  writeFileSync(file, JSON.stringify(payload, null, 2));
  console.log(`Exported ${allPlaces.length} place(s) to ${file}`);
}

main().then(() => process.exit(0));
