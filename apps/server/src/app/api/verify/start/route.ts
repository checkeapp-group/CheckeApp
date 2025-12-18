import { type NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import {
  createVerificationRecord,
  updateVerificationStatus,
} from '../../../../db/services/verifications/verificationService';
import { auth } from '../../../../lib/auth';
import { callExternalApiWithLogging, generateQuestions } from '../../../../lib/externalApiClient';

const startVerificationSchema = z.object({
  text: z
    .string()
    .min(50, 'El texto debe tener al menos 50 caracteres')
    .max(5000, 'El texto no puede exceder 5000 caracteres')
    .trim(),
  language: z.enum(['es', 'eu', 'ca', 'gl']).default('es'),
});

// API endpoint to start a new verification process
export async function POST(request: NextRequest) {
  let verificationId: string | null = null;

  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const userId = session.user.id;
    const body = await request.json();
    const validationResult = startVerificationSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Datos de entrada inválidos', details: validationResult.error.flatten() },
        { status: 400 }
      );
    }

    const { text, language } = validationResult.data;

    verificationId = await createVerificationRecord(userId, text, language, 'draft');

    await updateVerificationStatus(verificationId, 'processing_questions');

    const model = process.env.MODEL;
    if (!model) {
      throw new Error("La variable de entorno 'MODEL' no está configurada en el servidor.");
    }

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

    return NextResponse.json(
      {
        success: true,
        verification_id: verificationId,
        job_id: questionsJob.job_id,
        status: 'processing_questions',
        message: 'Job for question generation started successfully.',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error in /api/verify/start:', error);

    if (verificationId) {
      await updateVerificationStatus(verificationId, 'error');
    }

    return NextResponse.json(
      {
        success: false,
        verification_id: verificationId,
        error: 'Question generation failed',
        message: error instanceof Error ? error.message : 'Failed to generate questions',
        status: 'error',
      },
      { status: 500 }
    );
  }
}

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
