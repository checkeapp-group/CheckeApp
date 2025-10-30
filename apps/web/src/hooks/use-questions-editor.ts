'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { useGlobalLoader } from '@/hooks/use-global-loader';
import type { Question } from '@/types/questions';
import { orpc } from '@/utils/orpc';

type UseQuestionsEditorProps = {
  verificationId: string;
};

const POLLING_TIMEOUT = Number(process.env.EXTERNAL_API_TIMEOUT) || 60000;

type UseQuestionsEditorReturn = {
  questions: Question[];
  isLoading: boolean;
  isPollingForQuestions: boolean;
  isMutating: boolean;
  error: Error | null;
  hasTimedOut: boolean;
  updateQuestion: (questionId: string, questionText: string) => void;
  deleteQuestion: (questionId: string) => void;
  addQuestion: (questionText: string) => void;
  reorderQuestions: (newOrder: Question[]) => void;
  canContinue: boolean;
  refetch: () => void;
  pendingChanges: boolean;
};

export function useQuestionsEditor({ verificationId }: UseQuestionsEditorProps): UseQuestionsEditorReturn {
  const queryClient = useQueryClient();
  const queryKey = orpc.getVerificationQuestions.key({ input: { verificationId } });
  const [retryCount, setRetryCount] = useState(0);
  const [pollingStartTime, setPollingStartTime] = useState<number | null>(null);
  const [hasTimedOut, setHasTimedOut] = useState(false);

  const questionsQuery = useQuery(
    orpc.getVerificationQuestions.queryOptions({
      input: { verificationId },
      enabled: !!verificationId,
      refetchInterval: (query: { state: { data?: Question[]; error: any } }) => {
        const hasData = query.state.data && query.state.data.length > 0;
        const hasError = query.state.error;
        const maxRetriesReached = retryCount >= 60;

        if (hasData || hasError || maxRetriesReached || hasTimedOut) {
          return false;
        }
        return Number(process.env.RETRY_DELAY) || 1000;
      },
    })
  );

  useEffect(() => {
    const data = questionsQuery.data as Question[] | undefined;
    const shouldStartPolling =
      !pollingStartTime &&
      (!data || data.length === 0) &&
      !hasTimedOut &&
      !questionsQuery.error &&
      (questionsQuery.isLoading || questionsQuery.isFetching);

    if (shouldStartPolling) {
      setPollingStartTime(Date.now());
    }
  }, [pollingStartTime, questionsQuery.data, hasTimedOut, questionsQuery.error, questionsQuery.isLoading, questionsQuery.isFetching]);

  useEffect(() => {
    if (!pollingStartTime || hasTimedOut) {
      return;
    }

    const checkTimeout = () => {
      const elapsed = Date.now() - pollingStartTime;
      const data = questionsQuery.data as Question[] | undefined;
      if (
        elapsed >= POLLING_TIMEOUT &&
        (!data || data.length === 0)
      ) {
        setHasTimedOut(true);
        toast.error(
          'Tiempo de espera agotado al generar preguntas. Por favor, inténtalo de nuevo.'
        );
      }
    };

    const timeoutId = setTimeout(checkTimeout, POLLING_TIMEOUT);
    return () => clearTimeout(timeoutId);
  }, [pollingStartTime, hasTimedOut, questionsQuery.data]);

  // Actualizar retry count
  useEffect(() => {
    const data = questionsQuery.data as Question[] | undefined;
    if (data && data.length > 0) {
      setRetryCount(30);
      setPollingStartTime(null);
    } else if (questionsQuery.isFetching) {
      setRetryCount((c) => c + 1);
    }
  }, [questionsQuery.data, questionsQuery.isFetching]);

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

  const questions = useMemo(() => (questionsQuery.data as Question[] | undefined) || [], [questionsQuery.data]);

  const isPollingForQuestions =
    pollingStartTime !== null &&
    questions.length === 0 &&
    !hasTimedOut &&
    !questionsQuery.error;

  const canContinue =
    !questionsQuery.isLoading &&
    questions.length > 0 &&
    questions.every((q: Question) => q.questionText.trim().length >= 5);

  const isMutating =
    updateQuestionMutation.isPending ||
    deleteQuestionMutation.isPending ||
    addQuestionMutation.isPending ||
    reorderQuestionsMutation.isPending;

  useGlobalLoader(isMutating, 'questions-mutation');

  return {
    questions,
    isLoading: questionsQuery.isLoading,
    isPollingForQuestions,
    isMutating,
    error: questionsQuery.error,
    hasTimedOut,
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
