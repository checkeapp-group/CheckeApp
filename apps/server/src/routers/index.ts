import type { RouterClient } from '@orpc/server';
import { z } from 'zod';
import { checkVerificationPermissions } from '@/db/services/verifications/verificationsPermissionsService';
import { questionsRouter } from '@/routers/questionRouter';
import { protectedProcedure, publicProcedure } from '../lib/orpc';

export const appRouter = {
  healthCheck: publicProcedure.handler(() => {
    return 'OK';
  }),

  privateData: protectedProcedure.handler(({ context }) => {
    return {
      message: 'This is private',
      user: context.session?.user,
    };
  }),

  checkVerificationPermissions: protectedProcedure
    .input(
      z.object({
        verificationId: z.string().min(1),
      })
    )
    .handler(async ({ input, context }) => {
      const userId = context.session.user.id;
      return await checkVerificationPermissions(input.verificationId, userId);
    }),

  ...questionsRouter,
};

export type AppRouter = typeof appRouter;
export type AppRouterClient = RouterClient<typeof appRouter>;
