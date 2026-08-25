# Нотатки+ UX Contract

Visual rules live in `DESIGN.md`. This file owns cross-screen behavior.

| Capability | Canonical owner | Contract |
|---|---|---|
| Form | `features/*` with React Hook Form and Zod | noValidate, inline validation, busy prevention, preserve values on failure |
| Search | `notes-page` search control | 300ms debounce, immediate clear, IME-safe query updates |
| CRUD | `entities/note` mutations | create and edit invalidate `noteKeys.all`; mutations retain list context |
| Delete | `delete-note` feature | soft delete only; confirm before action; success removes from active list |
| Restore | `restore-note` feature | restore returns note to active list and invalidates all note queries |
| Scrollbar | `src/app/globals.css` | visible global scrollbar with stable gutter |
| Feedback | shared live status region | success acknowledgement plus inline actionable request errors |

## Outcomes

- Create keeps the user on `/notes` and inserts the note into the active list.
- Edit stays on the note detail page after success.
- Soft delete moves the note to `/notes/trash`; hard delete is not exposed in the application UI.
- Restore keeps the user in trash and confirms the note is again active.
- Missing/foreign notes show the same not-found outcome.
