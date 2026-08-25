import { describe, expect, it } from 'vitest';

const baseUrl = process.env.E2E_BASE_URL ?? 'http://localhost:3000';

async function register(name: string): Promise<string> {
  const email = `e2e-${crypto.randomUUID()}@example.test`;
  const response = await fetch(`${baseUrl}/api/auth/sign-up/email`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', origin: baseUrl },
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
});
