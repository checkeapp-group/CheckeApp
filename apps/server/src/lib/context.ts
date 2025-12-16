import type { NextRequest } from 'next/server';
import { auth } from './auth';

// Creates request context with session data for oRPC procedures
export async function createContext(req: NextRequest) {
  const session = await auth.api.getSession({
    headers: req.headers,
  });
  return {
    session,
  };
}

export type Context = Awaited<ReturnType<typeof createContext>>;
