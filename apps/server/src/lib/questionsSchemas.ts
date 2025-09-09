import { z } from 'zod';

// Schema para obtener preguntas
export const getQuestionsSchema = z.object({
  verificationId: z.string().uuid('ID de verificación inválido'),
});

// Schema para actualizar pregunta
export const updateQuestionSchema = z.object({
  questionId: z.string().uuid('ID de pregunta inválido'),
  verificationId: z.string().uuid('ID de verificación inválido'),
  questionText: z
    .string()
    .min(5, 'La pregunta debe tener al menos 5 caracteres')
    .max(200, 'La pregunta no puede exceder 200 caracteres')
    .trim(),
});

// Schema para eliminar pregunta
export const deleteQuestionSchema = z.object({
  questionId: z.string().uuid('ID de pregunta inválido'),
  verificationId: z.string().uuid('ID de verificación inválido'),
});

// Schema para añadir pregunta
export const addQuestionSchema = z.object({
  verificationId: z.string().uuid('ID de verificación inválido'),
  questionText: z
    .string()
    .min(5, 'La pregunta debe tener al menos 5 caracteres')
    .max(200, 'La pregunta no puede exceder 200 caracteres')
    .trim(),
});

// Schema para reordenar preguntas
export const reorderQuestionsSchema = z.object({
  verificationId: z.string().uuid('ID de verificación inválido'),
  questions: z
    .array(
      z.object({
        id: z.string().uuid('ID de pregunta inválido'),
        orderIndex: z.number().min(0, 'El índice de orden debe ser mayor o igual a 0'),
      })
    )
    .min(1, 'Debe haber al menos una pregunta para reordenar'),
});

// Schema para continuar verificación
export const continueVerificationSchema = z.object({
  verificationId: z.string().uuid('ID de verificación inválido'),
});

// Tipos TypeScript derivados
export type GetQuestionsInput = z.infer<typeof getQuestionsSchema>;
export type UpdateQuestionInput = z.infer<typeof updateQuestionSchema>;
export type DeleteQuestionInput = z.infer<typeof deleteQuestionSchema>;
export type AddQuestionInput = z.infer<typeof addQuestionSchema>;
export type ReorderQuestionsInput = z.infer<typeof reorderQuestionsSchema>;
export type ContinueVerificationInput = z.infer<typeof continueVerificationSchema>;
