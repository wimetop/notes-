# Нотатки+ Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a production-ready, authenticated notes application with soft-delete, resilient Redis caching, scheduled purge worker, and Docker deployment.

**Architecture:** Next.js App Router is a routing facade over FSD slices. The note entity owns DTOs, cache keys, server service, client HTTP API, and query hooks. A standalone BullMQ process uses a separate Redis configuration and purges expired trash records.

**Tech Stack:** Next.js 16, React, TypeScript, Drizzle ORM, PostgreSQL, Better Auth, ioredis, BullMQ, Zod, React Hook Form, TanStack Query, Vitest, tsup, Docker Compose.

**Spec:** `docs/superpowers/specs/2026-08-25-notes-plus-design.md`

## Global Constraints

- Keep `src/app` limited to pages, layouts, and route handlers that delegate into FSD public APIs.
- Allow imports only in the direction `app -> pages-flat -> widgets -> features -> entities -> shared`; consume slices through `index.ts` public APIs.
- Use strict TypeScript with `noUncheckedIndexedAccess: true`; do not use `any` or unjustified type assertions.
- Validate server DTOs with `schema.strict().parse()` and client forms with the same Zod schemas through `zodResolver`.
- Derive `userId` only from Better Auth server sessions; return `404` for missing and foreign notes.
- Use `notes:v1:list:${userId}` with a 60-second TTL only for unfiltered active-note lists.
- Route all cache access through the safe web Redis wrapper; Redis errors must not produce HTTP 500 responses.
- Use a distinct BullMQ Redis connection with `maxRetriesPerRequest: null` and `enableReadyCheck: false`.
- Keep Better Auth `user.id` and `notes.user_id` as PostgreSQL `text`; `notes.id` is UUID.
- Build the worker to `dist/worker` with tsup for Node 22 ESM and ship it with Next standalone output.

---

## File map

- Root configuration: `package.json`, `tsconfig.json`, `next.config.ts`, `drizzle.config.ts`, `tsup.config.ts`, `.env.example`, `vitest.config.ts`.
- Shared infrastructure: `src/shared/config/env.ts`, `src/shared/db/*`, `src/shared/redis/*`, `src/shared/lib/*`, `src/shared/api/*`, `src/shared/ui/*`.
- Auth: `src/shared/lib/auth.ts`, `src/entities/user/*`, `src/entities/session/*`, `src/features/auth/*`.
- Notes: `src/entities/note/{model,api,ui}`, and one feature slice per mutation.
- Screens/composition: `src/widgets/*`, `src/pages-flat/*`, `src/app/*`.
- Background processing: `src/worker/{index.ts,redis.ts,queues/*,jobs/*}`.
- Deployment/testing: `Dockerfile`, `docker-compose.yml`, `tests/unit/*`.

### Task 1: Bootstrap the typed application and test runner

**Files:**
- Create: `package.json`, `tsconfig.json`, `next.config.ts`, `vitest.config.ts`, `.env.example`, `src/app/layout.tsx`, `src/app/globals.css`
- Test: `tests/unit/smoke.test.ts`

**Interfaces:**
- Produces: `npm run dev`, `npm run build`, `npm run typecheck`, `npm test`, `npm run db:generate`, `npm run db:migrate`, `npm run worker`, and `npm run worker:build`.

- [ ] **Step 1: Write the failing smoke test.**

```ts
import { describe, expect, it } from 'vitest';

describe('test runner', () => {
  it('executes TypeScript tests', () => {
    expect(true).toBe(true);
  });
});
```

- [ ] **Step 2: Run the test to verify the initial failure.**

Run: `npm test -- tests/unit/smoke.test.ts`

Expected: FAIL because the package scripts and Vitest configuration do not exist.

- [ ] **Step 3: Add dependencies and strict configuration.**

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build && npm run worker:build",
    "typecheck": "tsc --noEmit",
    "test": "vitest run",
    "worker:build": "tsup",
    "worker": "node dist/worker/index.js"
  }
}
```

```json
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "baseUrl": ".",
    "paths": { "@/*": ["./src/*"] }
  }
}
```

Configure Next `output: 'standalone'`, set up `src/app/layout.tsx`, and include the listed runtime, development, and type packages.

- [ ] **Step 4: Run the validation cycle.**

Run: `npm install; npm test -- tests/unit/smoke.test.ts; npm run typecheck`

Expected: PASS, then typecheck exits 0.

- [ ] **Step 5: Commit.**

Run: `git add package.json package-lock.json tsconfig.json next.config.ts vitest.config.ts .env.example src/app tests/unit/smoke.test.ts && git commit -m "chore: bootstrap typed Next application"`

### Task 2: Add environment validation and database schema

**Files:**
- Create: `src/shared/config/env.ts`, `src/shared/config/index.ts`, `src/shared/db/schema.ts`, `src/shared/db/client.ts`, `src/shared/db/migrate.ts`, `src/shared/db/index.ts`, `drizzle.config.ts`
- Test: `tests/unit/env.test.ts`

**Interfaces:**
- Produces: `env` with validated `DATABASE_URL`, `REDIS_URL`, `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`, `TRASH_TTL_DAYS`, `CRON_PURGE_SCHEDULE`, and `PORT`; `db`; `schema`.

- [ ] **Step 1: Write failing environment tests.**

```ts
it('rejects a non-positive trash TTL', () => {
  expect(() => parseEnv({ ...validEnv, TRASH_TTL_DAYS: '0' })).toThrow();
});

it('coerces PORT into a number', () => {
  expect(parseEnv(validEnv).PORT).toBe(3000);
});
```

- [ ] **Step 2: Run the focused test.**

Run: `npm test -- tests/unit/env.test.ts`

Expected: FAIL because `parseEnv` is missing.

- [ ] **Step 3: Implement configuration and Drizzle tables.**

```ts
export const parseEnv = (input: NodeJS.ProcessEnv) => envSchema.parse(input);
export const env = parseEnv(process.env);
```

```ts
export const notes = pgTable('notes', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  title: varchar('title', { length: 120 }).notNull(),
  body: text('body'),
  deletedAt: timestamp('deleted_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull()
}, (table) => [index('notes_user_id_idx').on(table.userId), index('notes_deleted_at_idx').on(table.deletedAt)]);
```

Define Better Auth `user`, `session`, `account`, and `verification` tables with text IDs, initialize the Postgres Drizzle client, and configure generation/migration scripts.

- [ ] **Step 4: Verify schema and configuration.**

Run: `npm test -- tests/unit/env.test.ts; npm run typecheck; npm run db:generate`

Expected: all exit 0 and a migration is generated.

- [ ] **Step 5: Commit.**

Run: `git add drizzle.config.ts drizzle src/shared/config src/shared/db tests/unit/env.test.ts && git commit -m "feat: add validated environment and database schema"`

### Task 3: Implement resilient web Redis and cache keys

**Files:**
- Create: `src/shared/redis/client.ts`, `src/shared/redis/safe-redis.ts`, `src/shared/redis/index.ts`, `src/entities/note/model/query-keys.ts`, `src/entities/note/model/cache.ts`, `src/entities/note/model/index.ts`
- Test: `tests/unit/note-cache.test.ts`

**Interfaces:**
- Produces: `getNotesCacheKey(userId: string): string`, `safeRedis.get/set/del/delPattern`, `noteKeys`.

- [ ] **Step 1: Write failing cache-key tests.**

```ts
it('namespaces the active-list cache by user', () => {
  expect(getNotesCacheKey('user-a')).toBe('notes:v1:list:user-a');
});
```

- [ ] **Step 2: Run the test.**

Run: `npm test -- tests/unit/note-cache.test.ts`

Expected: FAIL because the cache helper is missing.

- [ ] **Step 3: Implement safe cache and query-key factories.**

```ts
export const getNotesCacheKey = (userId: string) => `notes:v1:list:${userId}`;
export const noteKeys = {
  all: ['notes'] as const,
  lists: () => [...noteKeys.all, 'list'] as const,
  list: (search?: string) => [...noteKeys.lists(), { search: search ?? '' }] as const,
  trash: () => [...noteKeys.all, 'trash'] as const,
  detail: (id: string) => [...noteKeys.all, 'detail', id] as const
};
```

Wrap every Redis operation with `try/catch`, log an operation name and error, return `null` from failed reads, and return `void` from failed writes/deletes. Set cache client options to `lazyConnect: true` and `maxRetriesPerRequest: 1`.

- [ ] **Step 4: Run unit/type checks.**

Run: `npm test -- tests/unit/note-cache.test.ts; npm run typecheck`

Expected: PASS and exit 0.

- [ ] **Step 5: Commit.**

Run: `git add src/shared/redis src/entities/note/model tests/unit/note-cache.test.ts && git commit -m "feat: add resilient notes cache primitives"`

### Task 4: Configure Better Auth and server session guards

**Files:**
- Create: `src/shared/lib/auth.ts`, `src/shared/lib/require-auth-session.ts`, `src/shared/lib/index.ts`, `src/entities/user/model/types.ts`, `src/entities/user/index.ts`, `src/entities/session/index.ts`, `src/app/api/auth/[...all]/route.ts`
- Test: `tests/unit/require-auth-session.test.ts`

**Interfaces:**
- Produces: `auth`, `requireAuthSession(): Promise<{ id: string; email: string }>` for route handlers, and `requirePageSession()` for server components.

- [ ] **Step 1: Write failing unauthorized-session tests.**

```ts
it('throws a 401 response when no session user exists', async () => {
  await expect(requireAuthSession()).rejects.toMatchObject({ status: 401 });
});
```

- [ ] **Step 2: Run the test.**

Run: `npm test -- tests/unit/require-auth-session.test.ts`

Expected: FAIL because the guard is missing.

- [ ] **Step 3: Implement Better Auth and guards.**

```ts
const session = await auth.api.getSession({ headers: await headers() });
if (session?.user === undefined) throw new Response('Unauthorized', { status: 401 });
return { id: session.user.id, email: session.user.email };
```

Configure Better Auth with the Drizzle adapter and email/password. The page guard redirects unauthenticated users to `/login`; the route-handler guard throws 401. Export GET and POST Better Auth handler methods from the public route.

- [ ] **Step 4: Verify the guard contract.**

Run: `npm test -- tests/unit/require-auth-session.test.ts; npm run typecheck`

Expected: PASS and exit 0.

- [ ] **Step 5: Commit.**

Run: `git add src/shared/lib src/entities/user src/entities/session src/app/api/auth tests/unit/require-auth-session.test.ts && git commit -m "feat: add Better Auth session guards"`

### Task 5: Build the note domain service and DTO validation

**Files:**
- Create: `src/entities/note/model/schema.ts`, `src/entities/note/model/types.ts`, `src/entities/note/api/note.server-service.ts`, `src/entities/note/api/index.ts`, `src/entities/note/index.ts`
- Test: `tests/unit/note-schema.test.ts`, `tests/unit/trash-expiration.test.ts`

**Interfaces:**
- Produces: `createNoteSchema`, `updateNoteSchema`, `noteQuerySchema`, `NoteNotFoundError`, `getActiveNotes`, `getTrashNotes`, `getNoteById`, `createNote`, `updateNote`, `moveToTrash`, `restoreNote`, `isTrashExpired`.

- [ ] **Step 1: Write failing validation and expiry tests.**

```ts
it.each(['', 'x'.repeat(121)])('rejects invalid title %s', (title) => {
  expect(() => createNoteSchema.parse({ title })).toThrow();
});
it('treats a record older than TTL as expired', () => {
  expect(isTrashExpired(new Date('2026-08-01T00:00:00Z'), 7, new Date('2026-08-09T00:00:00Z'))).toBe(true);
});
```

- [ ] **Step 2: Run focused tests.**

Run: `npm test -- tests/unit/note-schema.test.ts tests/unit/trash-expiration.test.ts`

Expected: FAIL because schemas and expiry helper are missing.

- [ ] **Step 3: Implement the service with ownership predicates.**

```ts
const ownedNote = and(eq(notes.id, noteId), eq(notes.userId, userId));
const [note] = await db.select().from(notes).where(ownedNote).limit(1);
if (note === undefined) throw new NoteNotFoundError();
```

For a blank search, load `safeRedis.get(getNotesCacheKey(userId))`, parse cache JSON defensively, query active records on miss, and cache the serialized result for 60 seconds. For nonblank search, use `ilike` directly without caching. Mutations update only the ownership predicate and invalidate the user's cache after the database change.

- [ ] **Step 4: Run domain checks.**

Run: `npm test -- tests/unit/note-schema.test.ts tests/unit/trash-expiration.test.ts; npm run typecheck`

Expected: PASS and exit 0.

- [ ] **Step 5: Commit.**

Run: `git add src/entities/note tests/unit/note-schema.test.ts tests/unit/trash-expiration.test.ts && git commit -m "feat: add note domain service"`

### Task 6: Expose protected notes and health HTTP APIs

**Files:**
- Create: `src/app/api/notes/route.ts`, `src/app/api/notes/[id]/route.ts`, `src/app/api/notes/[id]/restore/route.ts`, `src/app/api/health/route.ts`
- Test: `tests/integration/notes-api.test.ts`, `tests/integration/health-api.test.ts`

**Interfaces:**
- Consumes: Task 4 session guard and Task 5 note service.
- Produces: documented JSON API and 200/503 health response.

- [ ] **Step 1: Write failing API tests for identity and ownership.**

```ts
it('returns 404 when a different user requests a note id', async () => {
  const response = await requestAs(userB, `/api/notes/${userANoteId}`);
  expect(response.status).toBe(404);
});
```

- [ ] **Step 2: Run the integration test.**

Run: `npm test -- tests/integration/notes-api.test.ts`

Expected: FAIL because routes are missing.

- [ ] **Step 3: Implement route parsing and status mapping.**

```ts
const payload = createNoteSchema.strict().parse(await request.json());
const user = await requireAuthSession();
const note = await createNote(user.id, payload);
return Response.json(note, { status: 201 });
```

Validate path UUIDs and bodies before service calls. Convert `NoteNotFoundError` to 404 and Zod errors to 400. The health route runs `db.execute(sql\`SELECT 1\`)` and `redis.ping()` with `Promise.all`; return `{ status: 'ok', db: true, redis: true }` only if both work, otherwise 503.

- [ ] **Step 4: Run API tests and typecheck.**

Run: `npm test -- tests/integration/notes-api.test.ts tests/integration/health-api.test.ts; npm run typecheck`

Expected: PASS and exit 0.

- [ ] **Step 5: Commit.**

Run: `git add src/app/api tests/integration && git commit -m "feat: add protected notes APIs"`

### Task 7: Add client data layer and accessible mutation features

**Files:**
- Create: `src/shared/lib/query-client.tsx`, `src/shared/api/fetcher.ts`, `src/entities/note/api/note.client.ts`, `src/entities/note/api/note.queries.ts`, `src/features/{auth,create-note,edit-note,delete-note,restore-note}/index.ts`, and each feature UI file
- Test: `tests/unit/note-queries.test.tsx`, `tests/unit/create-note-form.test.tsx`

**Interfaces:**
- Produces: `QueryProvider`, `useNotesQuery`, `useTrashQuery`, note mutation hooks, and public feature components.

- [ ] **Step 1: Write failing client-query and form tests.**

```tsx
it('disables submit while create mutation is pending', () => {
  render(<CreateNoteForm />);
  expect(screen.getByRole('button', { name: /create/i })).toBeDisabled();
});
```

- [ ] **Step 2: Run focused UI tests.**

Run: `npm test -- tests/unit/note-queries.test.tsx tests/unit/create-note-form.test.tsx`

Expected: FAIL because the provider, hooks, and form are missing.

- [ ] **Step 3: Implement hooks, optimistic updates, and forms.**

```ts
useQuery({ queryKey: noteKeys.list(search), queryFn: () => notesClient.list(search) });
await queryClient.cancelQueries({ queryKey: noteKeys.all });
queryClient.invalidateQueries({ queryKey: noteKeys.all });
```

Use `react-hook-form` with `zodResolver`. Associate validation errors with inputs using `aria-invalid` and `aria-describedby`; render request errors; disable controls for pending mutations. Use exact `noteKeys` for snapshots and rollback, then invalidate `noteKeys.all` on settlement.

- [ ] **Step 4: Run client checks.**

Run: `npm test -- tests/unit/note-queries.test.tsx tests/unit/create-note-form.test.tsx; npm run typecheck`

Expected: PASS and exit 0.

- [ ] **Step 5: Commit.**

Run: `git add src/shared/api src/shared/lib/query-client.tsx src/entities/note/api src/features tests/unit && git commit -m "feat: add note client queries and forms"`

### Task 8: Compose FSD screens, widgets, and App Router facade

**Files:**
- Create: `src/shared/ui/*`, `src/widgets/{header,notes-list,trash-list}/*`, `src/pages-flat/{login-page,register-page,notes-page,note-edit-page,trash-page}/*`, and all listed `src/app/(auth)` and `src/app/(dashboard)` page/layout files
- Test: `tests/unit/pages.test.tsx`

**Interfaces:**
- Consumes: public APIs from Tasks 4, 5, and 7.
- Produces: `/login`, `/register`, `/notes`, `/notes/[id]`, `/notes/trash`.

- [ ] **Step 1: Write failing routing/screen tests.**

```tsx
it('renders the empty active-notes state with create form', () => {
  render(<NotesPage />);
  expect(screen.getByRole('heading', { name: /notes/i })).toBeInTheDocument();
});
```

- [ ] **Step 2: Run the screen test.**

Run: `npm test -- tests/unit/pages.test.tsx`

Expected: FAIL because public page components are missing.

- [ ] **Step 3: Implement page composition without reversing FSD dependencies.**

```tsx
export default function Page() {
  return <NotesPage />;
}
```

Build shared Button/Input/Card primitives, header, note/trash list widgets, login/register screens, a 300ms debounced search control, and detail editor. Dashboard layout invokes the page session redirect guard. Every slice publishes its supported imports from `index.ts`.

- [ ] **Step 4: Verify UI and production compilation.**

Run: `npm test -- tests/unit/pages.test.tsx; npm run typecheck; npm run build`

Expected: all exit 0.

- [ ] **Step 5: Commit.**

Run: `git add src/shared/ui src/widgets src/pages-flat src/app && git commit -m "feat: add notes application screens"`

### Task 9: Implement isolated BullMQ purge worker

**Files:**
- Create: `src/worker/redis.ts`, `src/worker/queues/trash.queue.ts`, `src/worker/queues/index.ts`, `src/worker/jobs/purge-trash.job.ts`, `src/worker/index.ts`, `tsup.config.ts`
- Test: `tests/unit/purge-trash.test.ts`

**Interfaces:**
- Produces: `purgeTrash(now?: Date): Promise<number>`, `startTrashPurgeWorker(): Promise<void>`, and a Node 22 ESM bundle at `dist/worker/index.js`.

- [ ] **Step 1: Write failing purge tests.**

```ts
it('invalidates each affected user once after deleting expired records', async () => {
  await purgeTrash(new Date('2026-08-25T00:00:00Z'));
  expect(invalidateUserNotesCache).toHaveBeenCalledTimes(2);
});
```

- [ ] **Step 2: Run the test.**

Run: `npm test -- tests/unit/purge-trash.test.ts`

Expected: FAIL because the purge job is missing.

- [ ] **Step 3: Implement queue, job, shutdown, and build configuration.**

```ts
const connection = new Redis(env.REDIS_URL, { maxRetriesPerRequest: null, enableReadyCheck: false });
const deleted = await db.execute<{ user_id: string }>(sql`DELETE FROM notes WHERE deleted_at IS NOT NULL AND deleted_at < NOW() - make_interval(days => ${env.TRASH_TTL_DAYS}) RETURNING user_id`);
for (const userId of new Set(deleted.rows.map((row) => row.user_id))) await invalidateUserNotesCache(userId);
```

Register the repeatable cron job exactly once. On SIGINT/SIGTERM pause the worker, close worker and queue, close its Redis client and then exit. Configure tsup as ESM, target Node 22, with `entry: ['src/worker/index.ts']`, `outDir: 'dist/worker'`, `bundle: true`, and source alias resolution.

- [ ] **Step 4: Run worker tests and build.**

Run: `npm test -- tests/unit/purge-trash.test.ts; npm run worker:build`

Expected: PASS and `dist/worker/index.js` exists.

- [ ] **Step 5: Commit.**

Run: `git add src/worker tsup.config.ts tests/unit/purge-trash.test.ts && git commit -m "feat: add scheduled trash purge worker"`

### Task 10: Containerize, migrate, and run end-to-end verification

**Files:**
- Create: `Dockerfile`, `docker-compose.yml`, `.dockerignore`, `README.md`
- Test: `tests/e2e/notes-flow.md`

**Interfaces:**
- Consumes: standalone web output, `dist/worker`, database migration command, and health API.
- Produces: `docker compose up --build` deployment with deterministic dependency ordering.

- [ ] **Step 1: Write the executable manual E2E checklist.**

```md
- [ ] Register User A, create a note, and observe it in /notes.
- [ ] Request active notes twice and confirm the second request is a cache hit.
- [ ] Stop Redis and confirm /notes still reads from Postgres without HTTP 500.
- [ ] As User B, request User A's note endpoint and confirm HTTP 404.
- [ ] Soft-delete and restore a note; verify each list changes.
- [ ] Run purge with an expired note; verify only expired trash is deleted.
- [ ] Confirm /api/health is 200 only while Postgres and Redis are healthy.
```

- [ ] **Step 2: Run the checklist document validation.**

Run: `rg -n "Register User A|HTTP 404|/api/health" tests/e2e/notes-flow.md`

Expected: all three checklist controls are found.

- [ ] **Step 3: Implement Docker stages and Compose dependencies.**

```dockerfile
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public
COPY --from=builder /app/dist/worker ./dist/worker
USER nextjs
```

Configure Postgres `pg_isready`, Redis `redis-cli ping`, a one-shot migrate service, and web/worker dependencies on migration success. Set web healthcheck to `GET /api/health`; run worker with `node dist/worker/index.js`; expose only web's port.

- [ ] **Step 4: Run full verification.**

Run: `npm test; npm run typecheck; npm run build; docker compose config; docker compose up --build --wait`

Expected: tests/typecheck/build/config exit 0; services become healthy and migrate exits 0.

- [ ] **Step 5: Execute the E2E checklist and commit.**

Run: `git add Dockerfile docker-compose.yml .dockerignore README.md tests/e2e/notes-flow.md && git commit -m "feat: containerize notes application"`

Record each completed check in `tests/e2e/notes-flow.md` and include the commands/results in the commit message body if any environment-specific exception is encountered.

## Plan self-review

- Spec coverage: Tasks 1–2 cover strict TypeScript, environment, migrations and indexed schema; 3 covers graceful cache degradation and key format; 4 covers Better Auth/session sourcing; 5–6 cover DTO validation, ownership, API and health; 7–8 cover Query state, forms and FSD UI; 9 covers the separately configured, graceful BullMQ worker; 10 covers standalone packaging, Compose ordering and E2E validation.
- Placeholder scan: no `TODO`, `TBD`, deferred implementation marker, or unspecified error-handling requirement is present.
- Type consistency: all note services use `userId: string`, `noteId: string`, Better Auth IDs are text, and cache/query factories use the same `noteKeys`/`getNotesCacheKey` names throughout.
