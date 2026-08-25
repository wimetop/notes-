export type AuthenticatedUser = Readonly<{ id: string; email: string }>;
type SessionResult = { user: AuthenticatedUser } | null;
type GetSession = () => Promise<SessionResult>;

export function createRequireAuthSession(getSession: GetSession): () => Promise<AuthenticatedUser> {
  return async () => {
    const session = await getSession();
    if (session === null) throw new Response('Unauthorized', { status: 401 });
    return { id: session.user.id, email: session.user.email };
  };
}
