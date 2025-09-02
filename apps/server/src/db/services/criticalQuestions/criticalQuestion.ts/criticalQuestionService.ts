import { db } from '@/db';
import { criticalQuestion, type NewCriticalQuestion } from '@/db/schema/schema';
import { v4 as uuidv4 } from 'uuid';
import { eq } from 'drizzle-orm';

/**
 * Type for questions received from external API
 */
export type ReceivedQuestion = {
  question_text: string;
  original_question?: string;
  order_index?: number;
};

/**
 * Saves critical questions to the database
 * @param verificationId - The verification ID these questions belong to
 * @param questions - Array of questions received from external API
 * @returns Promise with the number of questions saved
 */
export async function saveCriticalQuestions(
  verificationId: string,
  questions: ReceivedQuestion[]
): Promise<number> {
  if (!questions || questions.length === 0) {
    console.log(`No questions to save for verification: ${verificationId}`);
    return 0;
  }

  try {
    // Validate and prepare question records
    const questionRecords: NewCriticalQuestion[] = [];

    for (let i = 0; i < questions.length; i++) {
      const question = questions[i];

      // Validate question text
      if (!question.question_text || question.question_text.trim().length === 0) {
        console.warn(`Skipping empty question at index ${i}`);
        continue;
      }

      const trimmedText = question.question_text.trim();

      if (trimmedText.length < 50 || trimmedText.length > 5000) {
        console.warn(
          `Skipping question at index ${i}: invalid length (${trimmedText.length} characters)`
        );
        continue;
      }

      const questionRecord: NewCriticalQuestion = {
        id: uuidv4(),
        verificationId,
        questionText: trimmedText,
        originalQuestion: question.original_question?.trim() || trimmedText,
        isEdited: false,
        orderIndex: question.order_index ?? i,
      };

      questionRecords.push(questionRecord);
    }

    if (questionRecords.length === 0) {
      console.warn(`No valid questions to save for verification: ${verificationId}`);
      return 0;
    }

    // Insert all questions in a single batch
    await db.insert(criticalQuestion).values(questionRecords);

    console.log(
      `Saved ${questionRecords.length} critical questions for verification: ${verificationId}`
    );

    return questionRecords.length;
  } catch (error) {
    console.error('Error saving critical questions:', error);

    // Check if it's a unique constraint violation
    if (
      error instanceof Error &&
      error.message.includes('uk_critical_questions_verification_order')
    ) {
      throw new Error(`Duplicate order index found for verification ${verificationId}`);
    }

    throw new Error(
      `Failed to save critical questions: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

/**
 * Retrieves critical questions for a verification
 * @param verificationId - The verification ID
 * @returns Promise with array of critical questions
 */
export async function getCriticalQuestions(verificationId: string) {
  try {
    const questions = await db
      .select()
      .from(criticalQuestion)
      .where(eq(criticalQuestion.verificationId, verificationId))
      .orderBy(criticalQuestion.orderIndex);

    console.log(`Retrieved ${questions.length} questions for verification: ${verificationId}`);

    return questions;
  } catch (error) {
    console.error('Error retrieving critical questions:', error);
    throw new Error(
      `Failed to retrieve critical questions: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

/**
 * Updates a specific critical question (when user edits it)
 * @param questionId - The question ID to update
 * @param newText - The new question text
 */
export async function updateCriticalQuestion(questionId: string, newText: string): Promise<void> {
  const trimmedText = newText.trim();

  // Validate length
  if (trimmedText.length < 50 || trimmedText.length > 5000) {
    throw new Error('Question text must be between 50 and 5000 characters');
  }

  try {
    await db
      .update(criticalQuestion)
      .set({
        questionText: trimmedText,
        isEdited: true,
      })
      .where(eq(criticalQuestion.id, questionId));

    console.log(`Updated critical question: ${questionId}`);
  } catch (error) {
    console.error('Error updating critical question:', error);
    throw new Error(
      `Failed to update critical question: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

/**
 * Deletes a critical question
 * @param questionId - The question ID to delete
 */
export async function deleteCriticalQuestion(questionId: string): Promise<void> {
  try {
    await db.delete(criticalQuestion).where(eq(criticalQuestion.id, questionId));

    console.log(`Deleted critical question: ${questionId}`);
  } catch (error) {
    console.error('Error deleting critical question:', error);
    throw new Error(
      `Failed to delete critical question: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

/**
 * Gets a single critical question by ID
 * @param questionId - The question ID
 * @returns Promise with the question or null if not found
 */
export async function getCriticalQuestionById(questionId: string) {
  try {
    const result = await db
      .select()
      .from(criticalQuestion)
      .where(eq(criticalQuestion.id, questionId))
      .limit(1);

    return result[0] || null;
  } catch (error) {
    console.error('Error getting critical question by ID:', error);
    throw new Error(
      `Failed to get critical question: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}
