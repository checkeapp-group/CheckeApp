export type GeneratedQuestion = {
  question_text: string;
  original_question: string;
  order_index: number;
}

export type GeneratedQuestionsResponse = {
  success: boolean;
  questions: GeneratedQuestion[];
  metadata?: {
    processing_time: string;
    confidence_score: number;
  };
}

export type PendingQuestionsData = {
  originalText: string;
  questions: GeneratedQuestion[];
}

export type Question = {
  id: string;
  verificationId: string;
  questionText: string;
  originalQuestion: string;
  isEdited: boolean;
  orderIndex: number;
  createdAt: Date;
}

export type ConfirmQuestionsRequest = {
  verificationId: string;
  questions: Array<{
    question_text: string;
    original_question: string;
    order_index: number;
  }>;
}

export type ConfirmQuestionsResponse = {
  success: boolean;
  message: string;
  verification_id?: string;
  questions_count?: number;
}

// Utility types
export type QuestionUpdate = Pick<Question, 'id' | 'questionText'>;
export type QuestionReorder = Pick<Question, 'id' | 'orderIndex'>;

// Validation helper
export const validateQuestion = (questionText: string): { isValid: boolean; error?: string } => {
  if (!questionText?.trim()) {
    return { isValid: false, error: 'Question text is required' };
  }

  if (questionText.trim().length < 5) {
    return { isValid: false, error: 'Question must be at least 5 characters' };
  }

  if (questionText.length > 200) {
    return { isValid: false, error: 'Question must be less than 200 characters' };
  }

  return { isValid: true };
};