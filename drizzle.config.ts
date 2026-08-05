import { loadEnvFile } from 'node:process';
import { defineConfig } from 'drizzle-kit';

// drizzle-kit doesn't load Next's env files itself — pull in .env.local for
// db:generate / db:migrate. Skipped silently if the file doesn't exist (CI).
try {
  loadEnvFile('.env.local');
} catch {}

export default defineConfig({
  schema: './db/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
