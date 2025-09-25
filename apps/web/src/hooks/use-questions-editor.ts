'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';
import { toast } from 'sonner';
import type { Question } from '@/types/questions';
import { orpc } from '@/utils/orpc';

type UseQuestionsEditorProps = {
  verificationId: string;
};

export function useQuestionsEditor({ verificationId }: UseQuestionsEditorProps) {
  const queryClient = useQueryClient();

  const questionsQuery = useQuery(
    orpc.getVerificationQuestions.queryOptions({
      input: { verificationId },
      enabled: !!verificationId,
    })
  );

  const invalidateAndRefetch = () => {
    queryClient.invalidateQueries({
      queryKey: orpc.getVerificationQuestions.key({ input: { verificationId } }),
    });
  };

  const updateQuestionMutation = useMutation(
    orpc.updateQuestion.mutationOptions({
      onSuccess: () => {
        toast.success('Pregunta actualizada.');
        invalidateAndRefetch();
      },
      onError: (error: any) => {
        toast.error(`Error al actualizar: ${error.message}`);
        invalidateAndRefetch();
      },
    })
  );

  const deleteQuestionMutation = useMutation(
    orpc.deleteQuestion.mutationOptions({
      onSuccess: () => {
        toast.success('Pregunta eliminada.');
        invalidateAndRefetch();
      },
      onError: (error: any) => {
        toast.error(`Error al eliminar: ${error.message}`);
        invalidateAndRefetch();
      },
    })
  );

  const addQuestionMutation = useMutation(
    orpc.addQuestion.mutationOptions({
      onSuccess: () => {
        toast.success('Pregunta añadida.');
        invalidateAndRefetch();
      },
      onError: (error: any) => {
        toast.error(`Error al añadir: ${error.message}`);
      },
    })
  );

  const reorderQuestionsMutation = useMutation(
    orpc.reorderQuestions.mutationOptions({
      onSuccess: () => {
        toast.success('Orden de preguntas actualizado.');
        invalidateAndRefetch();
      },
      onError: (error: any) => {
        toast.error(`Error al reordenar: ${error.message}`);
        invalidateAndRefetch();
      },
    })
  );

  const updateQuestion = useCallback(
    (questionId: string, questionText: string) => {
      updateQuestionMutation.mutate({ verificationId, questionId, questionText });
    },
    [updateQuestionMutation, verificationId]
  );

  const deleteQuestion = useCallback(
    (questionId: string) => {
      deleteQuestionMutation.mutate({ questionId, verificationId });
    },
    [deleteQuestionMutation, verificationId]
  );

  const addQuestion = useCallback(
    (questionText: string) => {
      addQuestionMutation.mutate({ verificationId, questionText });
    },
    [addQuestionMutation, verificationId]
  );

  const reorderQuestions = useCallback(
    (newOrder: Question[]) => {
      const questionsData = newOrder.map((q, index) => ({ id: q.id, orderIndex: index }));
      reorderQuestionsMutation.mutate({ verificationId, questions: questionsData });
    },
    [reorderQuestionsMutation, verificationId]
  );

  const questions = questionsQuery.data || [];
  const canContinue =
    !questionsQuery.isLoading &&
    questions.length > 0 &&
    questions.every((q) => q.questionText.trim().length >= 5);

  return {
    questions,
    isLoading: questionsQuery.isLoading,
    error: questionsQuery.error,
    updateQuestion,
    deleteQuestion,
    addQuestion,
    reorderQuestions,
    canContinue,
    refetch: questionsQuery.refetch,
    pendingChanges:
      updateQuestionMutation.isPending ||
      deleteQuestionMutation.isPending ||
      addQuestionMutation.isPending ||
      reorderQuestionsMutation.isPending,
  };
}
