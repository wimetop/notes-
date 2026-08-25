import { toNextJsHandler } from 'better-auth/next-js';

import { auth } from '@/shared/lib';

export const { GET, POST } = toNextJsHandler(auth);
