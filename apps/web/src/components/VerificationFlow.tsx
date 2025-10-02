'use client';

import { useMutation } from '@tanstack/react-query';
import { useState } from 'react';
import { toast } from 'sonner';
import type { Verification } from '@/../../server/src/db/schema/schema';
import QuestionsList from '@/components/QuestionsList';
import SourcesList from '@/components/SourcesList';
import Step from '@/components/Step';
import SubmittedTextDisplay from '@/components/ui/TextSubmittedDisplay';
import { useI18n } from '@/hooks/use-i18n';
import { useAppRouter } from '@/lib/router';
import { orpc } from '@/utils/orpc';

const determineInitialState = (status: Verification['status']) => {
  const state = { activeStep: 'step-1', completedSteps: [] as string[] };

  switch (status) {
    case 'processing_questions':
      state.activeStep = 'step-2';
      state.completedSteps = ['step-1'];
      break;
    case 'sources_ready':
      state.activeStep = 'step-3';
      state.completedSteps = ['step-1', 'step-2'];
      break;
    case 'generating_summary':
    case 'completed':
    case 'error':
      state.activeStep = 'step-4';
      state.completedSteps = ['step-1', 'step-2', 'step-3'];
      break;
    default:
      state.activeStep = 'step-1';
      state.completedSteps = [];
      break;
  }
  return state;
};

type VerificationFlowProps = {
  verification: Verification;
};

export default function VerificationFlow({ verification }: VerificationFlowProps) {
  const { t } = useI18n();
  const { navigate } = useAppRouter();

  const initialState = determineInitialState(verification.status);

  const [activeStep, setActiveStep] = useState(initialState.activeStep);
  const [completedSteps, setCompletedSteps] = useState<string[]>(initialState.completedSteps);

  const { id: verificationId, originalText: verificationText } = verification;

  const searchSourcesMutation = useMutation({
    mutationFn: async () => {
      return await orpc.confirmQuestionsAndSearchSources.call({ verificationId });
    },
    onSuccess: (result) => {
      toast.success(t('verification.sources_found', { count: result.sources_count || 0 }));
      setCompletedSteps((prev) => [...new Set([...prev, 'step-2'])]);
      setActiveStep('step-3');
    },
    onError: (error: any) => {
      toast.error(error.message || t('verification.search_sources_error'));
    },
  });

  const continueToAnalysisMutation = useMutation({
    mutationFn: async () => {
      return await orpc.continueToAnalysis.call({ verificationId });
    },
    onSuccess: () => {
      toast.success(t('verification.ready_for_analysis'));
      setCompletedSteps((prev) => [...new Set([...prev, 'step-3'])]);
      setActiveStep('step-4');
      navigate(`/verify/${verificationId}/finalResult`);
    },
    onError: (error: any) => {
      toast.error(error.message || t('verification.continue_error'));
    },
  });

  const handleQuestionsConfirmed = () => {
    searchSourcesMutation.mutate();
  };

  const handleSourcesConfirmed = () => {
    continueToAnalysisMutation.mutate();
  };

  return (
    <div className="w-full space-y-4 ">
      <Step
        description={t('verification.step1.description')}
        isCompleted={completedSteps.includes('step-1')}
        isDisabled={false}
        isOpen={activeStep === 'step-1'}
        onSelect={() => setActiveStep('step-1')}
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
        onSelect={() => setActiveStep('step-2')}
        stepNumber={2}
        title={t('verification.step2.title')}
      >
        <QuestionsList
          isContinuing={searchSourcesMutation.isPending}
          isLocked={completedSteps.includes('step-2')}
          onComplete={handleQuestionsConfirmed}
          verificationId={verificationId}
        />
      </Step>

      <Step
        description={t('verification.step3.description')}
        isCompleted={completedSteps.includes('step-3')}
        isDisabled={!completedSteps.includes('step-2')}
        isOpen={activeStep === 'step-3'}
        onSelect={() => setActiveStep('step-3')}
        stepNumber={3}
        title={t('verification.step3.title')}
      >
        <SourcesList
          isContinuing={continueToAnalysisMutation.isPending}
          isLocked={completedSteps.includes('step-3')}
          onComplete={handleSourcesConfirmed}
          verificationId={verificationId}
        />
      </Step>
    </div>
  );
}
