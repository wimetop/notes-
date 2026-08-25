# Нотатки+ UI Refresh Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Create a distinctive, accessible Ukrainian interface with linked sign-in/sign-up screens and a session-derived user profile in the notes workspace.

**Architecture:** Preserve the Better Auth, note API, and mutation boundaries. Extend the server session contract with the display name, pass it from the dashboard layout into the shared header, and apply one documented CSS-token system to auth, workspace, note, trash, and editor surfaces.

**Tech Stack:** Next.js 16, React 19, TypeScript, Better Auth, React Hook Form, TanStack Query, Vitest, CSS custom properties.

**Spec:** `docs/superpowers/specs/2026-08-25-notes-plus-ui-refresh-design.md`

## Global Constraints

- Do not change database schema, API contracts, Redis/BullMQ behavior, or note lifecycle.
- Derive profile name and email only from the validated server Better Auth session.
- Keep the existing React Hook Form/Zod form owner and TanStack Query mutation owner.
- Use Ukrainian copy exactly as specified in the implementation tasks.
- Keep controls semantic, keyboard-accessible, visible-focusable, WCAG 2.2 AA, and responsive without horizontal scroll.
- `src/app/globals.css` remains the only runtime owner of visual CSS tokens; reconcile `DESIGN.md` in the same change.

---

### Task 1: Expose the session display name to layout consumers

**Files:**
- Modify: `src/shared/lib/auth-session.ts`, `src/shared/lib/require-auth-session.ts`, `src/app/(dashboard)/layout.tsx`, `src/widgets/header/header.tsx`
- Test: `tests/unit/require-auth-session.test.ts`, `tests/unit/header.test.tsx`

**Interfaces:**
- Produces: `AuthenticatedUser = Readonly<{ id: string; name: string; email: string }>`.
- Produces: `Header({ user }: Readonly<{ user: AuthenticatedUser }>)`.
- Consumes: Better Auth `session.user.name`, not client storage or a request body.

- [ ] **Step 1: Write failing session and header tests.**

```tsx
it('returns the authenticated display name from a valid session', async () => {
  const requireSession = createRequireAuthSession(async () => ({
    user: { id: 'user-1', name: 'Ірина Коваль', email: 'iryna@example.com' }
  }));
  await expect(requireSession()).resolves.toEqual({
    id: 'user-1', name: 'Ірина Коваль', email: 'iryna@example.com'
  });
});

it('shows the signed-in name and email in the workspace header', () => {
  render(<Header user={{ id: 'user-1', name: 'Ірина Коваль', email: 'iryna@example.com' }} />);
  expect(screen.getByText('Ірина Коваль')).toBeInTheDocument();
  expect(screen.getByText('iryna@example.com')).toBeInTheDocument();
});
```

- [ ] **Step 2: Run the focused tests to verify the contract fails.**

Run: `npm run test:unit -- tests/unit/require-auth-session.test.ts tests/unit/header.test.tsx`

Expected: FAIL because `AuthenticatedUser` has no `name` and `Header` accepts no `user` prop.

- [ ] **Step 3: Implement the minimal session-to-header data flow.**

```tsx
export type AuthenticatedUser = Readonly<{ id: string; name: string; email: string }>;

return { user: { id: session.user.id, name: session.user.name, email: session.user.email } };

export default async function DashboardLayout({ children }: Readonly<{ children: ReactNode }>) {
  const user = await requirePageSession();
  return <QueryProvider><Header user={user} />{children}</QueryProvider>;
}
```

Render a profile block in `Header`: first initial in an `aria-hidden` avatar, `user.name` and `user.email` as text, plus the existing semantic navigation links.

- [ ] **Step 4: Run focused tests and typecheck.**

Run: `npm run test:unit -- tests/unit/require-auth-session.test.ts tests/unit/header.test.tsx; npm run typecheck`

Expected: both commands exit 0.

- [ ] **Step 5: Commit the independently working identity context.**

```bash
git add src/shared/lib/auth-session.ts src/shared/lib/require-auth-session.ts 'src/app/(dashboard)/layout.tsx' src/widgets/header/header.tsx tests/unit/require-auth-session.test.ts tests/unit/header.test.tsx
git commit -m "feat: show authenticated user in workspace header"
```

### Task 2: Build explicit, accessible navigation between auth modes

**Files:**
- Modify: `src/features/auth/auth-form.tsx`, `src/pages-flat/login-page/index.tsx`, `src/pages-flat/register-page/index.tsx`
- Test: `tests/unit/auth-form.test.tsx`

**Interfaces:**
- Produces: `AuthForm({ mode })` with mode-specific title, action, auth request, and a real `next/link` to the alternate route.
- Preserves: `authClient.signIn.email` and `authClient.signUp.email` request behavior.

- [ ] **Step 1: Write failing navigation tests.**

```tsx
it('links a new visitor from login to registration', () => {
  render(<AuthForm mode="login" />);
  expect(screen.getByRole('link', { name: 'Створити акаунт' })).toHaveAttribute('href', '/register');
});

it('links a returning visitor from registration to login', () => {
  render(<AuthForm mode="register" />);
  expect(screen.getByRole('link', { name: 'Увійти' })).toHaveAttribute('href', '/login');
});
```

- [ ] **Step 2: Run the focused test to verify it fails.**

Run: `npm run test:unit -- tests/unit/auth-form.test.tsx`

Expected: FAIL because neither auth mode contains the required link.

- [ ] **Step 3: Add the auth-shell content without changing auth logic.**

```tsx
<p className="auth-switch">
  {register ? 'Вже є акаунт? ' : 'Вперше тут? '}
  <Link href={register ? '/login' : '/register'}>
    {register ? 'Увійти' : 'Створити акаунт'}
  </Link>
</p>
```

Add a semantic `auth-page` wrapper in both route-level page components and a compact Ukrainian side-panel message that is hidden below the mobile breakpoint. Keep `noValidate`, labels, autocomplete, request errors, and busy disabling intact.

- [ ] **Step 4: Run focused tests and typecheck.**

Run: `npm run test:unit -- tests/unit/auth-form.test.tsx; npm run typecheck`

Expected: both commands exit 0.

- [ ] **Step 5: Commit the auth navigation flow.**

```bash
git add src/features/auth/auth-form.tsx src/pages-flat/login-page/index.tsx src/pages-flat/register-page/index.tsx tests/unit/auth-form.test.tsx
git commit -m "feat: connect sign-in and registration flows"
```

### Task 3: Apply the Night Notebook token system and responsive layout

**Files:**
- Modify: `DESIGN.md`, `src/app/globals.css`, `src/pages-flat/notes-page/notes-page.tsx`, `src/pages-flat/trash-page/trash-page.tsx`, `src/pages-flat/note-edit-page/note-edit-page.tsx`, `src/entities/note/ui/note-card.tsx`, `src/widgets/notes-list/notes-list.tsx`
- Test: `tests/unit/notes-page.test.tsx`, `tests/unit/note-card.test.tsx`

**Interfaces:**
- Produces: CSS classes `auth-page`, `workspace-heading`, `notes-toolbar`, `notes-layout`, `note-card`, and `empty-state`.
- Preserves: `NotesPage`, `TrashPage`, `NoteEditPage`, `NoteCard`, query hooks, and mutation props.

- [ ] **Step 1: Write failing structure tests for new user-facing affordances.**

```tsx
it('provides an accessible clear control when search has text', async () => {
  render(<NotesPage />);
  await user.type(screen.getByLabelText('Пошук'), 'план');
  expect(screen.getByRole('button', { name: 'Очистити пошук' })).toBeInTheDocument();
});

it('marks a note card with the shared visual class', () => {
  render(<NoteCard note={{
    id: '00000000-0000-4000-8000-000000000001', userId: 'user-1', title: 'План', body: null,
    deletedAt: null, createdAt: new Date(), updatedAt: new Date()
  }} />);
  expect(screen.getByRole('article')).toHaveClass('note-card');
});
```

- [ ] **Step 2: Run the focused tests to verify they fail.**

Run: `npm run test:unit -- tests/unit/notes-page.test.tsx tests/unit/note-card.test.tsx`

Expected: FAIL because the clear button and `note-card` class do not exist.

- [ ] **Step 3: Implement the visual system and layout changes.**

```css
:root {
  --canvas: #16161d;
  --surface: #22232d;
  --paper: #f4f1ea;
  --ink: #23232b;
  --muted: #686875;
  --brand: #7467e8;
  --focus: #aaa1ff;
  --danger: #c5504c;
}
```

Replace global element styling with scoped classes based on these variables. Use a two-column `.notes-layout` above 900px and one column below it. Add a native clear button that resets local search state immediately and returns focus to `#notes-search`. Give empty, loading, and error output stable card geometry. Use `article.note-card`, not a clickable div. Update `DESIGN.md` tokens and prose to match the exact CSS values and the Night Notebook rationale.

- [ ] **Step 4: Run unit tests, typecheck, build, and DESIGN.md lint.**

Run: `npm run test:unit; npm run typecheck; npm run build; npx -p @google/design.md designmd lint DESIGN.md`

Expected: every command exits 0.

- [ ] **Step 5: Commit the reconciled UI system.**

```bash
git add DESIGN.md src/app/globals.css src/pages-flat/notes-page/notes-page.tsx src/pages-flat/trash-page/trash-page.tsx src/pages-flat/note-edit-page/note-edit-page.tsx src/entities/note/ui/note-card.tsx src/widgets/notes-list/notes-list.tsx tests/unit/notes-page.test.tsx tests/unit/note-card.test.tsx
git commit -m "feat: refresh notes workspace visual system"
```

### Task 4: Validate the complete interface against the running Docker stack

**Files:**
- Modify: `UX-CONTRACT.md`
- Test: `tests/e2e/ui-refresh-checklist.md`

**Interfaces:**
- Produces: executable manual acceptance evidence for desktop and narrow-mobile auth/workspace paths.
- Preserves: all existing API, cache, authorization, and note lifecycle tests.

- [ ] **Step 1: Write the UI acceptance checklist.**

```md
- [ ] `/login` shows the link “Створити акаунт” to `/register`.
- [ ] `/register` shows the link “Увійти” to `/login`.
- [ ] An authenticated `/notes` header shows the current session name and email.
- [ ] Search can be cleared by keyboard and pointer without a page refresh.
- [ ] At 375px and 1440px widths, no control is clipped and focus remains visible.
```

- [ ] **Step 2: Run the checklist-document control.**

Run: `rg -n "Створити акаунт|current session name|375px" tests/e2e/ui-refresh-checklist.md`

Expected: all three controls are found.

- [ ] **Step 3: Record the durable UX behavior.**

Add `Header` as the canonical owner of authenticated identity display, and add the auth cross-link behavior to `UX-CONTRACT.md`. Preserve the existing CRUD, soft-delete, and feedback contracts unchanged.

- [ ] **Step 4: Run static and browser verification.**

Run: `npm test; npm run typecheck; npm run build; python 'C:/Users/Danylo/.codex/plugins/cache/openai-curated-remote/frontend-design-premium/1.4.0/skills/frontend-design-premium/scripts/audit_project.py' . --mode strict`

Then use the already-running Docker app to execute every checklist item at 375px and 1440px, including keyboard Tab navigation through both auth forms and the notes search clear control.

Expected: commands exit 0 and all checklist boxes are marked with observed results.

- [ ] **Step 5: Commit the verification evidence.**

```bash
git add UX-CONTRACT.md tests/e2e/ui-refresh-checklist.md premium-audit.json
git commit -m "test: verify notes interface refresh"
```

## Plan self-review

- **Spec coverage:** Task 1 covers session-derived profile data; Task 2 covers login/register discovery; Task 3 covers the token system, responsive workspace, cards, and search-clear behavior; Task 4 covers acceptance evidence on the Docker stack.
- **Completeness scan:** the plan contains concrete tests, commands, implementation snippets, and file paths for every task.
- **Type consistency:** the `AuthenticatedUser.name` field is introduced before `Header` consumes it; no client-side session source is introduced.
