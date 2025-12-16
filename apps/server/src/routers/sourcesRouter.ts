import { ORPCError } from '@orpc/server';
import { eq } from 'drizzle-orm';
import { z } from 'zod';
import { db } from '../db';
import { source, verification } from '../db/schema/schema';
import { generateAndSaveFinalAnalysis } from '../db/services/finalResult/finalsResultService';
import { extractArticleData } from '../db/services/scraping/articleExtractorService';
import { getSources, updateSourceSelection } from '../db/services/sources/sourcesService';
import { validateVerificationAccess } from '../db/services/verifications/verificationsPermissionsService';
import { protectedProcedure, publicProcedure } from '../lib/orpc';

// Router handling source operations: fetching, selection, preview, and final analysis generation
export const sourcesRouter = {
    // Fetches preview content from a URL for source evaluation
  getSourcePreview: protectedProcedure
    .input(
      z.object({
        url: z.string().url('Please provide a valid URL.'),
      })
    )
    .handler(async ({ input }) => {
      const { url } = input;
      try {
        const metadata = await extractArticleData(url);

        return {
          url,
          title: metadata.title,
          summary: metadata.description,
          domain: metadata.source || new URL(url).hostname,
          image: metadata.image,
        };
      } catch (error) {
        console.error(`[getSourcePreview] Failed to extract data for ${url}:`, error);
        throw new ORPCError('INTERNAL_SERVER_ERROR');
      }
    }),

    // Retrieves all sources for a verification with filtering and sorting
  getSources: protectedProcedure
    .input(
      z.object({
        verificationId: z.string().uuid(),
        filters: z.any().optional(),
        searchQuery: z.string().optional(),
      })
    )
    .handler(async ({ input, context }) => {
      const { verificationId, filters, searchQuery } = input;
      await validateVerificationAccess(verificationId, context.session.user.id);
      return getSources(verificationId, filters, searchQuery);
    }),

    // Updates which sources are selected for final analysis
  updateSourceSelection: protectedProcedure
    .input(
      z.object({
        verificationId: z.string().uuid(),
        sourceId: z.string().uuid(),
        isSelected: z.boolean(),
      })
    )
    .handler(async ({ input, context }) => {
      const { verificationId, sourceId, isSelected } = input;
      await validateVerificationAccess(verificationId, context.session.user.id);
      await updateSourceSelection(sourceId, isSelected);
      return { success: true, sourceId, isSelected };
    }),

  continueToAnalysis: protectedProcedure
    .input(z.object({ verificationId: z.string().uuid() }))
    .handler(async ({ input, context }) => {
      const { verificationId } = input;
      await validateVerificationAccess(verificationId, context.session.user.id);
      generateAndSaveFinalAnalysis(verificationId);
      return { success: true, message: 'Proceso de análisis iniciado.', nextStep: 'finalResult' };
    }),

  getVerificationProgress: publicProcedure
    .input(z.object({ verificationId: z.string().uuid() }))
    .handler(async ({ input, context }) => {
      const { verificationId } = input;
      const userId = context.session?.user?.id;

      const verificationState = await db.query.verification.findFirst({
        where: eq(verification.id, verificationId),
        columns: {
          status: true,
          userId: true,
          originalText: true,
        },
        with: {
          finalResult: {
            columns: {
              id: true,
            },
          },
        },
      });

      if (!verificationState) {
        throw new ORPCError('NOT_FOUND', { message: 'Verification not found.' });
      }

      if (verificationState.status !== 'completed' && verificationState.userId !== userId) {
        throw new ORPCError('UNAUTHORIZED', {
          message: 'You do not have permission to view the progress of this verification.',
        });
      }

      return {
        status: verificationState.status,
        hasFinalResult: !!verificationState.finalResult,
        originalText: verificationState.originalText,
      };
    }),

  getVerificationResultData: publicProcedure
    .input(z.object({ verificationId: z.string().uuid() }))
    .handler(async ({ input, context }) => {
      const { verificationId } = input;
      const userId = context.session?.user?.id;

      const result = await db.query.verification.findFirst({
        where: eq(verification.id, verificationId),
        with: {
          user: { columns: { name: true } },
          criticalQuestion: { orderBy: (questions, { asc }) => [asc(questions.orderIndex)] },
          source: { where: eq(source.isSelected, true) },
          finalResult: true,
        },
      });

      if (!result) {
        throw new ORPCError('NOT_FOUND', { message: 'Verification not found.' });
      }

      if (result.status !== 'completed' && result.userId !== userId) {
        throw new ORPCError('UNAUTHORIZED', { message: 'This verification is not yet public.' });
      }

      if (!result.finalResult) {
        throw new ORPCError('NOT_FOUND', {
          message: 'Verification result not found. The analysis may not be complete yet.',
        });
      }

      return result;
    }),
};
