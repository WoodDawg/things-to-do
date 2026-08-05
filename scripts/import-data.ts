/**
 * Restore places from an export file made by scripts/export-data.ts.
 * Run: npx tsx scripts/import-data.ts backups/things-to-do-YYYY-MM-DD.json
 *
 * Skips any place whose id already exists (safe to run against a live DB);
 * recreates tags and associations by name.
 */
import { loadEnvFile } from 'node:process';
import { readFileSync } from 'node:fs';
import { inArray } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import * as schema from '../db/schema';
import { places, placeTags, tags, type NewPlace } from '../db/schema';

try {
  loadEnvFile('.env.local');
} catch {}

const file = process.argv[2];
if (!file) {
  console.error('Usage: npx tsx scripts/import-data.ts <backup-file.json>');
  process.exit(1);
}
if (!process.env.DATABASE_URL) {
  console.error('DATABASE_URL is not set in .env.local');
  process.exit(1);
}

const db = drizzle(neon(process.env.DATABASE_URL), { schema });

type Exported = NewPlace & { id: string; tags: string[] };

async function main() {
  const payload = JSON.parse(readFileSync(file, 'utf8')) as { places: Exported[] };
  let inserted = 0;
  let skipped = 0;

  for (const p of payload.places) {
    const { tags: tagNames, ...row } = p;
    const res = await db
      .insert(places)
      .values({
        ...row,
        geocodedAt: row.geocodedAt ? new Date(row.geocodedAt) : null,
        createdAt: row.createdAt ? new Date(row.createdAt) : undefined,
        updatedAt: row.updatedAt ? new Date(row.updatedAt) : undefined,
      })
      .onConflictDoNothing({ target: places.id })
      .returning({ id: places.id });

    if (!res.length) {
      skipped++;
      continue;
    }

    if (tagNames.length) {
      await db
        .insert(tags)
        .values(tagNames.map((name) => ({ name })))
        .onConflictDoNothing();
      const tagRows = await db.select().from(tags).where(inArray(tags.name, tagNames));
      await db
        .insert(placeTags)
        .values(tagRows.map((t) => ({ placeId: p.id, tagId: t.id })))
        .onConflictDoNothing();
    }
    inserted++;
  }

  console.log(`Imported ${inserted} place(s), skipped ${skipped} already present.`);
}

main().then(() => process.exit(0));
