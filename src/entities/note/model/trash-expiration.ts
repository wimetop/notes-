export function isTrashExpired(deletedAt: Date, ttlDays: number, now: Date): boolean {
  const expiresAt = deletedAt.getTime() + ttlDays * 86_400_000;
  return expiresAt < now.getTime();
}
