import { z } from 'zod';
import { getSources, updateSourceSelection } from '@/db/services/sources/sourcesService';
import { updateVerificationStatus } from '@/db/services/verifications/verificationService';
import { validateVerificationAccess } from '@/db/services/verifications/verificationsPermissionsService';
import { protectedProcedure } from '@/lib/orpc';

export const sourcesRouter = {
  getSources: protectedProcedure
    .input(z.object({ verificationId: z.string().uuid() }))
    .handler(async ({ input, context }) => {
      const { verificationId } = input;
      const userId = context.session.user.id;

      await validateVerificationAccess(verificationId, userId);

      const sources = await getSources(verificationId);
      return sources;
    }),

  // Process to update the selection status of a source
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
      const userId = context.session.user.id;

      await validateVerificationAccess(verificationId, userId);

      await updateSourceSelection(sourceId, isSelected);

      return { success: true, sourceId, isSelected };
    }),

  // Process to continue to the next step (analysis generation)
  continueToAnalysis: protectedProcedure
    .input(z.object({ verificationId: z.string().uuid() }))
    .handler(async ({ input, context }) => {
      const { verificationId } = input;
      const userId = context.session.user.id;

      await validateVerificationAccess(verificationId, userId);

      await updateVerificationStatus(verificationId, 'generating_summary');

      return { success: true, nextStep: 'analysis' };
    }),
};
