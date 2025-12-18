import { ORPCError, os } from '@orpc/server';
import type { Context } from './context';

export const o = os.$context<Context>();

// oRPC procedure builder for public endpoints without authentication
export const publicProcedure = o;

const requireAuth = o.middleware(async ({ context, next }) => {
  if (!context.session?.user) {
    throw new ORPCError('UNAUTHORIZED');
  }
  return next({
    context: {
      session: context.session,
    },
  });
});

// oRPC procedure builder for authenticated endpoints with session validation
export const protectedProcedure = publicProcedure.use(requireAuth);
