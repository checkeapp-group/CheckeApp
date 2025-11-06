"use client";

import { Calendar, User } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useI18n } from "@/hooks/use-i18n";
import { cn } from "@/lib/utils";

type VerificationData = {
  id: string;
  createdAt: Date;
  originalText: string;
  userName: string | null;
  claim: string | null;
  label: string | null;
  imageUrl?: string | null;
  labelsJson?: string | null;
};

type VerificationCardProps = {
  verification: VerificationData;
};

const getLabelStyles = (label: string | null) => {
  switch (label?.toLowerCase()) {
    case "true":
    case "verificado":
      return "bg-[#dcf4df] text-foreground outline-foreground";
    case "fake":
    case "false":
    case "bulo":
      return "bg-red-100 text-red-800 outline-red-800";
    default:
      return "bg-orange-100 text-orange-800";
  }
};

const getLabelText = (label: string | null, t:any) => {
  switch (label?.toLowerCase()) {
    case "true":
    case "verificado":
      return t("verifications.label.verified");
    case "fake":
    case "false":
    case "bulo":
      return t("verifications.label.fake");
    default:
      return t("verifications.label.undetermined");
  }
};

export default function VerificationCard({
  verification,
}: VerificationCardProps) {
  const { t } = useI18n();

  return (
    <Link
      className="block h-full"
      href={`/verify/${verification.id}/finalResult`}
    >
      <div className="relative h-full overflow-hidden rounded-2xl bg-card shadow-md ring-1 ring-border/50 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:ring-2 hover:ring-primary/50">
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
            <div className="absolute inset-0 bg-gradient-to-b from-gray-200/40 via-gray-200/20 to-transparent blur-sm" />
          )}
        </div>

        <div className="relative z-10 flex h-full flex-col justify-between gap-4 p-5">
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between text-muted-foreground text-xs">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>
                  {new Date(verification.createdAt).toLocaleDateString()}
                </span>
              </div>
              {verification.label && (
                <span
                  className={cn(
                    "rounded-md px-2 py-0.5 font-semibold text-xs outline uppercase",
                    getLabelStyles(verification.label)
                  )}
                >
                  {getLabelText(verification.label, t)}
                </span>
              )}
            </div>

            <div className="space-y-2">
              <h2 className="line-clamp-2 font-bold text-foreground text-lg leading-tight">
                {verification.originalText}
              </h2>
              <div className="h-0.5 w-16 bg-muted-foreground/30" />
              <p className="line-clamp-3 text-muted-foreground text-sm">
                {verification.claim || t("verifications.no_claim")}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-muted-foreground text-sm">
            <User className="h-4 w-4" />
            <span>{verification.userName || t("result.anonymous")}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
