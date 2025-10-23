import type { RouterClient } from '@orpc/server';
import { publicProcedure } from '@/lib/orpc';
import { adminRouter } from './adminRouter';
import { questionsRouter } from './questionRouter';
import { shareRouter } from './shareRouter';
import { sourcesRouter } from './sourcesRouter';
import { userRouter } from './userRouter';
import { verificationRouter } from './verificationRouter';

export const appRouter = {
  healthCheck: publicProcedure.handler(() => 'OK'),
  ...questionsRouter,
  ...sourcesRouter,
  ...shareRouter,
  ...verificationRouter,
  ...userRouter,
  ...adminRouter,
};

export type AppRouter = typeof appRouter;

export type AppRouterClient = RouterClient<AppRouter>;
