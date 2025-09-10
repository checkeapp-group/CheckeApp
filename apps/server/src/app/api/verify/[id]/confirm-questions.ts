import { type NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { saveCriticalQuestions } from '@/db/services/criticalQuestions/criticalQuestionService';
import { updateVerificationStatus } from '@/db/services/verifications/verificationService';
import { validateVerificationAccess } from '@/db/services/verifications/verificationsPermissionsService';
import { auth } from '@/lib/auth';

const confirmQuestionsSchema = z.object({
  questions: z
    .array(
      z.object({
        question_text: z.string().min(5).max(200),
        original_question: z.string().min(5).max(200),
        order_index: z.number().min(0),
      })
    )
    .min(1, 'Debe haber al menos una pregunta'),
});

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Authentication check
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
    const verificationId = params.id;

    // Validate user owns this verification
    await validateVerificationAccess(verificationId, userId);

    // Validate input
    const body = await request.json();
    const validationResult = confirmQuestionsSchema.safeParse(body);

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

    const { questions } = validationResult.data;

    try {
      // Save questions to critical_questions table
      await saveCriticalQuestions(verificationId, questions);

      // Update verification status to sources_ready
      await updateVerificationStatus(verificationId, 'sources_ready');

      return NextResponse.json(
        {
          success: true,
          message: 'Questions confirmed and saved successfully',
          questions_count: questions.length,
          next_step: 'edit',
        },
        { status: 200 }
      );
    } catch (error) {
      console.error('Error saving confirmed questions:', error);

      return NextResponse.json(
        {
          success: false,
          error: 'SAVE_FAILED',
          message: 'Error al guardar las preguntas confirmadas',
          details: error instanceof Error ? error.message : 'Error desconocido',
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error in confirm-questions route:', error);

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
