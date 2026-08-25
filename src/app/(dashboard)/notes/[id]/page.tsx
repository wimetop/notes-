import { NoteEditPage } from '@/pages-flat/note-edit-page';
export default async function Page({ params }: Readonly<{ params: Promise<{ id: string }> }>) { return <NoteEditPage id={(await params).id} />; }
