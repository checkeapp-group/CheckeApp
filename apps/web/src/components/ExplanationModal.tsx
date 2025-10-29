"use client";

import { CheckCircle, FileText, Info, Search } from "lucide-react";
import { useI18n } from "@/hooks/use-i18n";
import { Card } from "./ui/card";
import { Modal } from "./ui/Modal";

type ExplanationModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

export function ExplanationModal({ isOpen, onClose }: ExplanationModalProps) {
  const { t } = useI18n();

  const steps = [
    {
      number: 1,
      title: t("verification.step1.title"),
      description: t("verification.step1.description"),
      icon: FileText,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
    },
    {
      number: 2,
      title: t("verification.step2.title"),
      description: t("verification.step2.description"),
      icon: Search,
      color: "text-purple-500",
      bgColor: "bg-purple-500/10",
    },
    {
      number: 3,
      title: t("verification.step3.title"),
      description: t("verification.step3.description"),
      icon: CheckCircle,
      color: "text-green-500",
      bgColor: "bg-green-500/10",
    },
  ];

  return (
    <Modal
      description={t("explanation.modal.description")}
      isOpen={isOpen}
      onClose={onClose}
      size="lg"
      title={t("explanation.modal.title")}
    >
      <div className="space-y-4">
        {steps.map((step, index) => {
          const Icon = step.icon;
          return (
            <Card
              className="relative overflow-hidden border-primary/30 border-l-4 p-4 transition-all hover:border-primary/50 hover:shadow-md"
              key={step.number}
            >
              <div className="flex items-start gap-4">
                <div
                  className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg ${step.bgColor}`}
                >
                  <Icon className={`h-6 w-6 ${step.color}`} />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-foreground text-lg">
                    {step.title}
                  </h4>
                  <p className="mt-1 text-muted-foreground text-sm">
                    {step.description}
                  </p>
                </div>
              </div>
              {index < steps.length - 1 && (
                <div className="-bottom-3 -translate-x-1/2 absolute left-1/2 z-10 flex h-6 w-6 transform items-center justify-center rounded-full bg-background">
                  <div className="h-4 w-4 rounded-full border-2 border-primary/30" />
                </div>
              )}
            </Card>
          );
        })}

        <div className="mt-6 rounded-lg bg-muted/50 p-4">
          <div className="flex items-start gap-3">
            <Info className="h-5 w-5 text-primary" />
            <p className="text-muted-foreground text-sm">
              {t("explanation.modal.footer")}
            </p>
          </div>
        </div>
      </div>
    </Modal>
  );
}
