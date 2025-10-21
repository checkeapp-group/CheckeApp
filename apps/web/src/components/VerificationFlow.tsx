"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { fa } from "zod/v4/locales";
import type { Verification } from "@/../../server/src/db/schema/schema";
import QuestionsList from "@/components/QuestionsList";
import SourcesList from "@/components/SourcesList";
import Step from "@/components/Step";
import { Modal } from "@/components/ui/Modal";
import SubmittedTextDisplay from "@/components/ui/TextSubmittedDisplay";
import { useI18n } from "@/hooks/use-i18n";
import { useAppRouter } from "@/lib/router";
import { orpc, queryClient } from "@/utils/orpc";
import { Button } from "./ui/button";

const determineInitialState = (status: Verification["status"]) => {
  const state = { activeStep: "step-1", completedSteps: [] as string[] };
  switch (status) {
    case "processing_questions":
      state.activeStep = "step-2";
      state.completedSteps = ["step-1"];
      break;
    case "sources_ready":
      state.activeStep = "step-3";
      state.completedSteps = ["step-1", "step-2"];
      break;
    case "generating_summary":
    case "completed":
    case "error":
      state.activeStep = "step-4";
      state.completedSteps = ["step-1", "step-2", "step-3"];
      break;
    default:
      break;
  }
  return state;
};

type VerificationFlowProps = {
  verification: Verification;
};

export default function VerificationFlow({
  verification,
}: VerificationFlowProps) {
  const { t } = useI18n();
  const { navigate } = useAppRouter();

  const initialState = determineInitialState(verification.status);
  const [activeStep, setActiveStep] = useState(initialState.activeStep);
  const [completedSteps, setCompletedSteps] = useState<string[]>(
    initialState.completedSteps
  );
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [pollingJobId, setPollingJobId] = useState<string | null>(null);

  const { id: verificationId, originalText: verificationText } = verification;

  const { data: jobResult, isLoading: isPolling } = useQuery({
    queryKey: ["jobResult", pollingJobId],
    queryFn: () => orpc.getJobResult.call({ jobId: pollingJobId! }),
    enabled: !!pollingJobId,
    refetchInterval: (query) =>
      query.state.data?.status === "completed" ? false : 3000,
    retry: false,
  });

  const deleteVerificationMutation = useMutation({
    mutationFn: () => orpc.deleteVerification.call({ verificationId }),
    onSuccess: () => {
      toast.success(t("verification.deleted_success"));
      queryClient.invalidateQueries({ queryKey: orpc.getVerifications.key() });
      queryClient.invalidateQueries({
        queryKey: orpc.getVerificationsHome.key(),
      });
      navigate("/user-verifications");
    },
    onError: (error) => {
      toast.error(error.message || t("verification.deleted_error"));
    },
  });

  const saveSourcesMutation = useMutation({
    mutationFn: (sources: any[]) =>
      orpc.saveSearchedSources.call({ verificationId, sources }),
    onSuccess: () => {
      toast.success(
        t("verification.sources_found", {
          count: jobResult?.result?.sources?.length || 0,
        })
      );
      setCompletedSteps((prev) => [...new Set([...prev, "step-2"])]);
      setActiveStep("step-3");
      setPollingJobId(null);
      queryClient.invalidateQueries({
        queryKey: orpc.getSources.key({ input: { verificationId } }),
      });
    },
    onError: (error) => {
      toast.error(error.message || "Error al guardar las fuentes.");
      setPollingJobId(null);
    },
  });

  const searchSourcesMutation = useMutation({
    mutationFn: async () =>
      await orpc.confirmQuestionsAndSearchSources.call({ verificationId }),
    onSuccess: (result) => {
      setPollingJobId(result.jobId);
    },
    onError: (error) => {
      toast.error(error.message || t("verification.search_sources_error"));
    },
  });

  const continueToAnalysisMutation = useMutation({
    mutationFn: async () =>
      await orpc.continueToAnalysis.call({ verificationId }),
    onSuccess: () => {
      toast.success(t("verification.ready_for_analysis"));
      setCompletedSteps((prev) => [...new Set([...prev, "step-3"])]);
      setActiveStep("step-4");
      navigate(`/verify/${verificationId}/finalResult`);
    },
    onError: (error) => {
      toast.error(error.message || t("verification.continue_error"));
    },
  });

  useEffect(() => {
    if (jobResult?.status === "completed") {
      setPollingJobId(null);
      const sourcesFromApi = jobResult.result?.sources;
      if (sourcesFromApi && Array.isArray(sourcesFromApi)) {
        const formattedSources = sourcesFromApi.map((source) => ({
          url: source.link,
          title: source.title,
          summary: source.snippet,
          domain: source.base_url,
          favicon: source.favicon,
          isSelected: false,
        }));

        saveSourcesMutation.mutate(formattedSources);
      } else {
        toast.error("La búsqueda de fuentes no produjo resultados.");
        setPollingJobId(null);
      }
    } else if (
      jobResult?.status === "failed" ||
      jobResult?.status === "error"
    ) {
      toast.error("El proceso de búsqueda de fuentes ha fallado.");
      setPollingJobId(null);
    }
  }, [jobResult, saveSourcesMutation]);

  const handleDeleteVerification = () => {
    deleteVerificationMutation.mutate();
    setIsDeleteModalOpen(false);
  };

  const handleQuestionsConfirmed = () => {
    searchSourcesMutation.mutate();
  };

  const handleSourcesConfirmed = () => {
    continueToAnalysisMutation.mutate();
  };

  const isSearchingSources = searchSourcesMutation.isPending || isPolling;

  return (
    <>
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title={t("verification.delete_modal.title")}
      >
        {" "}
        <div className="space-y-4">
          {" "}
          <p className="text-muted-foreground">
            {t("verification.delete_modal.message")}{" "}
          </p>{" "}
          <div className="flex justify-end gap-2">
            <Button onClick={() => setIsDeleteModalOpen(false)} variant="ghost">
              {t("common.cancel")}{" "}
            </Button>{" "}
            <Button
              loading={deleteVerificationMutation.isPending}
              onClick={handleDeleteVerification}
              variant="destructive"
            >
              {t("common.delete")}{" "}
            </Button>{" "}
          </div>{" "}
        </div>{" "}
      </Modal>
      <div className="w-full space-y-4">
        <Step
          description={t("verification.step1.description")}
          isCompleted={completedSteps.includes("step-1")}
          isDisabled={false}
          isOpen={activeStep === "step-1"}
          onSelect={() => setActiveStep("step-1")}
          stepNumber={1}
          title={t("verification.step1.title")}
        >
          <SubmittedTextDisplay text={verificationText} />
        </Step>

        <Step
          description={t("verification.step2.description")}
          isCompleted={completedSteps.includes("step-2")}
          isDisabled={!completedSteps.includes("step-1")}
          isOpen={activeStep === "step-2"}
          onSelect={() =>
            !completedSteps.includes("step-2") && setActiveStep("step-2")
          }
          stepNumber={2}
          title={t("verification.step2.title")}
        >
          <QuestionsList
            isContinuing={isSearchingSources}
            isLocked={completedSteps.includes("step-2")}
            onComplete={handleQuestionsConfirmed}
            verificationId={verificationId}
          />
        </Step>

        <Step
          description={t("verification.step3.description")}
          isCompleted={completedSteps.includes("step-3")}
          isDisabled={!completedSteps.includes("step-2")}
          isOpen={activeStep === "step-3"}
          onSelect={() =>
            !completedSteps.includes("step-3") && setActiveStep("step-3")
          }
          stepNumber={3}
          title={t("verification.step3.title")}
        >
          <SourcesList
            isContinuing={continueToAnalysisMutation.isPending}
            onComplete={handleSourcesConfirmed}
            verificationId={verificationId}
          />
        </Step>
      </div>
      <div className="mt-8 flex justify-start border-t pt-6">
        <Button
          onClick={() => setIsDeleteModalOpen(true)}
          variant="destructive"
        >
          <Trash2 className="mr-2 h-4 w-4" />
          {t("verification.delete_button")}
        </Button>
      </div>
    </>
  );
}
