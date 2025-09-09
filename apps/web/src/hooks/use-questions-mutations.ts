import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import type { Question } from '@/hooks/use-questions-editor';
import { orpc } from '@/utils/orpc';

type GeneratedQuestion = {
  question_text: string;
  original_question: string;
  order_index: number;
};

type PendingQuestionsData = {
  originalText: string;
  questions: GeneratedQuestion[];
};

type UseQuestionsMutationsProps = {
  verificationId: string;
  isExistingVerification?: boolean;
};

export function useQuestionsMutations({
  verificationId,
  isExistingVerification = false,
}: UseQuestionsMutationsProps) {
  const router = useRouter();
  const queryClient = useQueryClient();

  // oRPC mutation for existing verifications
  const confirmQuestionsORPC = useMutation(
    orpc.confirmQuestions.mutationOptions({
      onMutate: async (variables) => {
        await queryClient.cancelQueries({
          queryKey: orpc.getGeneratedQuestions.key({ verificationId: variables.verificationId }),
        });

        const previousData = queryClient.getQueryData(
          orpc.getGeneratedQuestions.key({ verificationId: variables.verificationId })
        );

        queryClient.setQueryData(
          orpc.getGeneratedQuestions.key({ verificationId: variables.verificationId }),
          { questions: variables.questions }
        );

        return { previousData };
      },
      onSuccess: (data, variables) => {
        toast.success('Questions confirmed successfully!');
        queryClient.invalidateQueries({
          queryKey: orpc.getGeneratedQuestions.key({ verificationId: variables.verificationId }),
        });
        router.push(`/verify/${variables.verificationId}/edit`);
      },
      onError: (error, variables, context) => {
        if (context?.previousData) {
          queryClient.setQueryData(
            orpc.getGeneratedQuestions.key({ verificationId: variables.verificationId }),
            context.previousData
          );
        }

        console.error('Failed to confirm questions:', error);
        toast.error(error.message || 'Failed to confirm questions');
      },
    })
  );

  // Legacy HTTP mutation for new verifications
  const confirmQuestionsLegacy = useMutation({
    mutationFn: async (data: {
      pendingData: PendingQuestionsData;
      questions: Question[];
    }): Promise<any> => {
      const response = await fetch('/api/verify/start', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: data.pendingData.originalText,
          confirmedQuestions: data.questions.map((q) => ({
            question_text: q.questionText,
            original_question: q.originalQuestion,
            order_index: q.orderIndex,
          })),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      return response.json();
    },
    onSuccess: (result) => {
      if (result.success) {
        toast.success('Verification started successfully!');
        sessionStorage.removeItem('pendingQuestions');
        router.push(`/verify/${result.verification_id}/edit`);
      } else {
        throw new Error(result.message || 'Failed to start verification');
      }
    },
    onError: (error) => {
      console.error('Failed to start verification:', error);
      toast.error(error.message || 'Failed to start verification');
    },
  });

  // Validation helper
  const validateQuestions = (questions: Question[]): boolean => {
    if (questions.length === 0) {
      toast.error('No questions to confirm');
      return false;
    }

    const invalidQuestions = questions.filter(
      (q) =>
        !q.questionText?.trim() || q.questionText.trim().length < 5 || q.questionText.length > 200
    );

    if (invalidQuestions.length > 0) {
      toast.error(
        'Some questions are invalid. Please check all questions are between 5-200 characters.'
      );
      return false;
    }

    return true;
  };

  // Main confirm function
  const confirmQuestions = (questions: Question[], pendingData?: PendingQuestionsData) => {
    if (!validateQuestions(questions)) {
      return;
    }

    if (isExistingVerification) {
      confirmQuestionsORPC.mutate({
        verificationId,
        questions: questions.map((q) => ({
          question_text: q.questionText,
          original_question: q.originalQuestion,
          order_index: q.orderIndex,
        })),
      });
    } else {
      if (!pendingData) {
        toast.error('Missing verification data. Please try again.');
        return;
      }

      confirmQuestionsLegacy.mutate({
        pendingData,
        questions,
      });
    }
  };

  return {
    confirmQuestions,
    validateQuestions,
    isLoading: confirmQuestionsORPC.isPending || confirmQuestionsLegacy.isPending,
    error: confirmQuestionsORPC.error || confirmQuestionsLegacy.error,
    orpcMutation: confirmQuestionsORPC,
    legacyMutation: confirmQuestionsLegacy,
  };
}
