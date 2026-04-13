import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  dialect: 'sqlite',
  schema: './src/db/schema.ts',
  out: './drizzle',
  dbCredentials: {
    // drizzle-kit does not load .env.local; fall back to local file for dev
    url: process.env.DATABASE_URL ?? 'file:local.db',
  },
});
