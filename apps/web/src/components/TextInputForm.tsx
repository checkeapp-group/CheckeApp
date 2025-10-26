"use client";

import {AlertTriangle} from "lucide-react";
import type React from "react";
import {useCallback, useState} from "react";
import TextareaAutosize from "react-textarea-autosize";
import {toast} from "sonner";
import AuthModal from "@/components/Auth/auth-modal";
import {Button} from "@/components/ui/button";
import {useAuth} from "@/hooks/use-auth";
import {useI18n} from "@/hooks/use-i18n";
import {orpc} from "@/utils/orpc";
import {Card} from "./ui/card";
import LatxaIcon from "@/public/latxa_icon.webp";
import Image from "next/image";

type TextInputFormProps = {
    isAuthenticated?: boolean;
    onSuccess?: (verificationId: string) => void;
    text: string;
    onTextChange: (newText: string) => void;
    isLocked?: boolean;
};

const TextInputForm = ({
    isAuthenticated: propIsAuthenticated,
    onSuccess,
    text,
    onTextChange,
    isLocked = false,
}: TextInputFormProps) => {
    const {t, locale} = useI18n();
    const {
        isAuthenticated: hookIsAuthenticated,
        isVerified,
        isLoading: authLoading,
    } = useAuth();
    const [isFocused, setIsFocused] = useState(false);

    const [isLoading, setIsLoading] = useState(false);
    const [showAuthModal, setShowAuthModal] = useState(false);

    const isAuthenticated = propIsAuthenticated ?? hookIsAuthenticated;
    const maxLength = 5000;
    const minLength = 30;

    const handleUnauthenticatedAction = useCallback(() => {
        if (authLoading || isAuthenticated) {
            return;
        }
        setShowAuthModal(true);
    }, [authLoading, isAuthenticated]);

    const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        if (!isAuthenticated) {
            handleUnauthenticatedAction();
            return;
        }
        onTextChange(e.target.value);
    };

    const handleInteraction = () => {
        if (!isAuthenticated) {
            handleUnauthenticatedAction();
        }
    };

    const handleSubmit = async () => {
        if (isLoading || !isAuthenticated || text.trim().length < minLength) {
            return;
        }

        if (!isVerified) {
            toast.warning(t("auth.verificationNeeded.title"));
            return;
        }

        setIsLoading(true);

        try {
            const result = await orpc.startVerification.call({
                text: text.trim(),
                language: locale,
            });

            if (result.success && result.verificationId && result.job_id) {
                sessionStorage.setItem(
                    `verification_job_${result.verificationId}`,
                    result.job_id
                );
                toast.success(t("textInput.verification_started_success"));

                if (onSuccess) {
                    onSuccess(result.verificationId);
                }
            } else {
                toast.error(
                    result.message || t("textInput.verification_failed")
                );
            }
        } catch (error) {
            toast.error(
                error instanceof Error
                    ? error.message
                    : t("textInput.network_error")
            );
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            {isAuthenticated && !isVerified && (
                <Card className="mb-4 flex items-center gap-4 border-yellow-500/50 bg-yellow-50 p-4 text-yellow-800">
                    <AlertTriangle className="h-6 w-6 flex-shrink-0" />
                    <div className="flex-1">
                        <h3 className="font-semibold">
                            {t("auth.verificationNeeded.title")}
                        </h3>
                        <p className="text-sm">
                            {t("auth.verificationNeeded.message")}
                        </p>
                    </div>
                </Card>
            )}
            <Card
                className={`p-4 sm:p-6 ${
                    isFocused
                        ? "border-primary/50 bg-card/95 shadow-md"
                        : "bg-card/80"
                }`}
                onClick={handleInteraction}>
                <div className="relative">
                    <div className="flex w-full justify-center h-0">
                        <div className="w-max bg-gradient-to-br from-[#83d59a] via-[#2fbe9a] to-[#04abd0] outline outline-neutral-200/60 rounded-full overflow-hidden p-1 px-3 absolute top-[-2.5rem]">
                            <div className="flex items-center justify-center gap-2">
                                <Image
                                    alt="Patrocinadores"
                                    className="w-8 h-auto"
                                    src={LatxaIcon}
                                />
                                <div className="uppercase font-medium text-white text-xs">
                                    Powered by{" "}
                                    <span className="font-bold">LATXA</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <TextareaAutosize
                        className="w-full resize-none border-0 bg-transparent text-lg placeholder:text-muted-foreground focus:outline-none focus:ring-0 disabled:cursor-not-allowed"
                        disabled={isLoading || !isAuthenticated || isLocked}
                        maxLength={maxLength}
                        minRows={3}
                        onBlur={() => setIsFocused(false)}
                        onChange={handleTextChange}
                        onClick={handleInteraction}
                        onFocus={() => {
                            setIsFocused(true);
                            handleInteraction();
                        }}
                        placeholder={
                            authLoading
                                ? t("common.loading")
                                : isAuthenticated
                                ? t("textInput.placeholder")
                                : t("textInput.loginPlaceholder")
                        }
                        readOnly={!isAuthenticated}
                        value={text}
                    />
                    {!isAuthenticated && (
                        <div
                            className="absolute inset-0 cursor-pointer bg-transparent"
                            onClick={handleInteraction}
                        />
                    )}
                </div>
                <div className="mt-4 flex flex-col items-end gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div
                        className={`text-sm ${
                            text.length < minLength
                                ? text.length == 0
                                    ? "text-muted-foreground"
                                    : "text-destructive"
                                : "text-muted-foreground"
                        }`}>
                        {text.length} / {maxLength}
                    </div>
                    <Button
                        disabled={
                            authLoading ||
                            (isAuthenticated &&
                                (text.trim().length < minLength ||
                                    isLoading)) ||
                            isLocked
                        }
                        loading={isLoading}
                        onClick={
                            isAuthenticated ? handleSubmit : handleInteraction
                        }
                        size="lg">
                        {authLoading
                            ? t("common.loading")
                            : isAuthenticated
                            ? t("textInput.submit")
                            : t("textInput.loginToSubmit")}
                    </Button>
                </div>
            </Card>

            <AuthModal
                isOpen={showAuthModal}
                onClose={() => setShowAuthModal(false)}
            />
        </>
    );
};

export default TextInputForm;
