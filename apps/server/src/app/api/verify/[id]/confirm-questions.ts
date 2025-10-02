import { type NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import {
  getCriticalQuestions,
  sendCriticalQuestions,
} from '@/db/services/criticalQuestions/criticalQuestionService';
import { makeSourcesReady } from '@/db/services/processLogs/processLogsService';
import { saveSourcesFromAPI } from '@/db/services/sources/sourcesService';
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

    try {
      await validateVerificationAccess(verificationId, userId);

      const criticalQuestions = await getCriticalQuestions(verificationId);

      const sourcesResponse = await sendCriticalQuestions(verificationId, criticalQuestions);

      await updateVerificationStatus(verificationId, 'sources_ready');

      await makeSourcesReady(verificationId);

      await saveSourcesFromAPI(verificationId, sourcesResponse.sources);
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
