import { type NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { saveCriticalQuestions } from '@/db/services/criticalQuestions/criticalQuestionService';
import {
  createVerificationRecord,
  updateVerificationStatus,
} from '@/db/services/verifications/verificationService';
import { auth } from '@/lib/auth';
import { callExternalApiWithLogging, generateQuestions } from '@/lib/externalApiClient';

const startVerificationSchema = z.object({
  text: z
    .string()
    .min(50, 'El texto debe tener al menos 50 caracteres')
    .max(5000, 'El texto no puede exceder 5000 caracteres')
    .trim(),
});

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user?.id) {
      return NextResponse.json(
        {
          error: 'No autorizado',
          message: 'Token de autenticación requerido',
        },
        { status: 401 }
      );
    }

    const userId = session.user.id;

    const body = await request.json();
    const validationResult = startVerificationSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: 'Datos de entrada inválidos',
          details: validationResult.error.errors.map((err) => ({
            field: err.path.join('.'),
            message: err.message,
          })),
        },
        { status: 400 }
      );
    }

    const { text, confirmedQuestions } = validationResult.data;

    const verificationId = await createVerificationRecord(userId, text);

    try {
      if (confirmedQuestions && confirmedQuestions.length > 0) {
        await saveCriticalQuestions(verificationId, confirmedQuestions);
        await updateVerificationStatus(verificationId, 'questions_saved');

        return NextResponse.json(
          {
            success: true,
            verification_id: verificationId,
            status: 'questions_saved',
            message: 'Verification created with questions',
            questions_count: confirmedQuestions.length,
          },
          { status: 201 }
        );
      }

      const questionsResult = await callExternalApiWithLogging(
        verificationId,
        'generate_questions',
        () =>
          generateQuestions({
            verification_id: verificationId,
            original_text: text,
            language: 'es',
            max_questions: 5,
          })
      );

      // Save generated questions to database
      if (questionsResult.questions && questionsResult.questions.length > 0) {
        await saveCriticalQuestions(verificationId, questionsResult.questions);
        await updateVerificationStatus(verificationId, 'processing_questions');
      }

      return NextResponse.json(
        {
          success: true,
          verification_id: verificationId,
          status: 'processing_questions',
          message: 'Questions generated and verification created successfully',
          questions_count: questionsResult.questions?.length || 0,
        },
        { status: 201 }
      );
    } catch (apiError) {
      // If external API fails, still create the verification but mark it as error
      console.error('External API error during question generation:', apiError);
      await updateVerificationStatus(verificationId, 'error');

      return NextResponse.json(
        {
          success: false,
          verification_id: verificationId,
          error: 'Question generation failed',
          message: apiError instanceof Error ? apiError.message : 'Failed to generate questions',
          status: 'error',
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error in /api/verify/start:', error);
    return NextResponse.json(
      {
        error: 'Error interno del servidor',
        message: error instanceof Error ? error.message : 'Error desconocido',
      },
      { status: 500 }
    );
  }
}

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
