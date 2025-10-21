import { ORPCError } from '@orpc/server';
import { eq } from 'drizzle-orm';
import { z } from 'zod';
import { db } from '@/db';
import { source, verification } from '@/db/schema/schema';
import { generateAndSaveFinalAnalysis } from '@/db/services/finalResult/finalsResultService';
import { extractArticleData } from '@/db/services/scraping/articleExtractorService';
import { getSources, updateSourceSelection } from '@/db/services/sources/sourcesService';
import { validateVerificationAccess } from '@/db/services/verifications/verificationsPermissionsService';
import { protectedProcedure } from '@/lib/orpc';

export const sourcesRouter = {
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

  getVerificationProgress: protectedProcedure
    .input(z.object({ verificationId: z.string().uuid() }))
    .handler(async ({ input, context }) => {
      const { verificationId } = input;
      await validateVerificationAccess(verificationId, context.session.user.id, 'view');

      const verificationState = await db.query.verification.findFirst({
        where: eq(verification.id, verificationId),
        columns: {
          status: true,
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

      return {
        status: verificationState.status,
        hasFinalResult: !!verificationState.finalResult,
      };
    }),

  getVerificationResultData: protectedProcedure
    .input(z.object({ verificationId: z.string().uuid() }))
    .handler(async ({ input, context }) => {
      const { verificationId } = input;
      await validateVerificationAccess(verificationId, context.session.user.id, 'view');

      // Fetch all related data using Drizzle's relational queries.
      const result = await db.query.verification.findFirst({
        where: eq(verification.id, verificationId),
        with: {
          user: {
            columns: {
              name: true,
            },
          },
          criticalQuestion: {
            orderBy: (questions, { asc }) => [asc(questions.orderIndex)],
          },
          source: {
            where: eq(source.isSelected, true),
          },
          finalResult: true,
        },
      });

      if (!(result && result.finalResult)) {
        throw new ORPCError('NOT_FOUND', {
          message: 'Verification result not found. The analysis may not be complete yet.',
        });
      }

      console.log(
        `[getVerificationResultData] Successfully fetched completed result for ${verificationId} from DB.`
      );
      return result;
    }),
};
