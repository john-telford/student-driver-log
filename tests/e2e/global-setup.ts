import { execSync } from 'child_process';

export default async function globalSetup() {
  // Clear any Turso token so drizzle-kit targets the local test file, not a remote DB
  process.env.DATABASE_URL = 'file:./test.db';
  process.env.DATABASE_AUTH_TOKEN = '';

  execSync('npm run db:migrate', {
    stdio: 'inherit',
    env: {
      ...process.env,
      DATABASE_URL: 'file:./test.db',
      DATABASE_AUTH_TOKEN: '',
    },
  });
}
