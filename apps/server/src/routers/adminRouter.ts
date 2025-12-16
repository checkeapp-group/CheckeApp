import { ORPCError } from '@orpc/server';
import { eq, not } from 'drizzle-orm';
import { z } from 'zod';
import { db } from './../db';
import { user } from '../db/schema/auth';
import { protectedProcedure } from './../lib/orpc';
import { exportFinalResultsToCSV } from '@/db/services/finalResult/finalsResultService';

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

// Router handling admin-only operations: user management and data exports
export const adminRouter = {
    // Retrieves all users with verification counts for admin dashboard
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

    // Updates user verification or admin status
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

  verifyAllUsers: adminProcedure.input(z.void()).handler(async ({ context }) => {
    const currentUserId = context.session.user.id;

    await db
      .update(user)
      .set({ isVerified: true })
      .where(not(eq(user.id, currentUserId)));

    return { success: true, message: 'All users have been verified.' };
  }),

_exportFinalResultsToCSV: adminProcedure.input(z.void()).handler(async () => {
    try {
      const data = await exportFinalResultsToCSV();
      return data;
    } catch (error) {
      console.error('Error in _exportFinalResultsToCSV procedure:', error);
      throw new ORPCError('INTERNAL_SERVER_ERROR', {
        message: 'Failed to export data.',
      });
    }
  })
};
