"use client";

import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query";
import {AlertCircle} from "lucide-react";
import {useParams, useRouter} from "next/navigation";
import {useEffect, useState} from "react";
import {toast} from "sonner";
import {Card} from "@/components/ui/card";
import VerificationFlow from "@/components/VerificationFlow";
import {useGlobalLoader} from "@/hooks/use-global-loader";
import {useI18n} from "@/hooks/use-i18n";
import {usePageMetadata} from "@/hooks/use-page-metadata";
import {orpc} from "@/utils/orpc";

function ErrorState({errorMessage}: {errorMessage: string}) {
    const {t} = useI18n();
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

// Verification editing page with multi-step workflow for questions and sources
export default function VerificationEditPage() {
    const params = useParams();
    const verificationId = Array.isArray(params.id) ? params.id[0] : params.id;

    return <PageContent verificationId={verificationId} />;
}

function PageContent({verificationId}: {verificationId?: string | null}) {
    const {t} = useI18n();
    const router = useRouter();
    const queryClient = useQueryClient();
    const [jobId, setJobId] = useState<string | null>(null);

    useEffect(() => {
        const storedJobId = verificationId
            ? sessionStorage.getItem(`verification_job_${verificationId}`)
            : null;
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
        queryFn: () =>
            orpc.getVerificationDetails.call({verificationId: verificationId!}),
        enabled: !!verificationId,
    });

    // Set page metadata with verification data
    const title = verificationData?.originalText
        ? `${verificationData.originalText.substring(0, 60)}${verificationData.originalText.length > 60 ? "..." : ""} - ${t("meta.verifyEdit.title")}`
        : t("meta.verifyEdit.title");
    const description = verificationData?.originalText ?? t("meta.verifyEdit.description");

    usePageMetadata(title, description);

    const saveQuestionsMutation = useMutation({
        mutationFn: (
            questions: Array<{
                question_text: string;
                original_question: string;
                order_index: number;
            }>
        ) =>
            orpc.saveGeneratedQuestions.call({
                verificationId: verificationId!,
                questions,
            }),
        onSuccess: () => {
            toast.success(t("verification.questionsGenerated"));
            queryClient.invalidateQueries({
                queryKey: ["verificationFlowData", verificationId],
            });
            queryClient.invalidateQueries({
                queryKey: orpc.getVerificationQuestions.key({
                    input: {verificationId},
                }),
            });
            sessionStorage.removeItem(`verification_job_${verificationId}`);
            setJobId(null);
        },
        onError: (error) => {
            toast.error(
                t("verification.errorSavingQuestions", {error: error.message})
            );
            sessionStorage.removeItem(`verification_job_${verificationId}`);
            setJobId(null);
        },
    });

    const {data: jobResult, isLoading: isPolling} = useQuery({
        queryKey: ["jobResult", jobId],
        queryFn: () => orpc.getJobResult.call({jobId: jobId!}),
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
                toast.error(t("verification.noValidQuestions"));
                sessionStorage.removeItem(`verification_job_${verificationId}`);
                setJobId(null);
            }
        } else if (
            jobResult?.status === "failed" ||
            jobResult?.status === "error"
        ) {
            setJobId(null);
            sessionStorage.removeItem(`verification_job_${verificationId}`);
            toast.error(t("verification.generationFailed"));
        }
    }, [jobResult, saveQuestionsMutation, verificationId]);

    const shouldShowLoader =
        !verificationId ||
        isLoadingVerification ||
        isPolling ||
        saveQuestionsMutation.isPending;

    useGlobalLoader(shouldShowLoader, "edit-page-loader");

    if (!verificationId) {
        return null;
    }

    if (verificationError) {
        return (
            <div className="container mx-auto max-w-2xl px-4 py-12">
                <ErrorState errorMessage={verificationError.message} />
            </div>
        );
    }

    if (verificationData && !isPolling && !saveQuestionsMutation.isPending) {
        const isEditable =
            verificationData.status === "processing_questions" ||
            verificationData.status === "sources_ready";
        if (!isEditable && verificationData.status !== "draft") {
            router.replace(`/verify/${verificationId}/finalResult`);
            return null;
        }

        return (
            <div className="mx-auto my-8 max-w-4xl rounded-lg bg-white p-4 shadow-lg backdrop-blur-sm sm:p-6 lg:p-8">
                <VerificationFlow verification={verificationData} />
            </div>
        );
    }

    return null;
}
