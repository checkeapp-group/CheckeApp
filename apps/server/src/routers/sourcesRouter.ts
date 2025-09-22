import { ORPCError } from '@orpc/server';
import { z } from 'zod';
import { db } from '@/db';
import { generateAndSaveFinalAnalysis } from '@/db/services/finalResult/finalsResultService';
import { getSources, updateSourceSelection } from '@/db/services/sources/sourcesService';
import { getVerificationById } from '@/db/services/verifications/verificationService';
import { validateVerificationAccess } from '@/db/services/verifications/verificationsPermissionsService';
import { protectedProcedure } from '@/lib/orpc';

export const sourcesRouter = {
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
      generateAndSaveFinalAnalysis(verificationId); // Inicia en segundo plano
      return { success: true, message: 'Proceso de análisis iniciado.', nextStep: 'finalResult' };
    }),

  getVerificationStatus: protectedProcedure
    .input(z.object({ verificationId: z.string().uuid() }))
    .handler(async ({ input, context }) => {
      const { verificationId } = input;
      await validateVerificationAccess(verificationId, context.session.user.id);
      const verification = await getVerificationById(verificationId);
      if (!verification) throw new ORPCError({ code: 'NOT_FOUND' });
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
      if (!result) throw new ORPCError({ code: 'NOT_FOUND' });
      return result;
    }),
};