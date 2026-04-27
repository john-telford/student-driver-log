import { unlink } from 'fs/promises';

export default async function globalTeardown() {
  try {
    await unlink('./test.db');
  } catch {
    // test.db may not exist if global setup failed before creating it
  }
}
