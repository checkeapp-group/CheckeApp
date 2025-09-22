'use client';

import { useMutation } from '@tanstack/react-query';
import { useState } from 'react';
import { toast } from 'sonner';
import QuestionsList from '@/components/QuestionsList';
import SourcesList from '@/components/SourcesList';
import Step from '@/components/Step';
import TextInputForm from '@/components/TextInputForm';
import { useAuth } from '@/hooks/use-auth';
import { useAppRouter } from '@/lib/router';
import { orpc } from '@/utils/orpc';

export default function VerificationFlow() {
  const { isAuthenticated } = useAuth();

  const [activeStep, setActiveStep] = useState('step-1');
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);
  const [verificationId, setVerificationId] = useState<string | null>(null);
  const [verificationText, setVerificationText] = useState('');
  const { navigate } = useAppRouter();

  const searchSourcesMutation = useMutation(
    orpc.confirmQuestionsAndSearchSources.mutationOptions({
      onSuccess: (result) => {
        toast.success(`¡Éxito! Se encontraron ${result.sources_count || 0} fuentes.`);
        setCompletedSteps((prev) => [...prev, 'step-2']);
        setActiveStep('step-3');
      },
      onError: (error) => {
        toast.error(error.message || 'Ocurrió un error al buscar fuentes.');
      },
    })
  );

  const continueToAnalysisMutation = useMutation(
    orpc.continueToAnalysis.mutationOptions({
      onSuccess: () => {
        toast.success('¡Listo para el análisis final!');
        setCompletedSteps((prev) => [...prev, 'step-3']);
        setActiveStep('step-4');

        if (verificationId) {
          navigate(`/verify/${verificationId}/finalResult`);
        }
      },
      onError: (error) => {
        toast.error(error.message || 'Error al continuar');
      },
    })
  );

  const handleTextSubmitSuccess = (newVerificationId: string) => {
    setVerificationId(newVerificationId);
    setCompletedSteps((prev) => [...prev, 'step-1']);
    setActiveStep('step-2');
  };

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
        description="Ingresa el texto que deseas verificar para comenzar el proceso"
        isCompleted={completedSteps.includes('step-1')}
        isDisabled={false}
        isOpen={activeStep === 'step-1'}
        stepNumber={1}
        title="Paso 1: Envía tu texto a verificar"
      >
        <TextInputForm
          isAuthenticated={isAuthenticated}
          isLocked={completedSteps.includes('step-1') && activeStep !== 'step-1'}
          onSuccess={handleTextSubmitSuccess}
          onTextChange={setVerificationText}
          text={verificationText}
        />
      </Step>

      <Step
        description="Confirma o modifica las preguntas generadas automáticamente"
        isCompleted={completedSteps.includes('step-2')}
        isDisabled={!completedSteps.includes('step-1')}
        isOpen={activeStep === 'step-2'}
        stepNumber={2}
        title="Paso 2: Revisa y edita las preguntas"
      >
        {verificationId && (
          <QuestionsList
            isContinuing={searchSourcesMutation.isPending}
            isLocked={completedSteps.includes('step-2') && activeStep !== 'step-2'}
            onComplete={handleQuestionsConfirmed}
            verificationId={verificationId}
          />
        )}
      </Step>

      <Step
        description="Elige las fuentes más confiables para tu verificación"
        isCompleted={completedSteps.includes('step-3')}
        isDisabled={!completedSteps.includes('step-2')}
        isOpen={activeStep === 'step-3'}
        stepNumber={3}
        title="Paso 3: Selecciona las fuentes"
      >
        {verificationId && (
          <SourcesList
            isContinuing={continueToAnalysisMutation.isPending}
            isLocked={completedSteps.includes('step-3') && activeStep !== 'step-3'}
            onComplete={handleSourcesConfirmed}
            verificationId={verificationId}
          />
        )}
      </Step>
    </div>
  );
}
