import { createTanstackQueryUtils } from '@orpc/tanstack-query';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { type SetStateAction, useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { useDebounce } from 'use-debounce';
import { client } from '@/utils/orpc';

export const orpc = createTanstackQueryUtils(client);

export type Question = {
  isActive: boolean;
  id: string;
  verificationId: string;
  questionText: string;
  originalQuestion: string;
  isEdited: boolean;
  orderIndex: number;
  createdAt: Date;
};

type UseQuestionsEditorProps = {
  verificationId: string;
  reviewMode?: boolean;
};

export function useQuestionsEditor({
  verificationId,
  reviewMode = false,
}: UseQuestionsEditorProps) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [pendingChanges, setPendingChanges] = useState<Set<string>>(new Set());
  const [savingStates, setSavingStates] = useState<Record<string, boolean>>({});
  const queryClient = useQueryClient();

  // ✅ Query principal
  const questionsQuery = useQuery(
    orpc.getVerificationQuestions.queryOptions({
      input: { verificationId },
      enabled: !reviewMode,
      onSuccess: (data: SetStateAction<Question[]>) => setQuestions(data),
      onError: (error: any) => toast.error(error.message),
    })
  );

  const updateQuestionMutation = useMutation(
    orpc.updateQuestion.mutationOptions({
      onSuccess: (_, { questionId }) => {
        setSavingStates((prev) => ({ ...prev, [questionId]: false }));
        setPendingChanges((prev) => {
          const newSet = new Set(prev);
          newSet.delete(questionId);
          return newSet;
        });

        // ✅ Refetch usando queryKey de oRPC
        queryClient.invalidateQueries(
          orpc.getVerificationQuestions.queryKey({
            input: { verificationId },
          })
        );

        toast.success('Pregunta guardada automáticamente');
      },
      onError: (error: any) => {
        toast.error(`Error al guardar: ${error.message}`);
        queryClient.invalidateQueries(
          orpc.getVerificationQuestions.queryKey({
            input: { verificationId },
          })
        );
      },
    })
  );

  const deleteQuestionMutation = useMutation(
    orpc.deleteQuestion.mutationOptions({
      onMutate: ({ questionId }) => {
        setQuestions((prev) => prev.filter((q) => q.id !== questionId));
      },
      onSuccess: () => toast.success('Pregunta eliminada'),
      onError: (error: any) => {
        toast.error(`Error al eliminar: ${error.message}`);
        queryClient.invalidateQueries(
          orpc.getVerificationQuestions.queryKey({ input: { verificationId } })
        );
      },
    })
  );

  const addQuestionMutation = useMutation(
    orpc.addQuestion.mutationOptions({
      onSuccess: (data) => {
        const newQuestion = data.question || data;
        setQuestions((prev) => [...prev, newQuestion]);
        toast.success('Pregunta añadida');
      },
      onError: (error: any) => toast.error(`Error al añadir pregunta: ${error.message}`),
    })
  );

  const reorderQuestionsMutation = useMutation(
    orpc.reorderQuestions.mutationOptions({
      onSuccess: () => toast.success('Orden actualizado'),
      onError: (error: any) => {
        toast.error(`Error al reordenar: ${error.message}`);
        queryClient.invalidateQueries(
          orpc.getVerificationQuestions.queryKey({ input: { verificationId } })
        );
      },
    })
  );

  // Auto-save con debounce
  const [debouncedQuestions] = useDebounce(questions, 2000);

  useEffect(() => {
    if (pendingChanges.size > 0 && !reviewMode) {
      for (const questionId of pendingChanges) {
        const question = debouncedQuestions.find((q) => q.id === questionId);
        if (question) {
          updateQuestionMutation.mutate({
            verificationId,
            questionId,
            questionText: question.questionText,
          });
        }
      }
    }
  }, [debouncedQuestions, pendingChanges, reviewMode, updateQuestionMutation]);

  // Funciones auxiliares
  const updateQuestion = useCallback((questionId: string, questionText: string) => {
    setPendingChanges((prev) => new Set(prev).add(questionId));
    setQuestions((prev) => prev.map((q) => (q.id === questionId ? { ...q, questionText } : q)));
  }, []);

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
      setQuestions(newOrder);
      const questionsData = newOrder.map((q, index) => ({ id: q.id, orderIndex: index }));
      reorderQuestionsMutation.mutate({ verificationId, questions: questionsData });
    },
    [reorderQuestionsMutation, verificationId]
  );

  const canContinue =
    questions.length > 0 && questions.every((q) => q.questionText.trim().length >= 5);

  return {
    questions,
    isLoading: questionsQuery.isLoading,
    error: questionsQuery.error,
    updateQuestion,
    deleteQuestion,
    addQuestion,
    reorderQuestions,
    canContinue,
    savingStates,
    pendingChanges: pendingChanges.size > 0,
    refetch: questionsQuery.refetch,
  };
}
