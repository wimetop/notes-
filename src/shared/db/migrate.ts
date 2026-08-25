import { migrate } from 'drizzle-orm/node-postgres/migrator';

import { db, pool } from './client';

async function run(): Promise<void> {
  await migrate(db, { migrationsFolder: 'drizzle' });
  await pool.end();
}

void run();
