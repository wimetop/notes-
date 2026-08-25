import { sql } from 'drizzle-orm';
import { invalidateUserNotesCache } from '@/entities/note';
import { getEnv } from '@/shared/config';
import { db } from '@/shared/db';

export async function purgeTrash(): Promise<number> {
  const { TRASH_TTL_DAYS } = getEnv();
  const result = await db.execute<{ user_id: string }>(sql`DELETE FROM notes WHERE deleted_at IS NOT NULL AND deleted_at < NOW() - make_interval(days => ${TRASH_TTL_DAYS}) RETURNING user_id`);
  const userIds = new Set(result.rows.map((row) => row.user_id));
  await Promise.all([...userIds].map(invalidateUserNotesCache));
  console.info('trash:purge completed', { deleted: result.rows.length, users: userIds.size });
  return result.rows.length;
}
