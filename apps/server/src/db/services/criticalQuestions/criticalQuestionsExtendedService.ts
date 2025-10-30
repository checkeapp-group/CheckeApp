import { eq, inArray, max, sql } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../..';
import { criticalQuestion, type NewCriticalQuestion } from '../../schema/schema';
import { updateVerificationStatus } from '../verifications/verificationService';
import {
  deleteCriticalQuestion,
  getCriticalQuestionById,
  getCriticalQuestions,
  saveCriticalQuestions,
  updateCriticalQuestion,
} from './criticalQuestionService';

export type QuestionUpdateData = {
  questionText: string;
};

export type QuestionCreateData = {
  verificationId: string;
  questionText: string;
};

export type QuestionReorderItem = {
  id: string;
  orderIndex: number;
};

/**
 * Validate that a question belongs to a specific verification
 */
export async function validateQuestionOwnership(
  questionId: string,
  verificationId: string
): Promise<boolean> {
  try {
    const question = await getCriticalQuestionById(questionId);
    return question?.verificationId === verificationId;
  } catch (error) {
    console.error('Error validating question ownership:', error);
    return false;
  }
}

/**
 * Updates a question with additional validations
 */
export async function updateQuestionWithValidation(
  questionId: string,
  verificationId: string,
  data: QuestionUpdateData
): Promise<void> {
  const isOwner = await validateQuestionOwnership(questionId, verificationId);
  if (!isOwner) {
    throw new Error('La pregunta no pertenece a esta verificación');
  }

  // Validar longitud específica para edición (200 chars máx)
  const trimmedText = data.questionText.trim();
  if (trimmedText.length < 5 || trimmedText.length > 200) {
    throw new Error('La pregunta debe tener entre 5 y 200 caracteres');
  }

  await updateCriticalQuestion(questionId, trimmedText);
}

/**
 * Deletes a question with ownership validation
 */
export async function deleteQuestionWithValidation(
  questionId: string,
  verificationId: string
): Promise<void> {
  const isOwner = await validateQuestionOwnership(questionId, verificationId);
  if (!isOwner) {
    throw new Error('La pregunta no pertenece a esta verificación');
  }

  await deleteCriticalQuestion(questionId);
}

export async function createNewQuestion(data: QuestionCreateData): Promise<any> {
  const trimmedText = data.questionText.trim();

  if (trimmedText.length < 5 || trimmedText.length > 200) {
    throw new Error('La pregunta debe tener entre 5 y 200 caracteres');
  }

  try {
    const maxOrderResult = await db
      .select({ maxValue: max(criticalQuestion.orderIndex) })
      .from(criticalQuestion)
      .where(eq(criticalQuestion.verificationId, data.verificationId));

    const maxOrder = maxOrderResult[0]?.maxValue;
    const nextOrderIndex = maxOrder === null || maxOrder === undefined ? 0 : maxOrder + 1;
    // Crear nueva pregunta
    const newQuestionRecord: NewCriticalQuestion = {
      id: uuidv4(),
      verificationId: data.verificationId,
      questionText: trimmedText,
      originalQuestion: trimmedText,
      isEdited: false,
      orderIndex: nextOrderIndex,
    };

    await db.insert(criticalQuestion).values(newQuestionRecord);

    console.log(`Nueva pregunta creada: ${newQuestionRecord.id}`);

    // Retornar la pregunta creada
    return await getCriticalQuestionById(newQuestionRecord.id);
  } catch (error) {
    console.error('Error creating new question:', error);
    throw new Error('Error al crear la nueva pregunta');
  }
}

/**
 * Reorders questions for a specific verification
 */
export async function reorderVerificationQuestions(
  verificationId: string,
  questionsOrder: QuestionReorderItem[]
): Promise<void> {
  try {
    const existingQuestions = await getCriticalQuestions(verificationId);
    const existingIds = new Set(existingQuestions.map((q) => q.id));
    const questionIdsToUpdate = questionsOrder.map((item) => item.id);

    for (const item of questionsOrder) {
      if (!existingIds.has(item.id)) {
        throw new Error(`La pregunta ${item.id} no pertenece a esta verificación`);
      }
    }

    await db.transaction(async (tx) => {
      const offset = existingQuestions.length + 100;
      if (questionIdsToUpdate.length > 0) {
        await tx
          .update(criticalQuestion)
          .set({ orderIndex: sql`order_index + ${offset}` })
          .where(inArray(criticalQuestion.id, questionIdsToUpdate));
      }

      for (const item of questionsOrder) {
        await tx
          .update(criticalQuestion)
          .set({ orderIndex: item.orderIndex })
          .where(eq(criticalQuestion.id, item.id));
      }
    });

    console.log(
      `Reordenadas ${questionsOrder.length} preguntas para verificación: ${verificationId}`
    );
  } catch (error) {
    console.error('Error reordering questions:', error);
    throw new Error('Error al reordenar las preguntas');
  }
}

/**
 * Validates if a verification can proceed to the next step
 */
export async function validateVerificationReadyToContinue(
  verificationId: string
): Promise<{ canContinue: boolean; message: string }> {
  try {
    const questions = await getCriticalQuestions(verificationId);

    if (questions.length === 0) {
      return {
        canContinue: false,
        message: 'Debe haber al menos una pregunta para continuar',
      };
    }

    const invalidQuestions = questions.filter(
      (q) => !q.questionText || q.questionText.trim().length < 5
    );

    if (invalidQuestions.length > 0) {
      return {
        canContinue: false,
        message: 'Todas las preguntas deben tener al menos 5 caracteres',
      };
    }

    return {
      canContinue: true,
      message: 'Verificación lista para continuar',
    };
  } catch (error) {
    console.error('Error validating verification ready state:', error);
    return {
      canContinue: false,
      message: 'Error al validar el estado de la verificación',
    };
  }
}
export async function confirmQuestions(
  verificationId: string,
  questions: Array<{
    question_text: string;
    original_question: string;
    order_index: number;
  }>
): Promise<void> {
  try {
    // Save the questions to the database
    await saveCriticalQuestions(verificationId, questions);

    // Update the verification status to 'sources_ready'
    await updateVerificationStatus(verificationId, 'sources_ready');

    console.log(
      `Confirmed and saved ${questions.length} questions for verification: ${verificationId}`
    );
  } catch (error) {
    console.error('Error confirming questions:', error);
    throw new Error('Failed to confirm questions');
  }
}
