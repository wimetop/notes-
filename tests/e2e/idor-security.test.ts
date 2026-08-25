import { describe, expect, it } from 'vitest';
import { execFileSync } from 'node:child_process';

const baseUrl = process.env.E2E_BASE_URL ?? 'http://localhost:3000';

async function register(name: string): Promise<string> {
  const email = `e2e-${crypto.randomUUID()}@example.test`;
  const response = await fetch(`${baseUrl}/api/auth/sign-up/email`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      origin: baseUrl,
      'x-forwarded-for': `198.51.100.${Math.floor(Math.random() * 200) + 1}`,
    },
    body: JSON.stringify({ name, email, password: 'SafePassword123!' }),
  });
  expect(response.status).toBe(200);

  const setCookie = response.headers.get('set-cookie');
  expect(setCookie).not.toBeNull();
  return setCookie!.split(';', 1)[0]!;
}

describe('IDOR protection', () => {
  it('returns 404 when User B requests a note owned by User A', async () => {
    const aliceCookie = await register('E2E Alice');
    const created = await fetch(`${baseUrl}/api/notes`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', cookie: aliceCookie },
      body: JSON.stringify({ title: 'Alice secret', body: 'Private content' }),
    });
    expect(created.status).toBe(201);
    const note = await created.json() as { id: string };

    const bobCookie = await register('E2E Bob');
    const response = await fetch(`${baseUrl}/api/notes/${note.id}`, {
      headers: { cookie: bobCookie },
    });

    expect(response.status).toBe(404);
    await expect(response.json()).resolves.toEqual({ error: 'Not found' });
  });

  it('keeps a note in trash until its owner restores it', async () => {
    const cookie = await register('E2E Lifecycle');
    const created = await fetch(`${baseUrl}/api/notes`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', cookie },
      body: JSON.stringify({ title: 'Recoverable note' }),
    });
    expect(created.status).toBe(201);
    const note = await created.json() as { id: string };

    const removed = await fetch(`${baseUrl}/api/notes/${note.id}`, {
      method: 'DELETE',
      headers: { cookie },
    });
    expect(removed.status).toBe(204);

    const trash = await fetch(`${baseUrl}/api/notes?trash=true`, { headers: { cookie } });
    await expect(trash.json()).resolves.toEqual(expect.arrayContaining([
      expect.objectContaining({ id: note.id, deletedAt: expect.any(String) }),
    ]));

    const restored = await fetch(`${baseUrl}/api/notes/${note.id}/restore`, {
      method: 'POST',
      headers: { cookie },
    });
    expect(restored.status).toBe(200);

    const active = await fetch(`${baseUrl}/api/notes`, { headers: { cookie } });
    await expect(active.json()).resolves.toEqual(expect.arrayContaining([
      expect.objectContaining({ id: note.id, deletedAt: null }),
    ]));
  });

  it('warms the per-user Redis cache after an active notes list request', async () => {
    const cookie = await register('E2E Cache');
    const created = await fetch(`${baseUrl}/api/notes`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', cookie },
      body: JSON.stringify({ title: 'Cached note' }),
    });
    const note = await created.json() as { userId: string };

    const response = await fetch(`${baseUrl}/api/notes`, { headers: { cookie } });
    expect(response.status).toBe(200);

    const keyExists = execFileSync('docker', [
      'compose', 'exec', '-T', 'redis', 'redis-cli', 'EXISTS', `notes:v1:list:${note.userId}`,
    ], { cwd: process.cwd(), encoding: 'utf8' });
    expect(keyExists.trim()).toBe('1');
  });

  it('permanently purges a note older than the configured trash TTL', async () => {
    const cookie = await register('E2E Purge');
    const created = await fetch(`${baseUrl}/api/notes`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', cookie },
      body: JSON.stringify({ title: 'Expired note' }),
    });
    const note = await created.json() as { id: string; userId: string };

    await fetch(`${baseUrl}/api/notes/${note.id}`, { method: 'DELETE', headers: { cookie } });
    await fetch(`${baseUrl}/api/notes`, { headers: { cookie } });
    execFileSync('docker', [
      'compose', 'exec', '-T', 'postgres', 'psql', '-U', 'notes_plus', '-d', 'notes_plus', '-c',
      `UPDATE notes SET deleted_at = NOW() - INTERVAL '31 days' WHERE id = '${note.id}'`,
    ], { cwd: process.cwd(), stdio: 'pipe' });
    const output = execFileSync('docker', [
      'compose', 'run', '--rm', '--no-deps', 'migrate', 'npx', 'tsx', '-e',
      "import('./src/worker/jobs/purge-trash.job.ts').then(async ({ purgeTrash }) => { console.log(await purgeTrash()); process.exit(0); })",
    ], { cwd: process.cwd(), encoding: 'utf8' });

    expect(output).toContain('1');
    const cacheAfterPurge = execFileSync('docker', [
      'compose', 'exec', '-T', 'redis', 'redis-cli', 'EXISTS', `notes:v1:list:${note.userId}`,
    ], { cwd: process.cwd(), encoding: 'utf8' });
    expect(cacheAfterPurge.trim()).toBe('0');
    const response = await fetch(`${baseUrl}/api/notes/${note.id}`, { headers: { cookie } });
    expect(response.status).toBe(404);
  });
});
