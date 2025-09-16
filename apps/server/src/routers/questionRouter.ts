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
  // Gets all questions from critical_questions for a verification
  getVerificationQuestions: protectedProcedure
    .input(getQuestionsSchema)
    .handler(async ({ input, context }) => {
      const { verificationId } = input;
      const userId = context.session.user.id;

      // Verify that there is a verification with status "processing_questions"
      await validateVerificationAccess(verificationId, userId, true);

      console.log(`[oRPC] Acceso validado para ${userId} en ${verificationId}`);

      const questions = await getCriticalQuestions(verificationId);
      return questions;
    }),

  // Update question after inline edit and mark it as edited
  updateQuestion: protectedProcedure
    .input(updateQuestionSchema)
    .handler(async ({ input, context }) => {
      const { questionId, verificationId, questionText } = input;
      const userId = context.session.user.id;

      await validateVerificationAccess(verificationId, userId, true);

      await updateQuestionWithValidation(questionId, verificationId, {
        questionText,
      });

      return { success: true, message: 'Pregunta actualizada correctamente' };
    }),

  deleteQuestion: protectedProcedure
    .input(deleteQuestionSchema)
    .handler(async ({ input, context }) => {
      const { questionId, verificationId } = input;
      const userId = context.session.user.id;

      await validateVerificationAccess(verificationId, userId, true);

      await deleteQuestionWithValidation(questionId, verificationId);

      return { success: true, message: 'Pregunta eliminada correctamente' };
    }),

  addQuestion: protectedProcedure.input(addQuestionSchema).handler(async ({ input, context }) => {
    const { verificationId, questionText } = input;
    const userId = context.session.user.id;

    // Verify that there is a verification with status "processing_questions"
    await validateVerificationAccess(verificationId, userId, true);

    const newQuestion = await createNewQuestion({
      verificationId,
      questionText,
    });

    return {
      success: true,
      message: 'Pregunta añadida correctamente',
      question: newQuestion,
    };
  }),

  reorderQuestions: protectedProcedure
    .input(reorderQuestionsSchema)
    .handler(async ({ input, context }) => {
      const { verificationId, questions } = input;
      const userId = context.session.user.id;

      await validateVerificationAccess(verificationId, userId, true);

      await reorderVerificationQuestions(verificationId, questions);

      return { success: true, message: 'Preguntas reordenadas correctamente' };
    }),

  confirmQuestionsAndSearchSources: protectedProcedure
    .input(continueVerificationSchema)
    .handler(async ({ input, context }) => {
      const { verificationId } = input;
      const userId = context.session.user.id;
      console.log(`[oRPC confirm] Iniciando para verificationId: ${verificationId}`);

      try {
        await validateVerificationAccess(verificationId, userId, true);
        const { canContinue, message } = await validateVerificationReadyToContinue(verificationId);
        if (!canContinue) {
          console.error(`[oRPC confirm] Fallo de validación: ${message}`);
          throw new Error(message);
        }
        console.log(`[oRPC confirm] Validación de acceso y preguntas completada.`);

        const finalQuestions = await getCriticalQuestions(verificationId);
        const verification = await getVerificationById(verificationId);
        if (!verification) {
          console.error(
            `[oRPC confirm] Fallo crítico: No se encontró la verificación ${verificationId} en la BD.`
          );
          throw new Error('Verificación no encontrada.');
        }
        console.log(
          `[oRPC confirm] Obtenidas ${finalQuestions.length} preguntas y el texto original.`
        );

        console.log(`[oRPC confirm] Llamando a la API externa para buscar fuentes...`);
        const sourcesResult = await callExternalApiWithLogging(
          verificationId,
          'search_sources',
          () =>
            searchSources({
              verification_id: verificationId,
              questions: finalQuestions.map((q) => ({
                id: q.id,
                question_text: q.questionText,
                order_index: q.orderIndex,
              })),
              original_text: verification.originalText,
            })
        );
        console.log(
          `[oRPC confirm] API externa respondió. Se encontraron ${sourcesResult.sources?.length || 0} fuentes.`
        );

        if (sourcesResult.sources && sourcesResult.sources.length > 0) {
          console.log(
            `[oRPC confirm] Guardando ${sourcesResult.sources.length} fuentes en la BD...`
          );
          await saveSourcesFromAPI(verificationId, sourcesResult.sources);
          console.log(`[oRPC confirm] Fuentes guardadas correctamente.`);
        }

        console.log(`[oRPC confirm] Actualizando estado de la verificación a 'sources_ready'...`);
        await updateVerificationStatus(verificationId, 'sources_ready');
        console.log(`[oRPC confirm] Estado actualizado.`);

        return {
          success: true,
          message: 'Fuentes encontradas y guardadas correctamente.',
          nextStep: 'sources',
          sources_count: sourcesResult.sources?.length || 0,
        };
      } catch (error) {
        console.error(
          `[oRPC confirm] --- ERROR CATCHED --- en verificationId ${verificationId}:`,
          error
        );
        throw error;
      }
    }),
};

export type QuestionsRouter = typeof questionsRouter;
