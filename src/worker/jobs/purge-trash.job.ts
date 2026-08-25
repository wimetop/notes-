import { sql } from 'drizzle-orm';
import { invalidateUserNotesCache } from '@/entities/note';
import { getEnv } from '@/shared/config';
import { db } from '@/shared/db';

import { createPurgeTrashJob } from './purge-trash-core';

export const purgeTrash = createPurgeTrashJob({
  execute: (ttlDays) => db.execute<{ user_id: string }>(
    sql`DELETE FROM notes WHERE deleted_at IS NOT NULL AND deleted_at < NOW() - make_interval(days => ${ttlDays}) RETURNING user_id`,
  ),
  invalidate: invalidateUserNotesCache,
  ttlDays: getEnv().TRASH_TTL_DAYS,
  log: console.info,
});
