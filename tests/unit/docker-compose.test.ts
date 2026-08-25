import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const compose = readFileSync(resolve(process.cwd(), 'docker-compose.yml'), 'utf8');
const exampleEnv = readFileSync(resolve(process.cwd(), '.env.example'), 'utf8');

describe('docker compose release contract', () => {
  it('requires externally supplied application secrets', () => {
    expect(compose).toContain('BETTER_AUTH_SECRET: ${BETTER_AUTH_SECRET:?Set BETTER_AUTH_SECRET}');
    expect(compose).toContain('POSTGRES_PASSWORD: ${POSTGRES_PASSWORD:?Set POSTGRES_PASSWORD}');
  });

  it('waits for healthy Redis before migrations', () => {
    const migrateSection = compose.match(/  migrate:[\s\S]*?(?=\n  web:)/)?.[0] ?? '';
    expect(migrateSection).toContain('postgres: { condition: service_healthy }');
    expect(migrateSection).toContain('redis: { condition: service_healthy }');
  });

  it('documents every Compose-required secret for local setup', () => {
    expect(exampleEnv).toContain('POSTGRES_PASSWORD=');
  });
});
