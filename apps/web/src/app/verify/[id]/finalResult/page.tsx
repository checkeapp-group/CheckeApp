"use client";

import { useQuery } from "@tanstack/react-query";
import { AlertCircle } from "lucide-react";
import { useParams } from "next/navigation";
import { useState } from "react";
import FinalVerificationLoader from "@/components/FinalVerificationLoader";
import GlobalLoader from "@/components/GlobalLoader";
import { Card } from "@/components/ui/card";
import VerificationResult from "@/components/VerificationResult";
import { useI18n } from "@/hooks/use-i18n";
import { usePageMetadata } from "@/hooks/use-page-metadata";
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
  const [showResult, setShowResult] = useState(false);

  const {
    data: statusData,
    isLoading: isLoadingStatus,
    error: statusError,
  } = useQuery({
    queryKey: ["verificationProgress", verificationId],
    queryFn: () => {
      if (!verificationId || typeof verificationId !== "string") {
        return null;
      }
      return orpc.getVerificationProgress.call({ verificationId });
    },
    enabled: !!verificationId && !showResult,
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

  const { data: verificationDetails, isLoading: isLoadingDetails } = useQuery({
    queryKey: ["verificationDetails", verificationId],
    queryFn: () => {
      if (!verificationId || typeof verificationId !== "string") {
        return null;
      }
      return orpc.getVerificationDetails.call({ verificationId });
    },
    enabled: !!verificationId,
  });

  const title =
    resultData?.finalResult?.metadata?.title ??
    resultData?.originalText ??
    t("result.untitled");
  const main_claim = resultData?.finalResult?.metadata?.main_claim;
  const verificationImageUrl = resultData?.finalResult?.imageUrl;

  usePageMetadata(
    title,
    main_claim || t("meta.verifyResult.description"),
    verificationImageUrl || undefined
  );

  if (statusError) {
    return <ErrorState errorMessage={statusError.message} />;
  }
  if (resultError) {
    return <ErrorState errorMessage={resultError.message} />;
  }
  if (statusData?.status === "error") {
    return <ErrorState errorMessage={t("finalResult.analysis_failed")} />;
  }
  if (showResult && resultData) {
    return <VerificationResult data={resultData} />;
  }

  if (statusData?.status === "completed") {
    if (resultData) {
      return <VerificationResult data={resultData} />;
    }
    return (
      <div className="container mx-auto flex min-h-[70vh] items-center justify-center">
        <GlobalLoader />
      </div>
    );
  }

  if (
    verificationId &&
    typeof verificationId === "string" &&
    !isLoadingStatus &&
    statusData?.status !== "completed"
  ) {
    const isProcessing =
      statusData?.status !== "completed" && statusData?.status !== "error";
    return (
      <div className="container mx-auto flex min-h-[70vh] items-center justify-center">
        <FinalVerificationLoader
          isProcessing={isProcessing}
          onComplete={() => setShowResult(true)}
          question={verificationDetails?.originalText || ""}
        />
      </div>
    );
  }

  return (
    <div className="container mx-auto flex min-h-[70vh] items-center justify-center">
      <GlobalLoader />
    </div>
  );
}
