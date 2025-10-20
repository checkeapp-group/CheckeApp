"use client";

import { AlertTriangle } from "lucide-react";
import type React from "react";
import { useCallback, useState } from "react";
import TextareaAutosize from "react-textarea-autosize";
import { toast } from "sonner";
import AuthModal from "@/components/Auth/auth-modal";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { useI18n } from "@/hooks/use-i18n";
import { Card } from "./ui/card";

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
  const { t } = useI18n();
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
  const minLength = 50;

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

    console.log("Texto enviado:", text, text.length);

    if (!isVerified) {
      toast.warning(t("auth.verificationNeeded.title"));
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/api/verify/start`,
        {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: text.trim() }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        console.error("Verify Start Error Response:", result);
        throw new Error(result.message || "An unknown error occurred.");
      }

      if (result.success && result.verification_id) {
        sessionStorage.setItem(
          `verification_text_${result.verification_id}`,
          text.trim()
        );
        toast.success(t("textInput.verification_started_success"));

        if (onSuccess) {
          onSuccess(result.verification_id);
        }
      } else {
        toast.error(result.message || t("textInput.verification_failed"));
      }
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : t("textInput.network_error")
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
            <p className="text-sm">{t("auth.verificationNeeded.message")}</p>
          </div>
        </Card>
      )}
      <Card
        className={`p-4 sm:p-6 ${
          isFocused ? "border-primary/50 bg-card/95 shadow-md" : "bg-card/80"
        }`}
        onClick={handleInteraction}
      >
        <div className="relative">
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
                ? "text-destructive"
                : "text-muted-foreground"
            }`}
          >
            {text.length} / {maxLength}
          </div>
          <Button
            disabled={
              authLoading ||
              (isAuthenticated &&
                (text.trim().length < minLength || isLoading)) ||
              isLocked
            }
            loading={isLoading}
            onClick={isAuthenticated ? handleSubmit : handleInteraction}
            size="lg"
          >
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
