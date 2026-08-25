import { z } from 'zod';

const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  REDIS_URL: z.string().url(),
  BETTER_AUTH_SECRET: z.string().min(32),
  BETTER_AUTH_URL: z.string().url(),
  TRASH_TTL_DAYS: z.coerce.number().int().positive(),
  CRON_PURGE_SCHEDULE: z.string().trim().min(1),
  PORT: z.coerce.number().int().min(1).max(65_535)
});

export type AppEnv = z.infer<typeof envSchema>;

export function parseEnv(input: Record<string, string | undefined>): AppEnv {
  return envSchema.parse(input);
}

export function getEnv(): AppEnv {
  return parseEnv(process.env);
}
