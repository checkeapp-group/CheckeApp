import { eq } from 'drizzle-orm';
import { db } from '../..';
import { verification } from '../../schema/schema';

export type VerificationPermissionCheck = {
  exists: boolean;
  isOwner: boolean;
  status: string | null;
  canEdit: boolean;
  canView: boolean;
};

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
        canView: false,
      };
    }

    const record = verificationRecord[0];
    const isOwner = record.userId === userId;
    const canEdit =
      isOwner && (record.status === 'processing_questions' || record.status === 'sources_ready');
    const canView =
      canEdit || (isOwner && ['generating_summary', 'completed', 'error'].includes(record.status));

    return {
      exists: true,
      isOwner,
      status: record.status,
      canEdit,
      canView,
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
  require: 'view' | 'edit' = 'view'
): Promise<void> {
  console.log(
    `[Permissions] Validando acceso para userId: ${userId} en verificationId: ${verificationId}. Requiere: ${require}`
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

  if (require === 'edit' && !permissions.canEdit) {
    console.error(
      `[Permissions] Fallo: Se requieren permisos de edición, pero no se tienen. Estado actual: ${permissions.status}`
    );
    throw new Error(
      `La verificación no está en estado editable. Estado actual: ${permissions.status}`
    );
  }

  if (require === 'view' && !permissions.canView) {
    console.error(
      `[Permissions] Fallo: Se requieren permisos de visualización, pero no se tienen. Estado actual: ${permissions.status}`
    );
    throw new Error(
      `No tienes permisos para ver esta verificación en su estado actual: ${permissions.status}`
    );
  }

  console.log('[Permissions] Validación de acceso exitosa.');
}