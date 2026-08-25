# Notes+ Release Hardening Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Close all release-review gaps in deployment safety, worker startup, FSD, accessible forms, search, and query state.

**Architecture:** Keep ownership enforcement and server APIs intact. Add small focused client hooks and worker lifecycle helpers, compose the dashboard through `pages-flat`, and make Compose environment contracts explicit.

**Tech Stack:** Next.js 16, React 19, TypeScript, Vitest, TanStack Query, react-hook-form, BullMQ, Docker Compose.

**Spec:** `docs/superpowers/specs/2026-08-25-release-hardening-design.md`

## Global Constraints

- Preserve server-derived Better Auth user identity and 404-on-ownership-miss behavior.
- Use a 300 ms IME-safe debounce with immediate clear.
- Preserve cache invalidation for every note mutation.
- Do not embed deployment secrets in versioned Compose configuration.

---

### Task 1: Deployment and worker lifecycle

**Files:**
- Modify: `docker-compose.yml`, `src/worker/index.ts`
- Test: `tests/unit/worker-bootstrap.test.ts`, `tests/unit/docker-compose.test.ts`

- [ ] Write failing tests for failed schedule cleanup and required Redis migration dependency.
- [ ] Run the targeted tests and observe failures.
- [ ] Extract a testable worker bootstrap that schedules before steady state and cleans up on error; require Compose secrets and both service health checks.
- [ ] Re-run targeted tests.

### Task 2: Dashboard boundary and resilient forms

**Files:**
- Create: `src/pages-flat/dashboard-layout/index.tsx`
- Modify: `src/app/(dashboard)/layout.tsx`, `src/features/auth/auth-form.tsx`, `src/features/create-note/create-note-form.tsx`
- Test: `tests/unit/auth-form.test.tsx`, `tests/unit/create-note-form.test.tsx`

- [ ] Write failing accessibility and error-recovery tests.
- [ ] Run targeted tests and observe failures.
- [ ] Move dashboard composition to `pages-flat`; add accessible error associations and network recovery.
- [ ] Re-run targeted tests.

### Task 3: Debounced search and optimistic notes

**Files:**
- Create: `src/shared/lib/use-debounced-value.ts`
- Modify: `src/pages-flat/notes-page/notes-page.tsx`, `src/entities/note/api/note.queries.ts`
- Test: `tests/unit/notes-page.test.tsx`, `tests/unit/note-queries.test.ts`

- [ ] Write failing tests for the 300 ms committed search and optimistic rollback.
- [ ] Run targeted tests and observe failures.
- [ ] Implement the hook and mutation lifecycle handlers.
- [ ] Re-run targeted tests and the complete suite.
