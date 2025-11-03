import { ORPCError } from '@orpc/server';
import { eq, sql } from 'drizzle-orm';
import { z } from 'zod';
import { db } from '../db';
import { user } from '../db/schema/auth';
import { verification, finalResult, source } from '../db/schema/schema';
import { saveCriticalQuestions } from '../db/services/criticalQuestions/criticalQuestionService';
import {
  createVerificationRecord,
  updateVerificationStatus,
} from '../db/services/verifications/verificationService';
import { getVerificationsList } from '../db/services/verifications/verificationsExtendedService';
import { validateVerificationAccess } from '../db/services/verifications/verificationsPermissionsService';
import {
  callExternalApiWithLogging,
  generateQuestions,
  getJobResult,
} from '../lib/externalApiClient';
import { protectedProcedure, publicProcedure } from '../lib/orpc';

type FinalResultMetadata = {
  main_claim?: string;
  label?: string;
};

const paginationSchema = z.object({
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(20),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
  search: z.string().optional(),
});

export const verificationRouter = {
  startVerification: protectedProcedure
    .input(
      z.object({
        text: z.string().min(30).max(5000).trim(),
        language: z.enum(['es', 'eu', 'ca', 'gl']).default('es'),
      })
    )
    .handler(async ({ input, context }) => {
      if (!context.session?.user?.id) {
        throw new ORPCError('UNAUTHORIZED', { message: 'Sesión de usuario no válida.' });
      }
      const userId = context.session.user.id;

      const currentUser = await db.query.user.findFirst({
        where: eq(user.id, userId),
        columns: { isVerified: true },
      });
      if (!currentUser?.isVerified) {
        throw new ORPCError('FORBIDDEN', {
          message: 'Tu cuenta necesita ser verificada por un administrador.',
        });
      }

      const { text, language } = input;
      const verificationId = await createVerificationRecord(userId, text, language, 'draft');

      try {
        await updateVerificationStatus(verificationId, 'processing_questions');

        const questionsJob = await callExternalApiWithLogging(
          verificationId,
          'generate_questions',
          () =>
            generateQuestions({
              input: text,
              model: process.env.MODEL || '',
              language,
              location: 'es',
            })
        );

        // Return the job ID immediately for the client to poll
        return {
          success: true,
          verificationId,
          job_id: questionsJob.job_id,
          message: 'Job for question generation started successfully.',
        };
      } catch (apiError) {
        console.error(
          `[startVerification ERROR] Failed for verificationId: ${verificationId}`,
          apiError
        );
        await updateVerificationStatus(verificationId, 'error');
        throw new ORPCError('INTERNAL_SERVER_ERROR', {
          message:
            apiError instanceof Error ? apiError.message : 'Falló la generación de preguntas.',
        });
      }
    }),

  getPublicVerifications: publicProcedure.input(paginationSchema).handler(async ({ input }) => {
    try {
      const result = await getVerificationsList({
        ...input,
        status: 'completed',
      });
      return result;
    } catch (error) {
      console.error('Error in getPublicVerifications oRPC procedure:', error);
      throw new ORPCError('INTERNAL_SERVER_ERROR', {
        message: 'Failed to retrieve public verifications.',
      });
    }
  }),

  getPublicVerificationResult: publicProcedure
    .input(z.object({ verificationId: z.string().uuid() }))
    .handler(async ({ input }) => {
      const { verificationId } = input;

      const result = await db.query.verification.findFirst({
        where: eq(verification.id, verificationId),
        with: {
          user: { columns: { name: true } },
          source: { where: eq(source.isSelected, true) },
          finalResult: true,
        },
      });

      if (!result) {
        throw new ORPCError('NOT_FOUND', { message: 'Verification not found.' });
      }

      if (result.status !== 'completed') {
        throw new ORPCError('FORBIDDEN', {
          message: 'This verification is not yet public.',
        });
      }

      if (!result.finalResult) {
        throw new ORPCError('NOT_FOUND', {
          message: 'Verification result is not available yet.',
        });
      }

      const { userId, ...safeResult } = result;
      return safeResult;
    }),

  getOwnVerifications: protectedProcedure
    .input(paginationSchema)
    .handler(async ({ input, context }) => {
      const userId = context.session.user.id;
      try {
        const result = await getVerificationsList({
          ...input,
          userId,
        });
        return result;
      } catch (error) {
        console.error('Error in getMyVerifications oRPC procedure:', error);
        throw new ORPCError('INTERNAL_SERVER_ERROR', {
          message: 'Failed to retrieve user verifications.',
        });
      }
    }),

  saveGeneratedQuestions: protectedProcedure
    .input(
      z.object({
        verificationId: z.string(),
        questions: z.array(
          z.object({
            question_text: z.string(),
            original_question: z.string().optional(),
            order_index: z.number().optional(),
          })
        ),
      })
    )
    .handler(async ({ input, context }) => {
      const { verificationId, questions } = input;
      await validateVerificationAccess(verificationId, context.session.user.id, 'edit');

      await saveCriticalQuestions(verificationId, questions);

      //if (questionsSavedCount > 0) {
      //  await updateVerificationStatus(verificationId, 'sources_ready');
      //}

      return { success: true, message: 'Questions processed successfully.' };
    }),

  getJobResult: protectedProcedure
    .input(z.object({ jobId: z.string() }))
    .handler(async ({ input }) => {
      try {
        const result = await getJobResult(input.jobId);
        return result;
      } catch (error) {
        throw new ORPCError('INTERNAL_SERVER_ERROR', {
          message: error instanceof Error ? error.message : 'Failed to get job result',
        });
      }
    }),

  getVerifications: protectedProcedure
    .input(
      z.object({
        page: z.number().min(1).default(1),
        limit: z.number().min(1).max(100).default(20),
        sortBy: z.string().optional(),
        sortOrder: z.enum(['asc', 'desc']).optional(),
        search: z.string().optional(),
      })
    )
    .handler(async ({ input, context }) => {
      const userId = context.session.user.id;
      console.log('Session in getVerifications:', context.session);
      console.log(await getVerificationsList({ userId: 'some-id', page: 1, limit: 5 }));

      try {
        console.log('Session in getVerifications:', context.session);
        console.log('UserId in getVerifications:', context.session?.user?.id);

        const result = await getVerificationsList({
          userId,
          page: input.page,
          limit: input.limit,
          sortBy: input.sortBy,
          sortOrder: input.sortOrder,
          search: input.search,
        });
        return result;
      } catch (error) {
        console.error('Error in getVerifications oRPC procedure:', error);
        throw new ORPCError('INTERNAL_SERVER_ERROR', {
          message: 'Failed to retrieve user verifications.',
        });
      }
    }),

  getVerificationsHome: publicProcedure
    .input(
      z.object({
        page: z.number().min(1).default(1),
        limit: z.number().min(1).max(100).default(6),
        sortBy: z.string().optional(),
      })
    )
    .handler(async ({ input }) => {
      try {
        const publicVerifications = await db.query.verification.findMany({
          where: eq(verification.status, 'completed'),
          limit: input.limit,
          offset: (input.page - 1) * input.limit,
          orderBy: (verifications, { desc }) => [desc(verifications.createdAt)],
          with: {
            user: { columns: { name: true } },
            finalResult: { columns: { metadata: true } },
          },
        });

        const formattedVerifications = publicVerifications.map((v) => {
          const metadata = v.finalResult?.metadata as FinalResultMetadata | undefined;

          return {
            id: v.id,
            createdAt: v.createdAt,
            originalText: v.originalText,
            userName: v.user?.name ?? null,
            claim: metadata?.main_claim ?? null,
            label: metadata?.label ?? null,
          };
        });

        const totalCountResult = await db
          .select({ count: sql<number>`count(*)` })
          .from(verification)
          .where(eq(verification.status, 'completed'));
        const totalCount = totalCountResult[0].count;

        return {
          verifications: formattedVerifications,
          pagination: {
            currentPage: input.page,
            totalPages: Math.ceil(totalCount / input.limit),
            totalCount,
            limit: input.limit,
          },
        };
      } catch (error) {
        console.error('Error in getVerificationsHome oRPC procedure:', error);
        return {
          verifications: [],
          pagination: { currentPage: 1, totalPages: 0, totalCount: 0, limit: 6 },
        };
      }
    }),
  deleteVerification: protectedProcedure
    .input(z.object({ verificationId: z.string().uuid() }))
    .handler(async ({ input, context }) => {
      const { verificationId } = input;
      const userId = context.session.user.id;

      // The validateVerificationAccess function checks if the user has permission to delete the verification
      await validateVerificationAccess(verificationId, userId, 'edit');

      try {
        await db.delete(verification).where(eq(verification.id, verificationId));
        return { success: true, message: 'Verificación eliminada correctamente.' };
      } catch (error) {
        console.error(`Error deleting verification ${verificationId}:`, error);
        throw new ORPCError('INTERNAL_SERVER_ERROR', {
          message: 'No se pudo eliminar la verificación.',
        });
      }
    }),
};
