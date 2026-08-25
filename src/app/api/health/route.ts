import { sql } from 'drizzle-orm';

import { createHealthHandler } from '@/shared/api/health-handler';
import { db } from '@/shared/db';
import { redis } from '@/shared/redis';

export const GET = createHealthHandler(
  () => db.execute(sql`SELECT 1`),
  () => redis.ping(),
);
