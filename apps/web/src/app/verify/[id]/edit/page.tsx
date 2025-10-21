"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AlertCircle, Loader2 } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import VerificationFlow from "@/components/VerificationFlow";
import { useGlobalLoader } from "@/hooks/use-global-loader";
import { useI18n } from "@/hooks/use-i18n";
import { orpc } from "@/utils/orpc";

function LoadingState() {
  const { t } = useI18n();
  return (
    <Card className="flex flex-col items-center p-8 text-center">
      <Loader2 className="mb-4 h-12 w-12 animate-spin text-primary" />
      <h2 className="mb-2 font-bold text-xl">
        {t("common.loading", { defaultValue: "Cargando..." })}
      </h2>
      <p className="text-muted-foreground">
        {t("verification.loading_details", {
          defaultValue: "Cargando detalles de la verificación...",
        })}
      </p>
    </Card>
  );
}

function ErrorState({ errorMessage }: { errorMessage: string }) {
  const { t } = useI18n();
  return (
    <Card className="flex flex-col items-center p-8 text-center text-destructive">
      <AlertCircle className="mb-4 h-12 w-12" />
      <h2 className="mb-2 font-bold text-xl">
        {t("error.loadingVerification")}
      </h2>
      <p>{errorMessage}</p>
    </Card>
  );
}

export default function VerificationEditPage() {
  const params = useParams();
  const verificationId = Array.isArray(params.id) ? params.id[0] : params.id;

  if (!verificationId) {
    return (
      <div className="container mx-auto max-w-4xl px-4 py-12">
        <LoadingState />
      </div>
    );
  }

  return <PageContent verificationId={verificationId} />;
}

function PageContent({ verificationId }: { verificationId: string }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [jobId, setJobId] = useState<string | null>(null);

  useEffect(() => {
    const storedJobId = sessionStorage.getItem(
      `verification_job_${verificationId}`
    );
    if (storedJobId) {
      setJobId(storedJobId);
    }
  }, [verificationId]);

  const {
    data: verificationData,
    isLoading: isLoadingVerification,
    error: verificationError,
  } = useQuery({
    queryKey: ["verificationFlowData", verificationId],
    queryFn: () => orpc.getVerificationDetails.call({ verificationId }),
    enabled: !!verificationId,
  });

  // Mutation for saving generated questions
  const saveQuestionsMutation = useMutation({
    mutationFn: (
      questions: Array<{
        question_text: string;
        original_question: string;
        order_index: number;
      }>
    ) => orpc.saveGeneratedQuestions.call({ verificationId, questions }),
    onSuccess: () => {
      toast.success("Preguntas generadas y guardadas correctamente.");
      queryClient.invalidateQueries({
        queryKey: ["verificationFlowData", verificationId],
      });
      queryClient.invalidateQueries({
        queryKey: orpc.getVerificationQuestions.key({
          input: { verificationId },
        }),
      });
      sessionStorage.removeItem(`verification_job_${verificationId}`);
      setJobId(null);
    },
    onError: (error) => {
      toast.error(`Error al guardar las preguntas: ${error.message}`);
      sessionStorage.removeItem(`verification_job_${verificationId}`);
      setJobId(null);
    },
  });

  // Get job result if jobId is set
  const { data: jobResult, isLoading: isPolling } = useQuery({
    queryKey: ["jobResult", jobId],
    queryFn: () => orpc.getJobResult.call({ jobId: jobId! }),
    enabled: !!jobId && verificationData?.status === "processing_questions",
    refetchInterval: (query) =>
      query.state.data?.status === "completed" ? false : 3000,
    retry: false,
  });

  useEffect(() => {
    if (jobResult?.status === "completed") {
      setJobId(null);
      sessionStorage.removeItem(`verification_job_${verificationId}`);

      const questions = jobResult.result?.questions;
      if (questions && Array.isArray(questions)) {
        const formattedQuestions = questions.map(
          (questionText: string, index: number) => ({
            question_text: questionText,
            original_question: questionText,
            order_index: index,
          })
        );
        saveQuestionsMutation.mutate(formattedQuestions);
      } else {
        toast.error(
          "El trabajo se completó pero no se recibieron preguntas válidas."
        );
        sessionStorage.removeItem(`verification_job_${verificationId}`);
        setJobId(null);
      }
    } else if (
      jobResult?.status === "failed" ||
      jobResult?.status === "error"
    ) {
      setJobId(null);
      sessionStorage.removeItem(`verification_job_${verificationId}`);
      toast.error("El proceso de generación de preguntas ha fallado.");
    }
  }, [jobResult, saveQuestionsMutation, verificationId]);

  useGlobalLoader(
    isLoadingVerification || isPolling || saveQuestionsMutation.isPending,
    "edit-page-loader"
  );

  if (verificationData && !isPolling && !saveQuestionsMutation.isPending) {
    const isEditable =
      verificationData.status === "processing_questions" ||
      verificationData.status === "sources_ready";
    if (!isEditable && verificationData.status !== "draft") {
      router.replace(`/verify/${verificationId}/finalResult`);
      return null;
    }
  }

  if (isLoadingVerification) {
    return (
      <div className="container mx-auto max-w-4xl px-4 py-12">
        <LoadingState />
      </div>
    );
  }

  if (verificationError) {
    return (
      <div className="container mx-auto max-w-2xl px-4 py-12">
        <ErrorState errorMessage={verificationError.message} />
      </div>
    );
  }

  if (verificationData) {
    if (isPolling || saveQuestionsMutation.isPending) {
      return (
        <div className="container mx-auto max-w-4xl px-4 py-12">
          <Card className="flex flex-col items-center p-8 text-center">
            <Loader2 className="mb-4 h-12 w-12 animate-spin text-primary" />
            <h2 className="mb-2 font-bold text-xl">
              Generando preguntas críticas...
            </h2>
            <p className="text-muted-foreground">
              Este proceso puede tardar un momento. La página se actualizará
              automáticamente.
            </p>
          </Card>
        </div>
      );
    }
    return (
      <div className="mx-auto my-8 max-w-4xl rounded-lg bg-neutral/80 p-4 shadow-lg backdrop-blur-sm sm:p-6 lg:p-8">
        <VerificationFlow verification={verificationData} />
      </div>
    );
  }

  return null;
}
