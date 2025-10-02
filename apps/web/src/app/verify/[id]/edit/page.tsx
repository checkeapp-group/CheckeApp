'use client';

import { AlertCircle } from 'lucide-react';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import type { Verification } from '@/../../server/src/db/schema/schema';
import Loader from '@/components/loader';
import { Card } from '@/components/ui/card';
import VerificationFlow from '@/components/VerificationFlow';
import { useAppRouter } from '@/lib/router';
import { orpc } from '@/utils/orpc';

type VerificationData = Verification;

export default function VerificationEditPage() {
  const { id: verificationId } = useParams();
   const { navigate } = useAppRouter();

  const [verification, setVerification] = useState<VerificationData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const currentVerificationId = Array.isArray(verificationId)
      ? verificationId[0]
      : verificationId;

    if (!currentVerificationId) {
      setIsLoading(false);
      setError(new Error('Verification ID is missing.'));
      return;
    }

    const fetchVerification = async () => {
      try {
        setIsLoading(true);
        const result = await orpc.getVerificationDetails.call({
          verificationId: currentVerificationId,
        });
        const isEditable =
          result.status === 'processing_questions' || result.status === 'sources_ready';

        if (!isEditable) {
          navigate(`/verify/${currentVerificationId}/finalResult`);
          return;
        }
        setVerification(result);
      } catch (err) {
        setError(err as Error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchVerification();
  }, [verificationId, navigate]);

  if (isLoading) {
    return <Loader />;
  }

  if (error) {
    return (
      <div className="container mx-auto max-w-2xl px-4 py-12">
        <Card className="flex flex-col items-center p-8 text-center text-destructive">
          <AlertCircle className="mb-4 h-12 w-12" />
          <h2 className="mb-2 font-bold text-xl">Error Loading Verification</h2>
          <p>{error.message}</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto my-8 max-w-4xl rounded-lg bg-neutral/80 p-4 shadow-lg backdrop-blur-sm sm:p-6 lg:p-8">
      {verification ? <VerificationFlow verification={verification} /> : <Loader />}
    </div>
  );
}
