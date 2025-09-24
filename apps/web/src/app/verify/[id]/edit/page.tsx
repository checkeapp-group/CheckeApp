'use client';

import { AlertCircle } from 'lucide-react';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import Loader from '@/components/loader';
import { Card } from '@/components/ui/Card';
import VerificationFlow from '@/components/VerificationFlow';
import { orpc } from '@/utils/orpc';

type VerificationData = {
  id: string;
  originalText: string;
};

export default function VerificationEditPage() {
  const { id: verificationId } = useParams();

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
        const storedText = sessionStorage.getItem(`verification_text_${currentVerificationId}`);

        if (storedText) {
          setVerification({
            id: currentVerificationId,
            originalText: storedText,
          });
        } else {
          const result = await orpc.getVerificationDetails.call({
            verificationId: currentVerificationId,
          });
          setVerification({ ...result, originalText: result.originalText });
        }
      } catch (err) {
        setError(err as Error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchVerification();
  }, [verificationId]);

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
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      {verification && (
        <VerificationFlow
          initialText={verification.originalText}
          verificationId={verification.id}
        />
      )}
    </div>
  );
}
