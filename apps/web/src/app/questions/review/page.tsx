'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import QuestionsList from '@/components/QuestionsList';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useAuth } from '@/hooks/use-auth';
import { useI18n } from '@/hooks/use-i18n';
import type { Question } from '@/hooks/use-questions-editor';
import { orpc } from '@/utils/orpc';

type PendingQuestions = {
  originalText: string;
  questions: Array<{
    question_text: string;
    original_question: string;
    order_index: number;
  }>;
};

export default function QuestionsReviewPage() {
  const router = useRouter();
  const params = useParams();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { t } = useI18n();
  const queryClient = useQueryClient();
  const [pendingQuestions, setPendingQuestions] = useState<PendingQuestions | null>(null);
  const [questionsForReview, setQuestionsForReview] = useState<Question[]>([]);

  // Extract verification ID from URL params if available, otherwise use temp-id
  const verificationId = (params?.id as string) || 'temp-id';

  // Auth guard
  useEffect(() => {
    if (!(authLoading || isAuthenticated)) {
      router.push('/login');
    }
  }, [authLoading, isAuthenticated, router]);

  // Query to get generated questions (when we have a real verification ID)
  const {
    data: generatedQuestionsData,
    isLoading: isLoadingQuestions,
    error: questionsError,
  } = useQuery(
    orpc.getGeneratedQuestions.queryOptions({
      input: { verificationId },
      enabled: !!verificationId && verificationId !== 'temp-id' && isAuthenticated,
    })
  );

  // Load questions from sessionStorage or from API
  useEffect(() => {
    // First try to load from generated questions API if we have a real verification ID
    if (generatedQuestionsData?.questions) {
      const questions: Question[] = generatedQuestionsData.questions.map((q, index) => ({
        id: `api-${index}`,
        verificationId,
        questionText: q.question_text,
        originalQuestion: q.original_question,
        isEdited: false,
        orderIndex: index,
        createdAt: new Date(),
      }));
      setQuestionsForReview(questions);
      return;
    }

    // Fallback to sessionStorage for temp workflow
    const stored = sessionStorage.getItem('pendingQuestions');

    if (stored) {
      try {
        const parsed: PendingQuestions = JSON.parse(stored);
        setPendingQuestions(parsed);

        const questions: Question[] = parsed.questions.map((q, index) => ({
          id: `temp-${index}`,
          verificationId: 'temp-id',
          questionText: q.question_text,
          originalQuestion: q.original_question,
          isEdited: false,
          orderIndex: index,
          createdAt: new Date(),
        }));

        setQuestionsForReview(questions);
      } catch (error) {
        console.error('Error parsing pending questions:', error);
        toast.error('Failed to load questions. Please try again.');
        router.push('/');
      }
    } else if (!isLoadingQuestions && verificationId === 'temp-id') {
      toast.error('No questions to review. Please start a new verification.');
      router.push('/');
    }
  }, [generatedQuestionsData, router, isLoadingQuestions, verificationId]);

  // Mutation to confirm questions using oRPC
  const confirmQuestionsMutation = useMutation(
    orpc.confirmQuestions.mutationOptions({
      onMutate: async (variables) => {
        return { previousData: null };
      },
      onSuccess: (data, variables) => {
        toast.success(t('textInput.verification_started') || 'Questions confirmed successfully!');

        queryClient.invalidateQueries({
          queryKey: orpc.getGeneratedQuestions.key({ verificationId: variables.verificationId }),
        });

        sessionStorage.removeItem('pendingQuestions');
        router.push(`/verify/${variables.verificationId}/edit`);
      },
      onError: (error, variables, context) => {
        toast.error(error.message || 'Failed to confirm questions');
        console.error('Error confirming questions:', error);
      },
    })
  );

  const handleConfirmQuestions = () => {
    if (!questionsForReview.length) return;

    if (verificationId !== 'temp-id') {
      confirmQuestionsMutation.mutate({
        verificationId,
        questions: questionsForReview.map((q) => ({
          question_text: q.questionText,
          original_question: q.originalQuestion,
          order_index: q.orderIndex,
        })),
      });
    } else {
      handleConfirmQuestionsLegacy();
    }
  };

  const handleConfirmQuestionsLegacy = async () => {
    if (!pendingQuestions) return;

    try {
      const response = await fetch('/api/verify/start', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: pendingQuestions.originalText,
          confirmedQuestions: questionsForReview.map((q) => ({
            question_text: q.questionText,
            original_question: q.originalQuestion,
            order_index: q.orderIndex,
          })),
        }),
      });

      const result = await response.json();

      if (result.success) {
        toast.success(t('textInput.verification_started') || 'Verification started successfully!');
        sessionStorage.removeItem('pendingQuestions');
        router.push(`/verify/${result.verification_id}/edit`);
      } else {
        toast.error(result.message || 'Failed to start verification');
      }
    } catch (error) {
      console.error('Error confirming questions:', error);
      toast.error('Network error. Please try again.');
    }
  };

  const handleCancel = () => {
    sessionStorage.removeItem('pendingQuestions');
    router.push('/');
  };

  const updateQuestionsForReview = (updatedQuestions: Question[]) => {
    setQuestionsForReview(updatedQuestions);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background p-4">
        <div className="mx-auto max-w-4xl">
          <div className="py-8 text-center">Loading authentication...</div>
        </div>
      </div>
    );
  }

  if (!pendingQuestions) {
    return (
      <div className="min-h-screen bg-background p-4">
        <div className="mx-auto max-w-4xl">
          <div className="py-8 text-center">
            <p>Loading questions...</p>
            <p className="mt-2 text-muted-foreground text-sm">
              If this persists, please go back and try again.
            </p>
          </div>
        </div>
      </div>
    );
  }

  console.log('🚀 About to render page with:');
  console.log('- pendingQuestions:', pendingQuestions);
  console.log('- questionsForReview:', questionsForReview);
  console.log('- questionsForReview.length:', questionsForReview.length);

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="mx-auto max-w-4xl">
        <Card className="rounded-2xl p-6">
          <div className="space-y-6">
            {/* Header */}
            <div>
              <h1 className="mb-2 font-bold text-2xl">
                {t('review.title') || 'Review Generated Questions'}
              </h1>
              <p className="text-muted-foreground">
                {t('review.description') ||
                  'Review, edit, delete, or reorder the questions before saving them to your verification.'}
              </p>
            </div>

            {/* Original Text Preview */}
            <div className="rounded-lg bg-muted/30 p-4">
              <h3 className="mb-2 font-medium text-muted-foreground text-sm">Original Text:</h3>
              <p className="line-clamp-3 text-sm">{pendingQuestions.originalText}</p>
            </div>

            {/* Questions List - using existing QuestionsList component in review mode */}
            <div>
              {/* Debug info */}
              <div className="mb-4 rounded bg-gray-100 p-2 text-xs">
                <p>Questions loaded: {questionsForReview.length}</p>
                <p>Review mode: true</p>
                {questionsForReview.length > 0 && (
                  <p>First question: {questionsForReview[0].questionText}</p>
                )}
              </div>

              <QuestionsList
                onQuestionsUpdate={updateQuestionsForReview}
                questions={questionsForReview}
                reviewMode={true}
                verificationId="temp-id"
              />
            </div>

            {/* Actions */}
            <div className="flex justify-between border-t pt-6">
              <Button disabled={isLoading} onClick={handleCancel} variant="outline">
                {t('common.cancel') || 'Cancel'}
              </Button>

              <Button
                disabled={isLoading || questionsForReview.length === 0}
                onClick={handleConfirmQuestions}
                size="lg"
              >
                {isLoading
                  ? t('review.saving') || 'Saving...'
                  : t('review.confirm_save') || 'Confirm & Save Questions'}
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
