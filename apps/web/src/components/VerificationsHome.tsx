"use client";

import { useQuery } from "@tanstack/react-query";
import { Clock, Sparkles, Zap } from "lucide-react";
import { useGlobalLoader } from "@/hooks/use-global-loader";
import { useI18n } from "@/hooks/use-i18n";
import { orpc } from "@/utils/orpc";
import VerificationCard from "./VerificationCard";

export default function VerificationsHome() {
  const { t } = useI18n();
  const limit = 6;

  const { data, isLoading } = useQuery({
    queryKey: orpc.getVerificationsHome.key({ input: { page: 1, limit } }),
    queryFn: () => orpc.getVerificationsHome.call({ page: 1, limit }),
  });

  const verifications = data?.verifications || [];

  useGlobalLoader(isLoading, "verifications-home");

  return (
    <div className="m-4 space-y-6">
      {/* Header */}
      <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-teal-600 via-teal-700 to-emerald-800 p-6 shadow-lg transition-all duration-700 hover:shadow-teal-500/30 sm:p-8">
        <div className="-right-20 -top-20 pointer-events-none absolute h-40 w-40 animate-pulse rounded-full bg-white/10 blur-3xl transition-all duration-1000 group-hover:scale-125" />
        <div className="-bottom-10 -left-10 pointer-events-none absolute h-32 w-32 animate-pulse rounded-full bg-emerald-400/15 blur-2xl delay-500" />

        <div className="relative flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="group/icon relative rounded-xl bg-white/15 p-3 backdrop-blur-sm transition-all duration-300 hover:rotate-6 hover:bg-white/25">
              <Clock className="h-7 w-7 text-white drop-shadow-md transition-transform duration-300 group-hover/icon:scale-105" />
              <Sparkles className="-right-1 -top-1 absolute h-4 w-4 animate-ping text-yellow-300" />
            </div>

            {/* Title */}
            <div>
              <h2 className="font-bold text-2xl text-white drop-shadow-md transition-all duration-300 sm:text-3xl">
                {t("home.latestVerifications")}
              </h2>

              {!isLoading && verifications.length > 0 && (
                <p className="mt-1 font-medium text-sm text-teal-100 transition-opacity duration-500">
                  <span className="inline-flex items-center gap-1 rounded-full bg-white/15 px-3 py-1 backdrop-blur-sm hover:bg-white/25">
                    <span className="relative flex h-2 w-2">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-300 opacity-75" />
                      <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
                    </span>
                    {t("home.verificationsActive", { count: verifications.length })}
                  </span>
                </p>
              )}
            </div>
          </div>

          {/* Indicator */}
          <div className="hidden items-center gap-2 rounded-full bg-white/10 px-4 py-2 backdrop-blur-sm transition-all duration-500 hover:bg-white/20 sm:flex">
            <Zap className="h-4 w-4 animate-pulse text-yellow-300" />
            <span className="font-medium text-sm text-white">{t("home.realTime")}</span>
          </div>
        </div>
      </div>

      {verifications.length > 0 ? (
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          {verifications.map((v) => (
            <VerificationCard key={v.id} verification={v} />
          ))}
        </div>
      ) : (
        <div className="py-16 text-center text-muted-foreground">
          <p>{t("home.noRecentVerifications")}</p>
        </div>
      )}
    </div>
  );
}
