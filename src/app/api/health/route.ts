import { sql } from 'drizzle-orm';

import { db } from '@/shared/db';
import { redis } from '@/shared/redis';

export async function GET(): Promise<Response> {
  try {
    await Promise.all([db.execute(sql`SELECT 1`), redis.ping()]);
    return Response.json({ status: 'ok', db: true, redis: true });
  } catch (error) {
    console.error('Healthcheck failed', error);
    return Response.json({ status: 'unavailable', db: false, redis: false }, { status: 503 });
  }
}
