"use client";

import { AlertTriangle, Calendar, CheckCircle, Clock } from "lucide-react";
import type { Route } from "next";
import Image from "next/image";
import Link from "next/link";
import { useI18n } from "@/hooks/use-i18n";
import { cn } from "@/lib/utils";

type VerificationData = {
  id: string;
  createdAt: Date;
  originalText: string;
  status:
    | "draft"
    | "processing_questions"
    | "sources_ready"
    | "generating_summary"
    | "completed"
    | "error";
  userName: string | null;
  claim: string | null;
  label: string | null;
  imageUrl?: string | null;
};

type UserVerificationCardProps = {
  verification: VerificationData;
};

const getStatusAppearance = (status: VerificationData["status"]) => {
  switch (status) {
    case "completed":
      return {
        icon: CheckCircle,
        color: "text-foreground",
        bgColor: "bg-[#dcf4df]",
      };
    case "error":
      return {
        icon: AlertTriangle,
        color: "text-red-600",
        bgColor: "bg-red-100",
      };
    default:
      return {
        icon: Clock,
        color: "text-yellow-600",
        bgColor: "bg-yellow-100",
      };
  }
};

const getLabelStyles = (label: string | null) => {
  switch (label?.toLowerCase()) {
    case "true":
    case "verificado":
      return {
        icon: CheckCircle,
        color: "text-foreground",
        bgColor: "bg-[#dcf4df]",
      };
    case "fake":
    case "false":
    case "bulo":
      return {
        icon: AlertTriangle,
        color: "text-red-800",
        bgColor: "bg-red-100",
      };
    default:
      return {
        icon: AlertTriangle,
        color: "text-orange-800",
        bgColor: "bg-orange-100",
      };
  }
};

export default function UserVerificationCard({
  verification,
}: UserVerificationCardProps) {
  const { t } = useI18n();

  const isFinalState =
    verification.status === "completed" || verification.status === "error";

  const hrefPath = (
    isFinalState
      ? `/verify/${verification.id}/finalResult`
      : `/verify/${verification.id}/edit`
  ) as Route;

  const getHref = () => {
    if (
      verification.status === "completed" ||
      verification.status === "error"
    ) {
      return `/verify/${verification.id}/finalResult`;
    }
    return `/verify/${verification.id}/edit`;
  };

  let displayInfo;
  if (verification.status === "completed") {
    const labelInfo = getLabelStyles(verification.label);
    displayInfo = {
      ...labelInfo,
      text: t(
        `verifications.label.${
          verification.label?.toLowerCase() || "undetermined"
        }`
      ),
    };
  } else {
    const statusInfo = getStatusAppearance(verification.status);
    displayInfo = {
      ...statusInfo,
      text: t(`verifications.status.${verification.status}`),
    };
  }
  const StatusIcon = displayInfo.icon;

  return (
    <Link className="group block h-full" href={hrefPath}>
      <div className="relative flex h-full flex-col overflow-hidden rounded-2xl bg-card shadow-md ring-1 ring-border/50 transition-all duration-300 hover:scale-[1.01] hover:shadow-xl hover:ring-primary/50">
        <div className="absolute inset-0 overflow-hidden rounded-2xl">
          {verification.imageUrl ? (
            <Image
              alt=""
              className="object-cover opacity-10 blur-lg transition-all duration-300 group-hover:scale-105 group-hover:opacity-20"
              fill
              src={verification.imageUrl}
              unoptimized
            />
          ) : (
            <div className="inset-0 bg-gradient-to-b from-gray-200/40 via-gray-200/20 to-transparent object-cover blur-sm" />
          )}
        </div>

        <div className="relative z-10 flex h-full flex-col justify-between">
          <div className="space-y-3 p-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-muted-foreground text-xs">
                <Calendar className="h-4 w-4" />
                <span>
                  {new Date(verification.createdAt).toLocaleDateString()}
                </span>
              </div>

              <div
                className={cn(
                  "flex items-center gap-1.5 rounded-md px-2 py-0.5 font-bold text-xs uppercase outline",
                  displayInfo.bgColor,
                  displayInfo.color
                )}
              >
                {/* <StatusIcon className="h-3 w-3" /> */}
                <span>{displayInfo.text}</span>
              </div>
            </div>

            <div className="space-y-2">
              <h2 className="line-clamp-2 font-bold text-foreground text-lg leading-tight">
                {verification.originalText}
              </h2>
              <div className="h-0.5 w-16 bg-muted-foreground/20" />
              <p className="line-clamp-3 text-muted-foreground text-sm">
                {verification.claim || t("verifications.no_claim")}
              </p>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
