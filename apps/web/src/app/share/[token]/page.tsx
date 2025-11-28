"use client";

import { useQuery } from "@tanstack/react-query";
import { AlertCircle } from "lucide-react";
import { useParams } from "next/navigation";
import { Card } from "@/components/ui/card";
import VerificationResult from "@/components/VerificationResult";
import { useGlobalLoader } from "@/hooks/use-global-loader";
import { useI18n } from "@/hooks/use-i18n";
import { usePageMetadata } from "@/hooks/use-page-metadata";
import { orpc } from "@/utils/orpc";

export default function SharePage() {
  const { t } = useI18n();
  const { token: shareToken } = useParams();

  const { data, isLoading, error } = useQuery({
    queryKey: ["sharedResult", shareToken],
    queryFn: () => {
      if (!shareToken || typeof shareToken !== "string") {
        return null;
      }
      return orpc.getSharedResult.call({
        shareToken,
      });
    },
    enabled: !!shareToken,
    retry: 1,
  });

  useGlobalLoader(isLoading, "share-page");

  // Set page metadata with verification data
  const title =
    data?.finalResult?.metadata?.title ??
    data?.originalText ??
    t("meta.share.title");
  const description =
    data?.finalResult?.metadata?.main_claim ??
    t("meta.share.description");
  const verificationImageUrl = data?.finalResult?.imageUrl;

  usePageMetadata(
    title,
    description,
    verificationImageUrl || undefined
  );

  if (error) {
    return (
      <div className="container mx-auto max-w-2xl px-4 py-12">
        <Card className="flex flex-col items-center p-8 text-center text-destructive">
          <AlertCircle className="mb-4 h-12 w-12" />
          <h2 className="mb-2 font-bold text-xl">
            {t("error.couldNotLoadResult")}
          </h2>
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
