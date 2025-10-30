import { ORPCError } from '@orpc/server';
import z from 'zod';
import { getCriticalQuestions } from '@/db/services/criticalQuestions/criticalQuestionService';
import {
  createNewQuestion,
  deleteQuestionWithValidation,
  reorderVerificationQuestions,
  updateQuestionWithValidation,
  validateVerificationReadyToContinue,
} from '@/db/services/criticalQuestions/criticalQuestionsExtendedService';
import { saveSourcesFromAPI } from '@/db/services/sources/sourcesService';
import {
  getVerificationById,
  updateVerificationStatus,
} from '@/db/services/verifications/verificationService';
import { validateVerificationAccess } from '@/db/services/verifications/verificationsPermissionsService';
import { callExternalApiWithLogging, searchSources } from '@/lib/externalApiClient';
import { protectedProcedure } from '@/lib/orpc';
import {
  addQuestionSchema,
  continueVerificationSchema,
  deleteQuestionSchema,
  getQuestionsSchema,
  reorderQuestionsSchema,
  updateQuestionSchema,
} from '@/lib/questionsSchemas';

export const questionsRouter = {
  getVerificationQuestions: protectedProcedure
    .input(getQuestionsSchema)
    .handler(async ({ input, context }) => {
      const { verificationId } = input;
      await validateVerificationAccess(verificationId, context.session.user.id, 'view');
      return getCriticalQuestions(verificationId);
    }),

  updateQuestion: protectedProcedure
    .input(updateQuestionSchema)
    .handler(async ({ input, context }) => {
      const { questionId, verificationId, questionText } = input;
      await validateVerificationAccess(verificationId, context.session.user.id, 'edit');
      await updateQuestionWithValidation(questionId, verificationId, { questionText });
      return { success: true, message: 'Pregunta actualizada correctamente' };
    }),

  deleteQuestion: protectedProcedure
    .input(deleteQuestionSchema)
    .handler(async ({ input, context }) => {
      const { questionId, verificationId } = input;
      await validateVerificationAccess(verificationId, context.session.user.id, 'edit');
      await deleteQuestionWithValidation(questionId, verificationId);
      return { success: true, message: 'Pregunta eliminada correctamente' };
    }),

  addQuestion: protectedProcedure.input(addQuestionSchema).handler(async ({ input, context }) => {
    const { verificationId, questionText } = input;
    await validateVerificationAccess(verificationId, context.session.user.id, 'edit');
    const newQuestion = await createNewQuestion({ verificationId, questionText });
    return { success: true, message: 'Pregunta añadida correctamente', question: newQuestion };
  }),

  reorderQuestions: protectedProcedure
    .input(reorderQuestionsSchema)
    .handler(async ({ input, context }) => {
      const { verificationId, questions } = input;
      await validateVerificationAccess(verificationId, context.session.user.id, 'edit');
      await reorderVerificationQuestions(verificationId, questions);
      return { success: true, message: 'Preguntas reordenadas correctamente' };
    }),

  confirmQuestionsAndSearchSources: protectedProcedure
    .input(continueVerificationSchema)
    .handler(async ({ input, context }) => {
      const { verificationId } = input;
      await validateVerificationAccess(verificationId, context.session.user.id, 'edit');

      const { canContinue, message } = await validateVerificationReadyToContinue(verificationId);
      if (!canContinue) {
        throw new ORPCError('BAD_REQUEST', { message });
      }

      const finalQuestions = await getCriticalQuestions(verificationId);
      const verification = await getVerificationById(verificationId);
      if (!verification) {
        throw new ORPCError('NOT_FOUND', { message: 'Verification not found' });
      }

      try {
        const sourcesJob = await callExternalApiWithLogging(verificationId, 'search_sources', () =>
          searchSources({
            questions: finalQuestions.map((q) => q.questionText),
            input: verification.originalText,
            language: verification.language,
            location: 'es',
            model: process.env.MODEL || '',
          })
        );

        // Return the job ID immediately for the client to poll
        return {
          success: true,
          jobId: sourcesJob.job_id,
          message: 'Job for source searching started successfully.',
        };
      } catch (apiError) {
        console.error(
          `[confirmQuestions ERROR] Failed for verificationId: ${verificationId}`,
          apiError
        );
        await updateVerificationStatus(verificationId, 'error');
        throw new ORPCError('INTERNAL_SERVER_ERROR', {
          message: apiError instanceof Error ? apiError.message : 'Failed to search for sources',
        });
      }
    }),

  saveSearchedSources: protectedProcedure
    .input(
      z.object({
        verificationId: z.string(),
        sources: z.array(
          z.object({
            url: z.string(),
            title: z.string().optional().nullable(),
            summary: z.string().optional().nullable(),
            domain: z.string().optional().nullable(),
            isSelected: z.boolean().optional(),
            scrapingDate: z.string().datetime().optional().nullable(),
          })
        ),
      })
    )
    .handler(async ({ input, context }) => {
      const { verificationId, sources } = input;
      await validateVerificationAccess(verificationId, context.session.user.id, 'edit');

      await saveSourcesFromAPI(verificationId, sources as any);
      await updateVerificationStatus(verificationId, 'sources_ready');

      return { success: true, message: 'Sources saved successfully.' };
    }),

  getVerificationDetails: protectedProcedure
    .input(z.object({ verificationId: z.string().uuid() }))
    .handler(async ({ input, context }) => {
      const { verificationId } = input;
      await validateVerificationAccess(verificationId, context.session.user.id, 'view');
      const verification = await getVerificationById(verificationId);
      if (!verification) {
        throw new ORPCError('NOT_FOUND');
      }
      return verification;
    }),
};
