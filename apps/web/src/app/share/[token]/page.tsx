'use client';

import { useQuery } from '@tanstack/react-query';
import { AlertCircle } from 'lucide-react';
import { useParams } from 'next/navigation';
import { Card } from '@/components/ui/card';
import VerificationResult from '@/components/VerificationResult';
import { useGlobalLoader } from '@/hooks/use-global-loader';
import { orpc } from '@/utils/orpc';

export default function SharePage() {
  const { token: shareToken } = useParams();

  const { data, isLoading, error } = useQuery({
    queryKey: ['sharedResult', shareToken],
    queryFn: () => {
      if (!shareToken || typeof shareToken !== 'string'){
        return null;
      }
      return orpc.getSharedResult.call({
        shareToken,
      });
    },
    enabled: !!shareToken,
    retry: 1,
  });

  useGlobalLoader(isLoading, 'share-page');

  if (error) {
    return (
      <div className="container mx-auto max-w-2xl px-4 py-12">
        <Card className="flex flex-col items-center p-8 text-center text-destructive">
          <AlertCircle className="mb-4 h-12 w-12" />
          <h2 className="mb-2 font-bold text-xl">Could Not Load Result</h2>
          <p>{error.message}</p>
        </Card>
      </div>
    );
  }

  if (data) {
    return <VerificationResult data={data} />;
  }

  return null;
}