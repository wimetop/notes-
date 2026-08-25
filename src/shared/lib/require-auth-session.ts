import { headers } from 'next/headers';
import { redirect } from 'next/navigation';

import { auth } from './auth';
import { createRequireAuthSession, type AuthenticatedUser } from './auth-session';

const getServerSession = async () => {
  const session = await auth.api.getSession({ headers: await headers() });
  if (session === null) return null;
  return { user: { id: session.user.id, name: session.user.name, email: session.user.email } };
};

export const requireAuthSession = createRequireAuthSession(getServerSession);

export async function requirePageSession(): Promise<AuthenticatedUser> {
  try {
    return await requireAuthSession();
  } catch (error) {
    if (error instanceof Response && error.status === 401) redirect('/login');
    throw error;
  }
}
