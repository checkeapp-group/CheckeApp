"use client";

import { useQuery } from "@tanstack/react-query";
import { AlertCircle } from "lucide-react";
import { useParams } from "next/navigation";
import { Card } from "@/components/ui/card";
import VerificationResult from "@/components/VerificationResult";
import { useGlobalLoader } from "@/hooks/use-global-loader";
import { useI18n } from "@/hooks/use-i18n";
import { orpc } from "@/utils/orpc";

function ErrorState({ errorMessage }: { errorMessage: string }) {
  const { t } = useI18n();
  return (
    <Card className="flex flex-col items-center p-6 text-center text-destructive sm:p-8">
      <AlertCircle className="mb-3 h-10 w-10 sm:mb-4 sm:h-12 sm:w-12" />
      <h2 className="mb-2 font-bold text-lg sm:text-xl">
        {t("finalResult.process_error")}
      </h2>
      <p className="text-sm sm:text-base">{errorMessage}</p>
    </Card>
  );
}

export default function FinalResultPage() {
  const { id: verificationId } = useParams();
  const { t } = useI18n();

  const { data: statusData, error: statusError } = useQuery({
    queryKey: ["verificationProgress", verificationId],
    queryFn: () => {
      if (!verificationId || typeof verificationId !== "string") {
        return null;
      }
      return orpc.getVerificationProgress.call({ verificationId });
    },
    enabled: !!verificationId,
    refetchInterval: (query) => {
      const data = query.state.data;
      if (data?.status === "completed" || data?.status === "error") {
        return false;
      }
      return 3000;
    },
    retry: 1,
  });

  const {
    data: resultData,
    isLoading: isLoadingResult,
    error: resultError,
  } = useQuery({
    queryKey: ["verificationResult", verificationId],
    queryFn: () => {
      if (!verificationId || typeof verificationId !== "string") {
        return null;
      }
      return orpc.getVerificationResultData.call({ verificationId });
    },
    enabled: statusData?.status === "completed",
    retry: false,
  });

  const { data: verificationDetails } = useQuery({
    queryKey: ["verificationDetails", verificationId],
    queryFn: () =>
      orpc.getVerificationDetails.call({
        verificationId: verificationId as string,
      }),
    enabled: !!verificationId && !resultData,
  });

  //useGlobalLoader(
  // !resultData || isLoadingResult || !statusData,
  // "final-result-loader"
  //);

  useGlobalLoader(isLoadingResult || !resultData, "final-result-loader");

  if (statusError) {
    return (
      <div className="container mx-auto max-w-2xl px-4 py-8 sm:py-12">
        <ErrorState errorMessage={statusError.message} />
      </div>
    );
  }

  if (resultError) {
    return (
      <div className="container mx-auto max-w-2xl px-4 py-8 sm:py-12">
        <ErrorState errorMessage={resultError.message} />
      </div>
    );
  }

  if (statusData?.status === "error") {
    return (
      <div className="container mx-auto max-w-2xl px-4 py-8 sm:py-12">
        <ErrorState errorMessage={t("finalResult.analysis_failed")} />
      </div>
    );
  }

  if (resultData) {
    return <VerificationResult data={resultData} />;
  }
}
