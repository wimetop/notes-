import Link from 'next/link';
import React from 'react';
import type { ClientNote } from '../api/note.client';

export function NoteCard({ note }: Readonly<{ note: ClientNote }>) {
  return <article><h2><Link href={`/notes/${note.id}`}>{note.title}</Link></h2>{note.body && <p>{note.body}</p>}</article>;
}
