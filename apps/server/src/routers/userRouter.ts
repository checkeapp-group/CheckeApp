import { ORPCError } from '@orpc/server';
import { eq } from 'drizzle-orm';
import { z } from 'zod';
import { db } from '@/db';
import { user } from '@/db/schema/auth';
import { protectedProcedure } from '@/lib/orpc';

export const userRouter = {
  // Procedure to get the current authenticated user's details
  getCurrentUser: protectedProcedure
    .input(z.object({ verificationId: z.string().uuid() }))
    .handler(async ({ context }) => {
      const userId = context.session.user.id;

      const currentUser = await db.query.user.findFirst({
        where: eq(user.id, userId),
        columns: {
          id: true,
          name: true,
          email: true,
          isVerified: true,
        },
      });
      if (!currentUser) {
        throw new ORPCError('NOT_FOUND', { message: 'User not found.' });
      }

      return currentUser;
    }),

  // Procedure to get the current authenticated user's verification status
  getVerificationStatus: protectedProcedure.input(z.void()).handler(async ({ context }) => {
    const userId = context.session.user.id;

    const currentUser = await db.query.user.findFirst({
      where: eq(user.id, userId),
      columns: {
        isVerified: true,
      },
    });

    if (!currentUser) {
      throw new ORPCError('NOT_FOUND', { message: 'User not found.' });
    }

    return { isVerified: currentUser.isVerified };
  }),

  acceptTerms: protectedProcedure.input(z.void()).handler(async ({ context }) => {
    const userId = context.session.user.id;
    try {
      await db.update(user).set({ termsAccepted: true }).where(eq(user.id, userId));
      return { success: true };
    } catch (error) {
      console.error(`[acceptTerms] Failed for user ${userId}:`, error);
      throw new ORPCError('INTERNAL_SERVER_ERROR', {
        message: 'Could not accept terms. Please try again.',
      });
    }
  }),
};
