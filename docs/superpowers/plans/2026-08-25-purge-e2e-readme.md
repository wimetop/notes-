# Purge E2E and README Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Verify that the worker permanently removes expired trash notes and document every supported local workflow.

**Architecture:** The E2E test creates a user and a soft-deleted note through the public API, ages only that note through the dedicated test database connection, invokes the real purge job, and verifies the API returns 404. README documents Docker, environment variables, health semantics and test commands.

**Tech Stack:** Next.js 16, Vitest, Drizzle/PostgreSQL, Redis, BullMQ, Docker Compose.

**Spec:** `docs/superpowers/specs/2026-08-25-notes-plus-design.md`

## Global Constraints

- `notes.user_id` is text and comes only from the Better Auth session.
- Expired notes satisfy `deleted_at < NOW() - INTERVAL 'TRASH_TTL_DAYS days'`.
- Redis faults may not break notes routes; `/api/health` intentionally becomes `503`.
- E2E tests use the Docker stack at `E2E_BASE_URL` or `http://localhost:3000`.

---

### Task 1: Permanent purge E2E

**Files:**
- Modify: `tests/e2e/idor-security.test.ts`

**Interfaces:**
- Consumes: `purgeTrash(): Promise<number>` from `src/worker/jobs/purge-trash.job.ts`.
- Produces: an E2E assertion that an expired note is deleted and no longer readable.

- [ ] **Step 1: Write the failing test**

```ts
expect(await purgeTrash()).toBe(1);
expect(response.status).toBe(404);
```

- [ ] **Step 2: Run the E2E test and verify it fails before the purge call exists.**

Run: `npm run test:e2e`

- [ ] **Step 3: Add the smallest test-only database aging helper and invoke the existing purge job.**

```ts
await db.execute(sql`UPDATE notes SET deleted_at = NOW() - INTERVAL '31 days' WHERE id = ${note.id}`);
expect(await purgeTrash()).toBe(1);
```

- [ ] **Step 4: Run E2E and type checks.**

Run: `npm run test:e2e; npm run typecheck`

- [ ] **Step 5: Commit.**

### Task 2: Operational README

**Files:**
- Modify: `README.md`

**Interfaces:**
- Consumes: Docker Compose services and `package.json` scripts.
- Produces: copy-paste run, test, troubleshooting and architecture documentation.

- [ ] **Step 1: Document the system and prerequisites.**
- [ ] **Step 2: Document environment values, Docker startup and browser URL.**
- [ ] **Step 3: Document unit, integration and Docker-backed E2E commands.**
- [ ] **Step 4: Document Redis fallback and healthcheck semantics.**
- [ ] **Step 5: Commit.**
