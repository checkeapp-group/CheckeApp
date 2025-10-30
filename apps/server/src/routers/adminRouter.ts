import { ORPCError } from '@orpc/server';
import { eq, not } from 'drizzle-orm';
import { z } from 'zod';
import { db } from './../db';
import { user } from '../db/schema/auth';
import { protectedProcedure } from './../lib/orpc';

const adminProcedure = protectedProcedure.use(async ({ context, next }) => {
  const currentUser = await db.query.user.findFirst({
    where: eq(user.id, context.session.user.id),
    columns: { isAdmin: true },
  });

  if (!currentUser?.isAdmin) {
    throw new ORPCError('FORBIDDEN', { message: 'Administrator access required.' });
  }

  return next({ context });
});

export const adminRouter = {
  getAllUsers: adminProcedure.input(z.void()).handler(async ({ context }) => {
    const currentUserId = context.session.user.id;
    return db.query.user.findMany({
      where: not(eq(user.id, currentUserId)),
      columns: {
        id: true,
        name: true,
        email: true,
        isVerified: true,
        isAdmin: true,
        createdAt: true,
      },
      orderBy: (users, { desc }) => [desc(users.createdAt)],
    });
  }),

  updateUserStatus: adminProcedure
    .input(
      z.object({
        userId: z.string(),
        isVerified: z.boolean().optional(),
        isAdmin: z.boolean().optional(),
      })
    )
    .handler(async ({ input, context }) => {
      const { userId, ...updates } = input;
      const currentUserId = context.session.user.id;

      if (userId === currentUserId) {
        throw new ORPCError('FORBIDDEN', {
          message: 'Administrators cannot change their own status.',
        });
      }

      if (Object.keys(updates).length === 0) {
        throw new ORPCError('BAD_REQUEST', { message: 'No update values provided.' });
      }

      await db.update(user).set(updates).where(eq(user.id, userId));

      return { success: true, message: 'User status updated.' };
    }),
};
