import { describe, expect, it } from 'vitest';

import { parseEnv } from '@/shared/config/env';

const validEnv = {
  DATABASE_URL: 'postgresql://notes_plus:notes_plus@localhost:5432/notes_plus',
  REDIS_URL: 'redis://localhost:6379',
  BETTER_AUTH_SECRET: 'a-32-character-minimum-secret-value',
  BETTER_AUTH_URL: 'http://localhost:3000',
  TRASH_TTL_DAYS: '30',
  CRON_PURGE_SCHEDULE: '0 3 * * *',
  PORT: '3000'
};

describe('parseEnv', () => {
  it('rejects a non-positive trash TTL', () => {
    expect(() => parseEnv({ ...validEnv, TRASH_TTL_DAYS: '0' })).toThrow();
  });

  it('coerces the HTTP port to a number', () => {
    expect(parseEnv(validEnv).PORT).toBe(3000);
  });
});
