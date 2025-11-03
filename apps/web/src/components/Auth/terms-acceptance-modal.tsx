"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Modal } from "@/components/ui/Modal";
import { useI18n } from "@/hooks/use-i18n";
import { orpc } from "@/utils/orpc";

type TermsAcceptanceModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

export default function TermsAcceptanceModal({
  isOpen,
  onClose,
}: TermsAcceptanceModalProps) {
  const { t } = useI18n();
  const [isChecked, setIsChecked] = useState(false);
  const queryClient = useQueryClient();

  const acceptTermsMutation = useMutation({
    mutationFn: () => orpc.acceptTerms.call(),
    onSuccess: () => {
      toast.success(t("terms.acceptedSuccess"));
      queryClient.invalidateQueries({ queryKey: ["userStatus"] });
      onClose();
    },
    onError: (error) => {
      toast.error(error.message || t("terms.acceptedError"));
    },
  });

  return (
    <Modal
      hideCloseButton={true}
      isOpen={isOpen}
      onClose={() => {}}
      title={t("terms.modalTitle")}
    >
      <div className="space-y-6">
        <p className="text-muted-foreground">{t("terms.modalDescription")}</p>
        <div className="flex items-center space-x-3 rounded-md bg-secondary/50 p-4">
          <Checkbox
            aria-label={t("terms.checkboxLabel")}
            checked={isChecked}
            id="terms"
            onCheckedChange={(checked) => setIsChecked(Boolean(checked))}
          />
          <Label className="font-medium text-sm leading-normal" htmlFor="terms">
            {t("terms.checkboxLabel")}{" "}
            <Link
              className="text-primary underline hover:text-primary/80"
              href="/terms-of-service"
              target="_blank"
            >
              {t("nav.termsOfService")}
            </Link>
            ,{" "}
            <Link
              className="text-primary underline hover:text-primary/80"
              href="/legal-notice"
              target="_blank"
            >
              {t("nav.legalAdvice")}
            </Link>{" "}
            {t("common.and")}{" "}
            <Link
              className="text-primary underline hover:text-primary/80"
              href="/privacy-policy"
              target="_blank"
            >
              {t("nav.privacyPolicy")}
            </Link>
            .
          </Label>
        </div>
        <Button
          className="w-full"
          disabled={!isChecked || acceptTermsMutation.isPending}
          loading={acceptTermsMutation.isPending}
          onClick={() => acceptTermsMutation.mutate()}
          size="lg"
        >
          {t("common.acceptAndContinue")}
        </Button>
      </div>
    </Modal>
  );
}
