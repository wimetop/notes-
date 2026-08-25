export function getNotesCacheKey(userId: string): string {
  return `notes:v1:list:${userId}`;
}
