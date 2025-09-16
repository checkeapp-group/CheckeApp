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
  console.log(
    `[Permissions] Validando acceso para userId: ${userId} en verificationId: ${verificationId}. Requiere edición: ${requireEditPermissions}`
  );

  const permissions = await checkVerificationPermissions(verificationId, userId);
  console.log('[Permissions] Resultado de checkVerificationPermissions:', permissions);

  if (!permissions.exists) {
    console.error(`[Permissions] Fallo: Verificación no encontrada (${verificationId})`);
    throw new Error('Verificación no encontrada');
  }

  if (!permissions.isOwner) {
    console.error(`[Permissions] Fallo: El usuario ${userId} no es propietario.`);
    throw new Error('No tienes permisos para acceder a esta verificación');
  }

  if (requireEditPermissions && !permissions.canEdit) {
    console.error(
      `[Permissions] Fallo: Se requieren permisos de edición, pero no se tienen. Estado actual: ${permissions.status}`
    );
    if (permissions.status !== 'processing_questions') {
      throw new Error(
        `La verificación no está en estado editable. Estado actual: ${permissions.status}`
      );
    }
    // Este caso es redundante si el anterior se cumple, pero lo dejamos por claridad
    throw new Error('No tienes permisos para editar esta verificación');
  }

  console.log('[Permissions] Validación de acceso exitosa.');
}
