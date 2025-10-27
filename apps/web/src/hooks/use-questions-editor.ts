'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { useGlobalLoader } from '@/hooks/use-global-loader';
import type { Question } from '@/types/questions';
import { orpc } from '@/utils/orpc';

type UseQuestionsEditorProps = {
  verificationId: string;
};

export function useQuestionsEditor({ verificationId }: UseQuestionsEditorProps) {
  const queryClient = useQueryClient();
  const queryKey = orpc.getVerificationQuestions.key({ input: { verificationId } });
  const [retryCount, setRetryCount] = useState(0);

  const questionsQuery = useQuery(
    orpc.getVerificationQuestions.queryOptions({
      input: { verificationId },
      enabled: !!verificationId,
      refetchInterval: (query) => {
        if (query.state.data?.length || query.state.error || retryCount >= 2) {
          return false;
        }
        return 2000;
      },
      onSuccess: (data) => {
        if (data.length > 0) {
          setRetryCount(3);
        } else {
          setRetryCount((c) => c + 1);
        }
      },
    })
  );

  const updateQuestionMutation = useMutation({
    mutationFn: (variables: { questionId: string; questionText: string }) =>
      orpc.updateQuestion.call({ ...variables, verificationId }),
    onMutate: async (variables) => {
      await queryClient.cancelQueries({ queryKey });
      const previousQuestions = queryClient.getQueryData<Question[]>(queryKey);
      queryClient.setQueryData<Question[]>(
        queryKey,
        (oldData) =>
          oldData?.map((q) =>
            q.id === variables.questionId
              ? { ...q, questionText: variables.questionText, isEdited: true }
              : q
          ) || []
      );
      return { previousQuestions };
    },
    onError: (err: Error, variables, context) => {
      toast.error(`Error al actualizar: ${err.message}`);
      if (context?.previousQuestions) {
        queryClient.setQueryData(queryKey, context.previousQuestions);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey });
    },
    onSuccess: () => {
      toast.success('Pregunta actualizada.');
    },
  });

  const deleteQuestionMutation = useMutation({
    mutationFn: (variables: { questionId: string }) =>
      orpc.deleteQuestion.call({ ...variables, verificationId }),
    onMutate: async (variables) => {
      await queryClient.cancelQueries({ queryKey });
      const previousQuestions = queryClient.getQueryData<Question[]>(queryKey);
      queryClient.setQueryData<Question[]>(
        queryKey,
        (oldData) => oldData?.filter((q) => q.id !== variables.questionId) || []
      );
      return { previousQuestions };
    },
    onError: (err: Error, variables, context) => {
      toast.error(`Error al eliminar: ${err.message}`);
      if (context?.previousQuestions) {
        queryClient.setQueryData(queryKey, context.previousQuestions);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey });
    },
    onSuccess: () => {
      toast.success('Pregunta eliminada.');
    },
  });

  const addQuestionMutation = useMutation({
    mutationFn: (variables: { questionText: string }) =>
      orpc.addQuestion.call({ ...variables, verificationId }),
    onMutate: async (variables) => {
      await queryClient.cancelQueries({ queryKey });
      const previousQuestions = queryClient.getQueryData<Question[]>(queryKey);
      queryClient.setQueryData<Question[]>(queryKey, (oldData = []) => {
        const optimisticQuestion: Question = {
          id: `temp-${Date.now()}`,
          verificationId,
          questionText: variables.questionText,
          originalQuestion: variables.questionText,
          isEdited: false,
          orderIndex: oldData.length,
          createdAt: new Date(),
        };
        return [...oldData, optimisticQuestion];
      });
      return { previousQuestions };
    },
    onError: (err: Error, variables, context) => {
      toast.error(`Error al añadir: ${err.message}`);
      if (context?.previousQuestions) {
        queryClient.setQueryData(queryKey, context.previousQuestions);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey });
    },
    onSuccess: () => {
      toast.success('Pregunta añadida.');
    },
  });

  const reorderQuestionsMutation = useMutation({
    mutationFn: (variables: { questions: { id: string; orderIndex: number }[] }) =>
      orpc.reorderQuestions.call({ ...variables, verificationId }),
    onMutate: async (variables) => {
      await queryClient.cancelQueries({ queryKey });
      const previousQuestions = queryClient.getQueryData<Question[]>(queryKey);
      queryClient.setQueryData<Question[]>(queryKey, (oldData) => {
        if (!oldData) return [];
        const newOrderMap = new Map(variables.questions.map((q) => [q.id, q.orderIndex]));
        return oldData
          .map((q) => ({ ...q, orderIndex: newOrderMap.get(q.id) ?? q.orderIndex }))
          .sort((a, b) => a.orderIndex - b.orderIndex);
      });
      return { previousQuestions };
    },
    onError: (err: Error, variables, context) => {
      toast.error(`Error al reordenar: ${err.message}`);
      if (context?.previousQuestions) {
        queryClient.setQueryData(queryKey, context.previousQuestions);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });

  const updateQuestion = useCallback(
    (questionId: string, questionText: string) => {
      updateQuestionMutation.mutate({ questionId, questionText });
    },
    [updateQuestionMutation]
  );

  const deleteQuestion = useCallback(
    (questionId: string) => {
      deleteQuestionMutation.mutate({ questionId });
    },
    [deleteQuestionMutation]
  );

  const addQuestion = useCallback(
    (questionText: string) => {
      addQuestionMutation.mutate({ questionText });
    },
    [addQuestionMutation]
  );

  const reorderQuestions = useCallback(
    (newOrder: Question[]) => {
      const questionsData = newOrder.map((q, index) => ({ id: q.id, orderIndex: index }));
      reorderQuestionsMutation.mutate({ questions: questionsData });
    },
    [reorderQuestionsMutation]
  );

  const questions = useMemo(() => questionsQuery.data || [], [questionsQuery.data]);

  const canContinue =
    !questionsQuery.isLoading &&
    questions.length > 0 &&
    questions.every((q) => q.questionText.trim().length >= 5);

  const isMutating =
    updateQuestionMutation.isPending ||
    deleteQuestionMutation.isPending ||
    addQuestionMutation.isPending ||
    reorderQuestionsMutation.isPending;
  useGlobalLoader(questionsQuery.isLoading, 'questions-initial-load');
  useGlobalLoader(isMutating, 'questions-mutation');

  return {
    questions,
    isLoading: questionsQuery.isLoading,
    isMutating,
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
