'use client';

import React from 'react';
import { useRestoreNote } from '@/entities/note/client';

export function RestoreNoteButton({ noteId }: Readonly<{ noteId: string }>) {
  const { mutateAsync, isPending } = useRestoreNote();
  return <button type="button" onClick={() => void mutateAsync(noteId)} disabled={isPending}>{isPending ? 'Відновлення…' : 'Відновити нотатку'}</button>;
}
