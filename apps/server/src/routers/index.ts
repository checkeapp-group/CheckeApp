import type { RouterClient } from '@orpc/server';
import { publicProcedure } from '@/lib/orpc';
import { questionsRouter } from './questionRouter';
import { shareRouter } from './shareRouter';
import { sourcesRouter } from './sourcesRouter';

export const appRouter = {
  healthCheck: publicProcedure.handler(() => 'OK'),
  ...questionsRouter,
  ...sourcesRouter,
  ...shareRouter,
};

export type AppRouter = typeof appRouter;

export type AppRouterClient = RouterClient<AppRouter>;
