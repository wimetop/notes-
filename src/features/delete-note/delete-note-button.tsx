'use client';

import React, { useState } from 'react';
import { useMoveToTrash } from '@/entities/note/client';

export function DeleteNoteButton({ noteId }: Readonly<{ noteId: string }>) {
  const [confirming, setConfirming] = useState(false);
  const { mutateAsync, isPending } = useMoveToTrash();
  return <><button type="button" onClick={() => setConfirming(true)} disabled={isPending}>Перемістити в кошик</button>
    {confirming && <div role="alertdialog" aria-modal="true" aria-labelledby="trash-title"><h2 id="trash-title">Перемістити нотатку в кошик?</h2><p>Нотатку можна буде відновити з кошика.</p><button type="button" onClick={() => setConfirming(false)} disabled={isPending}>Скасувати</button><button type="button" onClick={async () => { await mutateAsync(noteId); setConfirming(false); }} disabled={isPending}>{isPending ? 'Переміщення…' : 'Перемістити'}</button></div>}
  </>;
}
