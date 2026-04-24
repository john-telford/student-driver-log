import { defineConfig } from 'drizzle-kit';

const url = process.env.DATABASE_URL ?? 'file:local.db';
const authToken = process.env.DATABASE_AUTH_TOKEN;

export default defineConfig({
  dialect: 'sqlite',
  schema: './src/db/schema.ts',
  out: './drizzle',
  dbCredentials: {
    // drizzle-kit doesn't support authToken as a separate field for sqlite;
    // embed it in the URL when connecting to Turso
    url: authToken ? `${url}?authToken=${authToken}` : url,
  },
});
