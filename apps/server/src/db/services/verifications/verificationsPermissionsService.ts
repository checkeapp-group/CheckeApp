import { eq } from 'drizzle-orm';
import { db } from '@/db';
import { verification } from '@/db/schema/schema';

export interface VerificationPermissionCheck {
  exists: boolean;
  isOwner: boolean;
  status: string | null;
  canEdit: boolean;
}

/**
 * Check user permissions for a verification
 */
export async function checkVerificationPermissions(
  verificationId: string,
  userId: string
): Promise<VerificationPermissionCheck> {
  try {
    const verificationRecord = await db
      .select({
        userId: verification.userId,
        status: verification.status,
      })
      .from(verification)
      .where(eq(verification.id, verificationId))
      .limit(1);

    if (!verificationRecord.length) {
      return {
        exists: false,
        isOwner: false,
        status: null,
        canEdit: false,
      };
    }

    const record = verificationRecord[0];
    const isOwner = record.userId === userId;

    // Can edit ONLY when status is 'processing_questions' AND user owns it
    const canEdit = isOwner && record.status === 'processing_questions';

    return {
      exists: true,
      isOwner,
      status: record.status,
      canEdit,
    };
  } catch (error) {
    console.error('Error checking verification permissions:', error);
    throw new Error('Error al verificar permisos de acceso');
  }
}

/**
 * Validate verification access with specific permission requirements
 */
export async function validateVerificationAccess(
  verificationId: string,
  userId: string,
  requireEditPermissions = false
): Promise<void> {
  const permissions = await checkVerificationPermissions(verificationId, userId);

  if (!permissions.exists) {
    throw new Error('Verificación no encontrada');
  }

  if (!permissions.isOwner) {
    throw new Error('No tienes permisos para acceder a esta verificación');
  }

  if (requireEditPermissions && !permissions.canEdit) {
    if (permissions.status !== 'processing_questions') {
      throw new Error(
        `La verificación no está en estado editable. Estado actual: ${permissions.status}`
      );
    }
    throw new Error('No tienes permisos para editar esta verificación');
  }
}
