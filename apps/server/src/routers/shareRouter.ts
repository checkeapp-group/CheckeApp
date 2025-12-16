import { ORPCError } from '@orpc/server';
import { eq } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';
import { z } from 'zod';
import { db } from '../db';
import { source, verification } from '../db/schema/schema';
import { publicProcedure } from '../lib/orpc';

// Router handling shareable link creation and public result access
export const shareRouter = {
  // This is a PUBLIC procedure because anyone can create a share link
  createShareLink: publicProcedure
    .input(z.object({ verificationId: z.string().uuid() }))
    .handler(async ({ input }) => {
      const { verificationId } = input;

      const existingVerification = await db.query.verification.findFirst({
        where: eq(verification.id, verificationId),
        columns: {
          shareToken: true,
          status: true,
        },
      });

      if (!existingVerification) {
        throw new ORPCError('NOT_FOUND');
      }


      // If a token already exists, return it immediately
      if (existingVerification.shareToken) {
        return { shareToken: existingVerification.shareToken };
      }

      // Otherwise, create a new one
      const newShareToken = uuidv4();
      await db
        .update(verification)
        .set({ shareToken: newShareToken })
        .where(eq(verification.id, verificationId));

      return { shareToken: newShareToken };
    }),

  // This is a public procedure, accessible without logging in
  getSharedResult: publicProcedure
    .input(z.object({ shareToken: z.string().uuid() }))
    .handler(async ({ input }) => {
      const { shareToken } = input;

      const result = await db.query.verification.findFirst({
        where: eq(verification.shareToken, shareToken),
        with: {
          // We only expose the user's name, not the full user object
          user: {
            columns: {
              name: true,
              image: true,
            },
          },
          source: {
            where: eq(source.isSelected, true),
          },
          finalResult: true,
        },
      });

      if (!(result && result.finalResult)) {
        throw new ORPCError('NOT_FOUND', {
          message: 'Share link is invalid or the verification is not complete.',
        });
      }

      // Explicitly remove sensitive data before sending to the client
      const { userId, ...safeResult } = result;

      return safeResult;
    }),
};
