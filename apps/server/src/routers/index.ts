import type { RouterClient } from '@orpc/server';
import { publicProcedure } from '@/lib/orpc';
import { questionsRouter } from './questionRouter';
import { sourcesRouter } from './sourcesRouter';

export const appRouter = {
  healthCheck: publicProcedure.handler(() => 'OK'),
  ...questionsRouter,
  ...sourcesRouter,
};

export type AppRouter = typeof appRouter;

export type AppRouterClient = RouterClient<AppRouter>;
