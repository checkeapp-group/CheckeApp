'use client';

import { useQuery } from '@tanstack/react-query';
import { AlertCircle } from 'lucide-react';
import { useParams } from 'next/navigation';
import { toast } from 'sonner';
import Loader from '@/components/loader';
import { Card } from '@/components/ui/Card';
import { useI18n } from '@/hooks/use-i18n';
import { orpc } from '@/utils/orpc';

function LoadingState({ status }: { status?: string }) {
  const { t } = useI18n();
  return (
    <Card className="p-8 text-center">
      <h1 className="mb-4 font-bold text-2xl">{t('finalResult.analyzing_sources')}</h1>
      <p className="mb-6 text-muted-foreground">{t('finalResult.processing_description')}</p>
      <Loader />
      <p className="mt-4 font-semibold text-sm capitalize">
        {t('finalResult.current_status')}: {status?.replace('_', ' ') || t('finalResult.starting')}
      </p>
    </Card>
  );
}

function ResultDisplay({ result }: { result: any }) {
  const labels = (result.labelsJson as string[]) || [];
  const citations = (result.citationsJson as Record<string, { url: string; source: string }>) || {};
  const relatedQuestions = (result.answersJson as Record<string, string>) || {};
  const { t } = useI18n();
  
  return (
    <div className="space-y-8">
      <Card className="fade-in animate-in p-6 duration-500">
        <h1 className="mb-2 font-bold text-3xl">
          {result.question || t('finalResult.final_verdict')}
        </h1>
        <div className="mb-4 flex flex-wrap gap-2">
          {labels.map((label) => (
            <span
              className="rounded-full bg-primary/10 px-3 py-1 font-semibold text-primary text-xs"
              key={label}
            >
              {label}
            </span>
          ))}
        </div>
        <p className="whitespace-pre-wrap text-muted-foreground leading-relaxed">
          {result.finalText}
        </p>
      </Card>

      {Object.keys(relatedQuestions).length > 0 && (
        <Card className="fade-in animate-in p-6 delay-100 duration-500">
          <h2 className="mb-4 font-bold text-2xl">{t('finalResult.related_questions')}</h2>
          <div className="space-y-4">
            {Object.entries(relatedQuestions).map(([question, answer]) => (
              <div key={question}>
                <h3 className="font-semibold">{question}</h3>
                <p className="text-muted-foreground text-sm">{answer}</p>
              </div>
            ))}
          </div>
        </Card>
      )}

      {Object.keys(citations).length > 0 && (
        <Card className="fade-in animate-in p-6 delay-200 duration-500">
          <h2 className="mb-4 font-bold text-2xl">{t('finalResult.cited_sources')}</h2>
          <ul className="list-disc space-y-2 pl-5">
            {Object.values(citations).map((cite) => (
              <li key={cite.url}>
                <a
                  className="text-blue-600 hover:underline"
                  href={cite.url}
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  {cite.source || cite.url}
                </a>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  );
}

export default function FinalResultPage() {
  const { id: verificationId } = useParams();
  const { t } = useI18n();

  // Estado de verificación con polling
  const { data: statusData, error: statusError } = useQuery({
    queryKey: ['verificationStatus', verificationId],
    queryFn: () =>
      orpc.getVerificationStatus.call({
        verificationId: verificationId as string,
      }),
    enabled: !!verificationId,
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      return status === 'completed' || status === 'error' ? false : 3000;
    },
    onSuccess: (data) => {
      if (data?.status === 'completed') toast.success(t('finalResult.analysis_completed'));
      if (data?.status === 'error') toast.error(t('finalResult.analysis_failed'));
    },
  });

  // Resultado final (solo cuando completed)
  const {
    data: resultData,
    isLoading: resultIsLoading,
    error: resultError,
  } = useQuery({
    queryKey: ['finalResult', verificationId],
    queryFn: async () => {
      if (!verificationId) return null;
      return await orpc.getFinalResult.call({
        verificationId: verificationId as string,
      });
    },
    enabled: statusData?.status === 'completed',
  });

  const isPolling = statusData?.status !== 'completed' && statusData?.status !== 'error';
  const isLoading = isPolling || resultIsLoading;

  if (statusError || resultError) {
    return (
      <div className="container mx-auto max-w-2xl py-12">
        <Card className="flex flex-col items-center p-8 text-center text-destructive">
          <AlertCircle className="mb-4 h-12 w-12" />
          <h2 className="mb-2 font-bold text-xl">{t('finalResult.process_error')}</h2>
          <p>{(statusError || resultError)?.message}</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-3xl py-12">
      {isLoading ? (
        <LoadingState status={statusData?.status} />
      ) : resultData ? (
        <ResultDisplay result={resultData} />
      ) : (
        <LoadingState status={statusData?.status} />
      )}
    </div>
  );
}
