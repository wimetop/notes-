import React from 'react';
import { TrashList } from '@/widgets/trash-list';
export function TrashPage() { return <main><div className="workspace-heading"><span>Особистий архів</span><h1>Кошик</h1><p>Тут можна повернути нотатки, які ще не час відпускати.</p></div><TrashList /></main>; }
