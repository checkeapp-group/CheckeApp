import { type NextRequest, NextResponse } from 'next/server';
import { getCriticalQuestions } from '../../../../db/services/criticalQuestions/criticalQuestionService';
import {
  getVerificationById,
  updateVerificationStatus,
} from '../../../../db/services/verifications/verificationService';
import { validateVerificationAccess } from '../../../../db/services/verifications/verificationsPermissionsService';
import { auth } from '../../../../lib/auth';
import { callExternalApiWithLogging, searchSources } from '../../../../lib/externalApiClient';

// API endpoint to confirm questions and proceed with verification
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

    try {
      const criticalQuestions = await getCriticalQuestions(verificationId);
      const verification = await getVerificationById(verificationId);

      if (!verification) {
        throw new Error('Verification not found');
      }
      if (criticalQuestions.length === 0) {
        throw new Error('Cannot proceed without critical questions.');
      }

      const sourcesJob = await callExternalApiWithLogging(verificationId, 'search_sources', () =>
        searchSources({
          questions: criticalQuestions.map((q: { questionText: any }) => q.questionText),
          input: verification.originalText,
          language: verification.language,
          location: 'es',
          model: process.env.MODEL || '',
        })
      );

      return NextResponse.json(
        {
          success: true,
          jobId: sourcesJob.job_id,
          message: 'Job for source searching started successfully.',
        },
        { status: 200 }
      );
    } catch (error) {
      console.error('Error in confirm-questions processing:', error);
      await updateVerificationStatus(verificationId, 'error');
      return NextResponse.json(
        {
          success: false,
          error: 'PROCESSING_FAILED',
          message: 'Error al iniciar la búsqueda de fuentes',
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
