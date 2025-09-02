import { db } from '@/db';
import { verification, type NewVerification } from '@/db/schema/schema';
import { v4 as uuidv4 } from 'uuid';

/**
 * Creates a new verification record in the database
 * @param userId - The ID of the user creating the verification
 * @param originalText - The text to be fact-checked
 * @returns Promise with the created verification ID
 */
export async function createVerificationRecord(
  userId: string,
  originalText: string
): Promise<string> {
  const verificationId = uuidv4();

  const newVerification: NewVerification = {
    id: verificationId,
    userId,
    originalText,
    status: 'processing_questions',
  };

  try {
    await db.insert(verification).values(newVerification);

    console.log(`✅ Verification created: ${verificationId} for user: ${userId}`);

    return verificationId;
  } catch (error) {
    console.error('❌ Error creating verification record:', error);

    throw new Error(
      `Failed to create verification record: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

/**
 * Updates verification status
 * @param verificationId - The verification ID to update
 * @param status - The new status
 */
export async function updateVerificationStatus(
  verificationId: string,
  status:
    | 'draft'
    | 'processing_questions'
    | 'sources_ready'
    | 'generating_summary'
    | 'completed'
    | 'error'
): Promise<void> {
  try {
    await db
      .update(verification)
      .set({
        status,
        updatedAt: new Date(),
      })
      .where(eq(verification.id, verificationId));

    console.log(`📝 Verification ${verificationId} status updated to: ${status}`);
  } catch (error) {
    console.error('❌ Error updating verification status:', error);
    throw new Error(
      `Failed to update verification status: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

import { eq } from 'drizzle-orm';
