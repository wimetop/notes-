export function isTrashExpired(deletedAt: Date | null | undefined, ttlDays: number, now: Date): boolean {
  if (deletedAt === null || deletedAt === undefined) return false;
  const expiresAt = deletedAt.getTime() + ttlDays * 86_400_000;
  return expiresAt < now.getTime();
}
