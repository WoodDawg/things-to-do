/**
 * Remove every dev fixture row (anything named "[DEV] …").
 * Run: npx tsx scripts/reset-dev.ts
 * place_tags rows go with them via ON DELETE CASCADE; the starter tag
 * vocabulary stays (it's part of the app, not the fixtures).
 */
import { loadEnvFile } from 'node:process';
import { like } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import * as schema from '../db/schema';
import { places } from '../db/schema';

try {
  loadEnvFile('.env.local');
} catch {}

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error('DATABASE_URL is not set in .env.local');
  process.exit(1);
}

const db = drizzle(neon(DATABASE_URL), { schema });

async function main() {
  const deleted = await db
    .delete(places)
    .where(like(places.name, '[DEV]%'))
    .returning({ id: places.id });
  console.log(`Removed ${deleted.length} fixture place(s).`);
}

main().then(() => process.exit(0));
