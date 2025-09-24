/** biome-ignore-all lint/style/useFilenamingConvention: <Log the error for debugging purposes> */
import { ORPCError } from '@orpc/server';
import { z } from 'zod';
import { db } from '@/db';
import { generateAndSaveFinalAnalysis } from '@/db/services/finalResult/finalsResultService';
import { extractArticleData } from '@/db/services/scraping/articleExtractorService';
import {
  getSources,
  updateSourceSelection,
} from '@/db/services/sources/sourcesService';
import { getVerificationById } from '@/db/services/verifications/verificationService';
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
        // biome-ignore lint/suspicious/noConsole: <Log the error for debugging purposes>
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

  getVerificationStatus: protectedProcedure
    .input(z.object({ verificationId: z.string().uuid() }))
    .handler(async ({ input, context }) => {
      const { verificationId } = input;
      await validateVerificationAccess(verificationId, context.session.user.id);
      const verification = await getVerificationById(verificationId);
      if (!verification) {
        throw new ORPCError('BAD_REQUEST' );
      }
      return { status: verification.status };
    }),

  getFinalResult: protectedProcedure
    .input(z.object({ verificationId: z.string().uuid() }))
    .handler(async ({ input, context }) => {
      const { verificationId } = input;
      await validateVerificationAccess(verificationId, context.session.user.id);
      const result = await db.query.finalResult.findFirst({
        where: (fr, { eq }) => eq(fr.verificationId, verificationId),
      });
      if (!result) {
        throw new ORPCError('BAD_REQUEST');
      }
      return result;
    }),
};
