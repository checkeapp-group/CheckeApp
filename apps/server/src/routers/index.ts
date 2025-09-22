import type { RouterClient } from '@orpc/server';
import { questionsRouter } from '@/routers/questionRouter';
import { sourcesRouter } from '@/routers/sourcesRouter';
import { publicProcedure } from '../lib/orpc';

export const appRouter = {
  healthCheck: publicProcedure.handler(() => 'OK'),
  ...questionsRouter,
  ...sourcesRouter,
};

export type AppRouter = typeof appRouter;
export type AppRouterClient = RouterClient<typeof appRouter>;
