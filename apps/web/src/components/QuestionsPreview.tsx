'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import QuestionsList from '@/components/QuestionsList';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/hooks/use-auth';
import { useI18n } from '@/hooks/use-i18n';
import type { Question } from '@/hooks/use-questions-editor';
import { orpc } from '@/utils/orpc';

type ExtendedQuestion = Question & { isActive?: boolean };

type GeneratedQuestion = {
  question_text: string;
  original_question: string;
  order_index: number;
  is_active?: boolean;
};

type PendingQuestionsData = {
  originalText: string;
  questions: GeneratedQuestion[];
};

export default function QuestionsReviewPage() {
  const router = useRouter();
  const urlParams = useParams();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { t } = useI18n();
  const queryClient = useQueryClient();

  // Get verification ID from URL or use temp ID
  const verificationId = (urlParams?.id as string) || 'temp-id';
  const isExistingVerification = verificationId !== 'temp-id';

  // Local state
  const [questionsForReview, setQuestionsForReview] = useState<ExtendedQuestion[]>([]);
  const [pendingData, setPendingData] = useState<PendingQuestionsData | null>(null);
  const [hasInitialized, setHasInitialized] = useState(false);

  // Auth guard
  useEffect(() => {
    if (!(authLoading || isAuthenticated)) {
      toast.error('Please log in to continue');
      router.push('/login');
    }
  }, [authLoading, isAuthenticated, router]);

  // Query for existing verification questions
  const {
    data: generatedQuestionsData,
    isLoading: isLoadingFromAPI,
    error: apiError,
    refetch: refetchQuestions,
  } = useQuery(
    orpc.getGeneratedQuestions.queryOptions({
      input: { verificationId },
      enabled: isExistingVerification && isAuthenticated,
      retry: 3,
      onError: (error: any) => {
        console.error('Failed to load questions:', error);
        toast.error(error.message || 'Failed to load questions');
      },
    })
  );

  // Initialize questions from API data
  useEffect(() => {
    if (generatedQuestionsData?.questions && !hasInitialized) {
      const questions: ExtendedQuestion[] = generatedQuestionsData.questions.map((q, index) => ({
        id: `api-${index}`,
        verificationId,
        questionText: q.question_text,
        originalQuestion: q.original_question,
        isEdited: false,
        isActive: q.is_active !== false,
        orderIndex: index,
        createdAt: new Date(),
      }));

      setQuestionsForReview(questions);
      setHasInitialized(true);
    }
  }, [generatedQuestionsData, verificationId, hasInitialized]);

  // Initialize questions from sessionStorage for new verifications
  useEffect(() => {
    if (!(isExistingVerification || hasInitialized || isLoadingFromAPI)) {
      const stored = sessionStorage.getItem('pendingQuestions');

      if (stored) {
        try {
          const parsed: PendingQuestionsData = JSON.parse(stored);
          setPendingData(parsed);

          const questions: ExtendedQuestion[] = parsed.questions.map((q, index) => ({
            id: `temp-${index}`,
            verificationId: 'temp-id',
            questionText: q.question_text,
            originalQuestion: q.original_question,
            isEdited: false,
            isActive: q.is_active !== false,
            orderIndex: index,
            createdAt: new Date(),
          }));

          setQuestionsForReview(questions);
          setHasInitialized(true);
        } catch (error) {
          console.error('Error parsing pending questions:', error);
          toast.error('Failed to load questions. Please try again.');
          router.push('/');
        }
      } else {
        toast.error('No questions found to review. Please start a new verification.');
        router.push('/');
      }
    }
  }, [isExistingVerification, hasInitialized, isLoadingFromAPI, router]);

  // oRPC mutation for existing verifications
  const confirmQuestionsORPC = useMutation(
    orpc.confirmQuestions.mutationOptions({
      onMutate: async (variables) => {
        // Cancel outgoing refetches
        await queryClient.cancelQueries({
          queryKey: orpc.getGeneratedQuestions.key({ verificationId: variables.verificationId }),
        });

        // Snapshot previous value
        const previousData = queryClient.getQueryData(
          orpc.getGeneratedQuestions.key({ verificationId: variables.verificationId })
        );

        // Optimistic update
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
        // Rollback optimistic update
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
      questions: ExtendedQuestion[];
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
            is_active: q.isActive,
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

  // Handle questions update
  const handleQuestionsUpdate = (updatedQuestions: ExtendedQuestion[]) => {
    setQuestionsForReview(updatedQuestions);
  };

  // Validate questions
  const validateQuestions = (questions: ExtendedQuestion[]): boolean => {
    if (questions.length === 0) {
      toast.error('No questions to confirm');
      return false;
    }

    // Check if at least one question is active
    const activeQuestions = questions.filter((q) => q.isActive !== false);
    if (activeQuestions.length === 0) {
      toast.error('At least one question must be active');
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

  // Handle confirmation
  const handleConfirmQuestions = () => {
    if (!validateQuestions(questionsForReview)) {
      return;
    }

    if (isExistingVerification) {
      // Use oRPC for existing verifications
      confirmQuestionsORPC.mutate({
        verificationId,
        questions: questionsForReview.map((q) => ({
          question_text: q.questionText,
          original_question: q.originalQuestion,
          order_index: q.orderIndex,
          is_active: q.isActive,
        })),
      });
    } else {
      if (!pendingData) {
        toast.error('Missing verification data. Please try again.');
        return;
      }

      confirmQuestionsLegacy.mutate({
        pendingData,
        questions: questionsForReview,
      });
    }
  };

  // Handle cancellation
  const handleCancel = () => {
    sessionStorage.removeItem('pendingQuestions');
    router.push('/');
  };

  // Loading states
  const isLoading = confirmQuestionsORPC.isPending || confirmQuestionsLegacy.isPending;

  // Calculate active questions for display
  const activeQuestionsCount = questionsForReview.filter((q) => q.isActive !== false).length;
  const totalQuestionsCount = questionsForReview.length;

  // Auth loading
  if (authLoading) {
    return <QuestionsReviewSkeleton />;
  }

  // Not authenticated
  if (!isAuthenticated) {
    return null;
  }

  // Loading initial data
  if (!hasInitialized && (isLoadingFromAPI || !isExistingVerification)) {
    return <QuestionsReviewSkeleton />;
  }

  if (apiError && isExistingVerification) {
    return (
      <ErrorState
        message={apiError.message || 'Failed to load questions from server'}
        onGoBack={() => router.push('/')}
        onRetry={() => refetchQuestions()}
        title="Error Loading Questions"
      />
    );
  }

  if (!questionsForReview.length && hasInitialized) {
    return (
      <ErrorState
        message="No questions were found to review. Please start a new verification."
        onGoBack={() => router.push('/')}
        showRetry={false}
        title="No Questions Available"
      />
    );
  }

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
                Review and modify the generated questions. Use the checkboxes to activate/deactivate
                questions.
                {activeQuestionsCount < totalQuestionsCount && (
                  <span className="ml-2 text-orange-600 text-sm">
                    ({activeQuestionsCount} of {totalQuestionsCount} questions are active)
                  </span>
                )}
              </p>
            </div>

            {/* Questions List */}
            <div>
              <QuestionsList
                onQuestionsUpdate={handleQuestionsUpdate}
                questions={questionsForReview}
                reviewMode={true}
                verificationId={verificationId}
              />
            </div>

            {/* Action Buttons */}
            <div className="flex justify-between border-t pt-6">
              <Button disabled={isLoading} onClick={handleCancel} variant="outline">
                {t('common.cancel') || 'Cancel'}
              </Button>

              <div className="flex items-center gap-4">
                {activeQuestionsCount === 0 && totalQuestionsCount > 0 && (
                  <p className="text-orange-600 text-sm">At least one question must be active</p>
                )}
                <Button
                  disabled={isLoading || activeQuestionsCount === 0}
                  onClick={handleConfirmQuestions}
                  size="lg"
                >
                  {isLoading
                    ? t('review.saving') || 'Saving...'
                    : t('review.confirm_save') || 'Confirm & Save Questions'}
                  {activeQuestionsCount > 0 && activeQuestionsCount < totalQuestionsCount && (
                    <span className="ml-2 text-xs opacity-75">({activeQuestionsCount} active)</span>
                  )}
                </Button>
              </div>
            </div>

            {/* Loading Overlay */}
            {isLoading && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80">
                <div className="rounded-lg bg-card p-6 shadow-lg">
                  <div className="flex items-center gap-3">
                    <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                    <span className="font-medium">
                      {isLoading ? 'Confirming questions...' : 'Loading...'}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}

// Skeleton loading component
function QuestionsReviewSkeleton() {
  return (
    <div className="min-h-screen bg-background p-4">
      <div className="mx-auto max-w-4xl">
        <Card className="rounded-2xl p-6">
          <div className="space-y-6">
            <div>
              <Skeleton className="mb-2 h-8 w-64" />
              <Skeleton className="h-4 w-96" />
            </div>

            <div className="rounded-lg bg-muted/30 p-4">
              <Skeleton className="mb-2 h-4 w-32" />
              <Skeleton className="mb-1 h-4 w-full" />
              <Skeleton className="mb-1 h-4 w-full" />
              <Skeleton className="h-4 w-full" />
            </div>

            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div className="rounded-lg border p-4" key={i}>
                  <div className="flex items-start gap-3">
                    <Skeleton className="h-5 w-5 rounded" />
                    <Skeleton className="mt-1 h-5 w-5 rounded" />
                    <div className="flex-1">
                      <Skeleton className="mb-2 h-4 w-full" />
                      <Skeleton className="h-4 w-3/4" />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-between border-t pt-6">
              <Skeleton className="h-10 w-20" />
              <Skeleton className="h-10 w-48" />
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

type ErrorStateProps = {
  title: string;
  message: string;
  onRetry?: () => void;
  onGoBack: () => void;
  showRetry?: boolean;
};

function ErrorState({ title, message, onRetry, onGoBack, showRetry = true }: ErrorStateProps) {
  return (
    <div className="min-h-screen bg-background p-3 sm:p-4 lg:p-6">
      <div className="mx-auto w-full max-w-2xl">
        <Card className="rounded-xl p-4 sm:rounded-2xl sm:p-6">
          <div className="space-y-4 text-center sm:space-y-6">
            <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-destructive/10 sm:h-12 sm:w-12">
              <svg
                className="h-5 w-5 text-destructive sm:h-6 sm:w-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                />
              </svg>
            </div>

            <div className="space-y-2">
              <h2 className="font-semibold text-destructive text-lg sm:text-xl">{title}</h2>
              <p className="mx-auto max-w-md text-muted-foreground text-sm sm:text-base">
                {message}
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
              <Button className="w-full sm:w-auto" onClick={onGoBack} variant="outline">
                Go Back
              </Button>
              {showRetry && onRetry && (
                <Button className="w-full sm:w-auto" onClick={onRetry}>
                  Try Again
                </Button>
              )}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
