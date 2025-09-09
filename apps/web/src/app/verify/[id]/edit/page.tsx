'use client';

import { AlertCircle, ArrowLeft } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import QuestionsList from '@/components/QuestionsList';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/hooks/use-auth';
import { useI18n } from '@/hooks/use-i18n';
import { useQuestionsEditor } from '@/hooks/use-questions-editor';
import { orpc } from '@/utils/orpc';

type PageProps = {
  params: {
    id: string;
  };
}

export default function EditQuestionsPage({ params }: PageProps) {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { t } = useI18n();
  const { id: verificationId } = useParams();

  const [pageError, setPageError] = useState<string | null>(null);
  const [isValidating, setIsValidating] = useState(true);
  const [hasPermissions, setHasPermissions] = useState(false);
  const [isContinuing, setIsContinuing] = useState(false);

  const {
    questions,
    isLoading: questionsLoading,
    canContinue,
    pendingChanges,
  } = useQuestionsEditor({
    verificationId: verificationId as string,
  });

  const permissionsQuery = orpc.checkVerificationPermissions?.useQuery(
    { verificationId: verificationId as string },
    {
      enabled: isAuthenticated && !!verificationId,
      onSuccess: (data) => {
        setHasPermissions(data.canEdit);
        setIsValidating(false);
        setPageError(null);
      },
      onError: (error) => {
        setHasPermissions(false);
        setIsValidating(false);
        if (error.message.includes('403') || error.message.includes('Forbidden')) {
          setPageError(
            t('questions_edit.no_permissions') ||
              'You do not have permission to edit this verification'
          );
        } else if (error.message.includes('404')) {
          setPageError(t('questions_edit.not_found') || 'Verification not found');
        } else {
          setPageError(error.message);
        }
      },
    }
  );

  useEffect(() => {
    if (!authLoading) {
      if (!(isAuthenticated && user)) {
        router.push('/login');
        return;
      }
    }
  }, [authLoading, isAuthenticated, user, router]);

  const handleGoBack = () => {
    if (pendingChanges) {
      if (
        confirm(
          t('questions_edit.unsaved_changes') ||
            'You have unsaved changes. Are you sure you want to leave?'
        )
      ) {
        router.back();
      }
    } else {
      router.back();
    }
  };

  const handleContinue = async () => {
    if (!canContinue) {
      toast.error(
        t('questions_edit.cannot_continue') ||
          'Please ensure all questions are valid before continuing'
      );
      return;
    }

    if (pendingChanges) {
      toast.error(t('questions_edit.save_first') || 'Please wait for all changes to be saved');
      return;
    }

    setIsContinuing(true);

    try {
      const result = await orpc.continueVerification?.mutate?.({
        verificationId: verificationId as string,
      });


      if (result?.nextStep) {
        router.push(`/verify/${verificationId}/${result.nextStep}`);
      } else {
        router.push(`/verify/${verificationId}`);
      }

      toast.success(t('questions_edit.continued') || 'Questions saved successfully');
    } catch (error) {
      console.error('Error continuing verification:', error);
      toast.error(
        error instanceof Error
          ? error.message
          : t('questions_edit.continue_error') || 'Error continuing verification'
      );
    } finally {
      setIsContinuing(false);
    }
  };

  const handleRetry = () => {
    setPageError(null);
    setIsValidating(true);
    permissionsQuery.refetch();
  };

  if (authLoading || isValidating) {
    return <EditPageSkeleton />;
  }

  if (!isAuthenticated) {
    return null;
  }

  if (pageError) {
    return (
      <ErrorState
        message={pageError}
        onRetry={handleRetry}
        showRetry={!(pageError.includes('permission') || pageError.includes('not found'))}
      />
    );
  }

  if (!hasPermissions) {
    return (
      <ErrorState
        message={
          t('questions_edit.access_denied') ||
          'Access denied. You do not have permission to edit this verification.'
        }
        onRetry={() => router.push('/dashboard')}
        retryText={t('common.go_back') || 'Go Back'}
        showRetry={false}
      />
    );
  }

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      {/* Header */}
      <div className="mb-6 flex items-center gap-4">
        <Button
          className="flex items-center gap-2"
          disabled={isContinuing}
          onClick={handleGoBack}
          size="sm"
          variant="ghost"
        >
          <ArrowLeft className="h-4 w-4" />
          {t('common.back') || 'Back'}
        </Button>
        <div>
          <h1 className="font-bold text-2xl">{t('questions_edit.title') || 'Edit Questions'}</h1>
          <p className="text-muted-foreground">
            {t('questions_edit.subtitle') ||
              'Customize the questions for your verification process'}
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {t('questions_edit.questions_title') || 'Verification Questions'}
              {pendingChanges && (
                <span className="font-normal text-orange-500 text-sm">
                  ({t('questions_edit.saving') || 'Saving...'})
                </span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <QuestionsList verificationId={verificationId as string} />
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex justify-between">
          <div className="flex items-center gap-2 text-muted-foreground text-sm">
            {questions.length > 0 && (
              <span>
                {questions.length} {questions.length === 1 ? 'question' : 'questions'}
                {!canContinue && ' (some questions need attention)'}
              </span>
            )}
          </div>

          <div className="flex gap-4">
            <Button disabled={isContinuing} onClick={handleGoBack} variant="outline">
              {t('common.cancel') || 'Cancel'}
            </Button>
            <Button
              disabled={!canContinue || pendingChanges || isContinuing || questionsLoading}
              loading={isContinuing}
              onClick={handleContinue}
            >
              {isContinuing
                ? t('questions_edit.continuing') || 'Continuing...'
                : t('questions_edit.continue') || 'Continue'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function EditPageSkeleton() {
  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <div className="mb-6 flex items-center gap-4">
        <Skeleton className="h-9 w-20" />
        <div>
          <Skeleton className="mb-2 h-8 w-64" />
          <Skeleton className="h-4 w-96" />
        </div>
      </div>

      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div className="rounded-lg border p-4" key={i}>
                <Skeleton className="mb-2 h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function ErrorState({
  message,
  onRetry,
  showRetry = true,
  retryText,
}: {
  message: string;
  onRetry: () => void;
  showRetry?: boolean;
  retryText?: string;
}) {
  const { t } = useI18n();

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <AlertCircle className="mb-4 h-12 w-12 text-destructive" />
          <h2 className="mb-2 font-semibold text-lg">{t('common.error') || 'Error'}</h2>
          <p className="mb-4 max-w-md text-muted-foreground">{message}</p>
          <Button onClick={onRetry}>
            {retryText ||
              (showRetry ? t('common.retry') || 'Retry' : t('common.go_back') || 'Go Back')}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
