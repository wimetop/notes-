export function removeNoteFromActiveList<T extends { id: string }>(notes: T[] | undefined, noteId: string): T[] | undefined {
  return notes?.filter((note) => note.id !== noteId);
}
