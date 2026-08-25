type PurgeResult = { rows: Array<{ user_id: string }> };

type PurgeTrashDependencies = {
  execute: (ttlDays: number) => Promise<PurgeResult>;
  invalidate: (userId: string) => Promise<void>;
  ttlDays: number;
  log: (message: string, metadata: { deleted: number; users: number }) => void;
};

export function createPurgeTrashJob({
  execute,
  invalidate,
  ttlDays,
  log,
}: PurgeTrashDependencies): () => Promise<number> {
  return async (): Promise<number> => {
    const result = await execute(ttlDays);
    const userIds = new Set(result.rows.map((row) => row.user_id));

    await Promise.all([...userIds].map((userId) => invalidate(userId)));
    log('trash:purge completed', { deleted: result.rows.length, users: userIds.size });

    return result.rows.length;
  };
}
