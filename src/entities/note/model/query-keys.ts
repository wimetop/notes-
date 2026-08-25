export const noteKeys = {
  all: ['notes'] as const,
  lists: () => [...noteKeys.all, 'list'] as const,
  list: (search?: string) => [...noteKeys.lists(), { search: search ?? '' }] as const,
  trash: () => [...noteKeys.all, 'trash'] as const,
  detail: (id: string) => [...noteKeys.all, 'detail', id] as const
};
