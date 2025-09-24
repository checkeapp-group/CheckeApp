'use client';

import { useMutation } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import QuestionsList from '@/components/QuestionsList';
import SourcesList from '@/components/SourcesList';
import Step from '@/components/Step';
import SubmittedTextDisplay from '@/components/ui/TextSubmittedDisplay';
import { useI18n } from '@/hooks/use-i18n';
import { useAppRouter } from '@/lib/router';
import { orpc } from '@/utils/orpc';

type VerificationFlowProps = {
  initialText?: string;
  verificationId?: string | null;
};

export default function VerificationFlow({
  initialText = '',
  verificationId: initialVerificationId = null,
}: VerificationFlowProps) {
  const { t } = useI18n();
  const { navigate } = useAppRouter();

  const [activeStep, setActiveStep] = useState(initialVerificationId ? 'step-2' : 'step-1');
  const [completedSteps, setCompletedSteps] = useState<string[]>(
    initialVerificationId ? ['step-1'] : []
  );
  const [verificationId, setVerificationId] = useState<string | null>(initialVerificationId);
  const [verificationText, setVerificationText] = useState<string>(initialText);

  useEffect(() => {
    if (initialVerificationId && initialText) {
      setVerificationId(initialVerificationId);
      setVerificationText(initialText);
      if (!completedSteps.includes('step-1')) {
        setCompletedSteps(['step-1']);
      }
      setActiveStep('step-2');
    }
  }, [initialVerificationId, initialText, completedSteps]);

  const searchSourcesMutation = useMutation({
    mutationFn: async ({ verificationId }: { verificationId: string }) => {
      return await orpc.confirmQuestionsAndSearchSources.call({ verificationId });
    },
    onSuccess: (result) => {
      toast.success(t('verification.sources_found', { count: result.sources_count || 0 }));
      setCompletedSteps((prev) => [...prev, 'step-2']);
      setActiveStep('step-3');
    },
    onError: (error: any) => {
      toast.error(error.message || t('verification.search_sources_error'));
    },
  });

  const continueToAnalysisMutation = useMutation({
    mutationFn: async ({ verificationId }: { verificationId: string }) => {
      return await orpc.continueToAnalysis.call({ verificationId });
    },
    onSuccess: () => {
      toast.success(t('verification.ready_for_analysis'));
      setCompletedSteps((prev) => [...prev, 'step-3']);
      setActiveStep('step-4');

      if (verificationId) {
        navigate(`/verify/${verificationId}/finalResult`);
      }
    },
    onError: (error: any) => {
      toast.error(error.message || t('verification.continue_error'));
    },
  });

  const handleQuestionsConfirmed = () => {
    if (verificationId) {
      searchSourcesMutation.mutate({ verificationId });
    }
  };

  const handleSourcesConfirmed = () => {
    if (verificationId) {
      continueToAnalysisMutation.mutate({ verificationId });
    }
  };

  return (
    <div className="w-full space-y-4">
      <Step
        description={t('verification.step1.description')}
        isCompleted={completedSteps.includes('step-1')}
        isDisabled={false}
        isOpen={activeStep === 'step-1'}
        stepNumber={1}
        title={t('verification.step1.title')}
      >
        <SubmittedTextDisplay text={verificationText} />
      </Step>

      <Step
        description={t('verification.step2.description')}
        isCompleted={completedSteps.includes('step-2')}
        isDisabled={!completedSteps.includes('step-1')}
        isOpen={activeStep === 'step-2'}
        stepNumber={2}
        title={t('verification.step2.title')}
      >
        {verificationId && (
          <QuestionsList
            isContinuing={searchSourcesMutation.isPending}
            isLocked={completedSteps.includes('step-2')}
            onComplete={handleQuestionsConfirmed}
            verificationId={verificationId}
          />
        )}
      </Step>

      <Step
        description={t('verification.step3.description')}
        isCompleted={completedSteps.includes('step-3')}
        isDisabled={!completedSteps.includes('step-2')}
        isOpen={activeStep === 'step-3'}
        stepNumber={3}
        title={t('verification.step3.title')}
      >
        {verificationId && (
          <SourcesList
            isContinuing={continueToAnalysisMutation.isPending}
            isLocked={completedSteps.includes('step-3')}
            onComplete={handleSourcesConfirmed}
            verificationId={verificationId}
          />
        )}
      </Step>
    </div>
  );
}
