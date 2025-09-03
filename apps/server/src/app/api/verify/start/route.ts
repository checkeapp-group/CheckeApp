// apps/server/src/app/api/verify/start/route.ts
import { type NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { auth } from '@/lib/auth';
import { createVerificationRecord } from '@/db/services/verifications/verificationService';

// Validation schema for request body
const startVerificationSchema = z.object({
  text: z
    .string()
    .min(50, 'El texto debe tener al menos 50 caracteres')
    .max(5000, 'El texto no puede exceder 5000 caracteres')
    .trim(),
});

export async function POST(request: NextRequest) {
  try {
    // Validate authentication token
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

    // Validate and parse request body
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

    const { text } = validationResult.data;

    // Crear registro de verificación con status "processing_questions"
    const verificationId = await createVerificationRecord(userId, text);

    // TODO: Próximos pasos...
    // - Enviar texto a endpoint de Iker
    // - Guardar preguntas en critical_questions
    // - Registrar logs del proceso

    return NextResponse.json(
      {
        success: true,
        verification_id: verificationId,
        status: 'processing_questions',
        message: 'Verification record created successfully',
      },
      { status: 201 }
    );
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
