export class NoteNotFoundError extends Error {
  public constructor() {
    super('Note not found');
    this.name = 'NoteNotFoundError';
  }
}
