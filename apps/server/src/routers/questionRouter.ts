import { getCriticalQuestions, getGeneratedQuestions } from '@/db/services/criticalQuestions/criticalQuestionService';
import {
  confirmQuestions,
  createNewQuestion,
  deleteQuestionWithValidation,
  reorderVerificationQuestions,
  updateQuestionWithValidation,
  validateVerificationReadyToContinue,
} from '@/db/services/criticalQuestions/criticalQuestionsExtendedService';
import { updateVerificationStatus } from '@/db/services/verifications/verificationService';
import { validateVerificationAccess } from '@/db/services/verifications/verificationsPermissionsService';
import { protectedProcedure } from '@/lib/orpc';
import {
  addQuestionSchema,
  continueVerificationSchema,
  deleteQuestionSchema,
  getQuestionsSchema,
  reorderQuestionsSchema,
  updateQuestionSchema,
} from '@/lib/questionsSchemas';
import { z } from 'zod';

export const questionsRouter = {
  // Gets all questions from critical_questions for a verification
  getVerificationQuestions: protectedProcedure
    .input(getQuestionsSchema)
    .handler(async ({ input, context }) => {
      const { verificationId } = input;
      const userId = context.session.user.id;

      // Verify that there is a verification with status "processing_questions"
      await validateVerificationAccess(verificationId, userId, true);

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

  continueVerification: protectedProcedure
    .input(continueVerificationSchema)
    .handler(async ({ input, context }) => {
      const { verificationId } = input;
      const userId = context.session.user.id;

      await validateVerificationAccess(verificationId, userId, true);

      const { canContinue, message } = await validateVerificationReadyToContinue(verificationId);

      if (!canContinue) {
        throw new Error(message);
      }

      await updateVerificationStatus(verificationId, 'sources_ready');

      return {
        success: true,
        message: 'Verificación lista para el siguiente paso',
        nextStep: 'sources',
      };
    }),
  getGeneratedQuestions: protectedProcedure
    .input(z.object({ verificationId: z.string() }))
    .handler(async ({ input, context }) => {
      const { verificationId } = input;
      const userId = context.session.user.id;

      // You can add permission checks here if needed
      await validateVerificationAccess(verificationId, userId);

      const questions = await getGeneratedQuestions(verificationId);
      return { questions };
    }),

  confirmQuestions: protectedProcedure
    .input(
      z.object({
        verificationId: z.string(),
        questions: z.array(
          z.object({
            question_text: z.string(),
            original_question: z.string(),
            order_index: z.number(),
          })
        ),
      })
    )
    .handler(async ({ input, context }) => {
      const { verificationId, questions } = input;
      const userId = context.session.user.id;

      // You can add permission checks here if needed
      await validateVerificationAccess(verificationId, userId);

      await confirmQuestions(verificationId, questions);
      return { success: true, message: 'Questions confirmed successfully' };
    }),
};

export type QuestionsRouter = typeof questionsRouter;
