'use client';

import { useQuery } from '@tanstack/react-query';
import { AlertCircle } from 'lucide-react';
import { useParams } from 'next/navigation';
import Loader from '@/components/loader';
import { Card } from '@/components/ui/card';
import VerificationResult from '@/components/VerificationResult';
import { useI18n } from '@/hooks/use-i18n';
import { orpc } from '@/utils/orpc';

function LoadingState({ status }: { status?: string }) {
  const { t } = useI18n();
  return (
    <Card className="bg-card p-4 text-center sm:p-6 md:p-8">
      <h1 className="mb-3 font-bold text-xl sm:mb-4 sm:text-2xl">
        {t('finalResult.analyzing_sources')}
      </h1>
      <p className="mb-4 text-muted-foreground text-sm sm:mb-6 sm:text-base">
        {t('finalResult.processing_description')}
      </p>
      <Loader />
      <p className="mt-3 font-semibold text-xs capitalize sm:mt-4 sm:text-sm">
        {t('finalResult.current_status')}: {status?.replace('_', ' ') || t('finalResult.starting')}
      </p>
    </Card>
  );
}

export default function FinalResultPage() {
  const { id: verificationId } = useParams();
  const { t } = useI18n();

  const { data, isLoading, error, isSuccess } = useQuery({
    queryKey: ['verificationResult', verificationId],
    queryFn: () => {
      if (!verificationId) {
        return null;
      }
      return orpc.getVerificationResultData.call({
        verificationId: verificationId as string,
      });
    },
    enabled: !!verificationId,
    refetchInterval: (query) => (query.state.data?.finalResult ? false : 3000),
  });

  if (isLoading || (isSuccess && !data?.finalResult)) {
    return (
      <div className="container mx-auto max-w-4xl px-4 py-8 sm:py-12">
        <LoadingState status={data?.status} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto max-w-2xl px-4 py-8 sm:py-12">
        <Card className="flex flex-col items-center p-6 text-center text-destructive sm:p-8">
          <AlertCircle className="mb-3 h-10 w-10 sm:mb-4 sm:h-12 sm:w-12" />
          <h2 className="mb-2 font-bold text-lg sm:text-xl">{t('finalResult.process_error')}</h2>
          <p className="text-sm sm:text-base">{error.message}</p>
        </Card>
      </div>
    );
  }

  if (!data) {
    return <p>No data found for this verification.</p>;
  }

  return <VerificationResult data={data} />;
}
