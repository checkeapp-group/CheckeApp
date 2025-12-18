import { toNextJsHandler } from 'better-auth/next-js';
import { auth } from '../../../../lib/auth';

// Better Auth handler for all authentication routes (Google)
export const { GET, POST } = toNextJsHandler(auth.handler);
