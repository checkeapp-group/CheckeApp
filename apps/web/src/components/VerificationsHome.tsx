"use client";

import { useQuery } from "@tanstack/react-query";
import { Clock, HelpCircle, Sparkles, Zap } from "lucide-react";
import { useState } from "react";
import { useGlobalLoader } from "@/hooks/use-global-loader";
import { useI18n } from "@/hooks/use-i18n";
import { orpc } from "@/utils/orpc";
import { ExplanationModal } from "./ExplanationModal";
import { Button } from "./ui/button";
import VerificationCard from "./VerificationCard";

export default function VerificationsHome() {
  const { t } = useI18n();
  const limit = 6;
  const [isExplanationModalOpen, setIsExplanationModalOpen] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: orpc.getVerificationsHome.key({ input: { page: 1, limit } }),
    queryFn: () => orpc.getVerificationsHome.call({ page: 1, limit }),
  });

  const verifications = data?.verifications || [];

  useGlobalLoader(isLoading, "verifications-home");

  return (
    <div className="space-y-6">
      <ExplanationModal
        isOpen={isExplanationModalOpen}
        onClose={() => setIsExplanationModalOpen(false)}
      />
      {/* Header */}
      <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#83d59a] via-[#2fbe9a] to-[#04abd0] p-6 shadow-lg transition-all duration-700 hover:shadow-teal-500/30 sm:p-8">
        <div className="wave-container">
          <svg
            className="h-full w-full"
            preserveAspectRatio="none"
            viewBox="0 0 1000 200"
          >
            <path
              d="M0,200 L0.0,100.0 C 6.3,101.2 18.8,103.7 25.0,104.9 C 31.3,106.1 43.8,108.4 50.0,109.6 C 56.3,110.6 68.8,112.6 75.0,113.6 C 81.3,114.4 93.8,116.0 100.0,116.8 C 106.3,117.3 118.8,118.5 125.0,119.0 C 131.3,119.2 143.8,119.7 150.0,119.9 C 156.3,119.9 168.8,119.8 175.0,119.7 C 181.3,119.3 193.8,118.6 200.0,118.2 C 206.3,117.5 218.8,116.3 225.0,115.6 C 231.3,114.7 243.8,112.9 250.0,112.0 C 256.3,110.9 268.8,108.7 275.0,107.6 C 281.3,106.4 293.8,104.0 300.0,102.8 C 306.3,101.5 318.8,99.0 325.0,97.8 C 331.3,96.6 343.8,94.2 350.0,93.0 C 356.3,91.9 368.8,89.7 375.0,88.6 C 381.3,87.7 393.8,85.8 400.0,84.9 C 406.3,84.2 418.8,82.8 425.0,82.1 C 431.3,81.7 443.8,80.8 450.0,80.4 C 456.3,80.3 468.8,80.1 475.0,80.0 C 481.3,80.2 493.8,80.6 500.0,80.8 C 506.3,81.3 518.8,82.3 525.0,82.8 C 531.3,83.6 543.8,85.1 550.0,85.9 C 556.3,86.9 568.8,88.8 575.0,89.8 C 581.3,91.0 593.8,93.3 600.0,94.4 C 606.3,95.6 618.8,98.1 625.0,99.3 C 631.3,100.5 643.8,103.0 650.0,104.3 C 656.3,105.5 668.8,107.8 675.0,109.0 C 681.3,110.0 693.8,112.1 700.0,113.1 C 706.3,113.9 718.8,115.7 725.0,116.5 C 731.3,117.1 743.8,118.2 750.0,118.8 C 756.3,119.1 768.8,119.6 775.0,119.9 C 781.3,119.9 793.8,119.8 800.0,119.8 C 806.3,119.5 818.8,118.8 825.0,118.5 C 831.3,117.9 843.8,116.6 850.0,116.0 C 856.3,115.1 868.8,113.4 875.0,112.5 C 881.3,111.4 893.8,109.3 900.0,108.2 C 906.3,107.0 918.8,104.7 925.0,103.5 C 931.3,102.3 943.8,99.8 950.0,98.5 C 956.3,97.3 968.8,94.8 975.0,93.6 C 981.3,92.5 993.8,90.2 1000.0,89.1 C 1006.3,88.1 1018.8,86.3 1025.0,85.3 L1000.0,200.0 L0,200.0Z"
              fill="#ffffff"
            >
              <animate
                attributeName="d"
                dur="9.0s"
                repeatCount="indefinite"
                values="M0,200 L0.0,100.0 C 6.3,101.2 18.8,103.7 25.0,104.9 C 31.3,106.1 43.8,108.4 50.0,109.6 C 56.3,110.6 68.8,112.6 75.0,113.6 C 81.3,114.4 93.8,116.0 100.0,116.8 C 106.3,117.3 118.8,118.5 125.0,119.0 C 131.3,119.2 143.8,119.7 150.0,119.9 C 156.3,119.9 168.8,119.8 175.0,119.7 C 181.3,119.3 193.8,118.6 200.0,118.2 C 206.3,117.5 218.8,116.3 225.0,115.6 C 231.3,114.7 243.8,112.9 250.0,112.0 C 256.3,110.9 268.8,108.7 275.0,107.6 C 281.3,106.4 293.8,104.0 300.0,102.8 C 306.3,101.5 318.8,99.0 325.0,97.8 C 331.3,96.6 343.8,94.2 350.0,93.0 C 356.3,91.9 368.8,89.7 375.0,88.6 C 381.3,87.7 393.8,85.8 400.0,84.9 C 406.3,84.2 418.8,82.8 425.0,82.1 C 431.3,81.7 443.8,80.8 450.0,80.4 C 456.3,80.3 468.8,80.1 475.0,80.0 C 481.3,80.2 493.8,80.6 500.0,80.8 C 506.3,81.3 518.8,82.3 525.0,82.8 C 531.3,83.6 543.8,85.1 550.0,85.9 C 556.3,86.9 568.8,88.8 575.0,89.8 C 581.3,91.0 593.8,93.3 600.0,94.4 C 606.3,95.6 618.8,98.1 625.0,99.3 C 631.3,100.5 643.8,103.0 650.0,104.3 C 656.3,105.5 668.8,107.8 675.0,109.0 C 681.3,110.0 693.8,112.1 700.0,113.1 C 706.3,113.9 718.8,115.7 725.0,116.5 C 731.3,117.1 743.8,118.2 750.0,118.8 C 756.3,119.1 768.8,119.6 775.0,119.9 C 781.3,119.9 793.8,119.8 800.0,119.8 C 806.3,119.5 818.8,118.8 825.0,118.5 C 831.3,117.9 843.8,116.6 850.0,116.0 C 856.3,115.1 868.8,113.4 875.0,112.5 C 881.3,111.4 893.8,109.3 900.0,108.2 C 906.3,107.0 918.8,104.7 925.0,103.5 C 931.3,102.3 943.8,99.8 950.0,98.5 C 956.3,97.3 968.8,94.8 975.0,93.6 C 981.3,92.5 993.8,90.2 1000.0,89.1 C 1006.3,88.1 1018.8,86.3 1025.0,85.3 L1000.0,200.0 L0,200.0Z;
         M0,200 L0.0,100.0 C 6.3,98.8 18.8,96.3 25.0,95.1 C 31.3,93.9 43.8,91.6 50.0,90.4 C 56.3,89.4 68.8,87.4 75.0,86.4 C 81.3,85.6 93.8,84.0 100.0,83.2 C 106.3,82.7 118.8,81.5 125.0,81.0 C 131.3,80.8 143.8,80.3 150.0,80.1 C 156.3,80.1 168.8,80.3 175.0,80.3 C 181.3,80.7 193.8,81.4 200.0,81.8 C 206.3,82.5 218.8,83.8 225.0,84.4 C 231.3,85.3 243.8,87.1 250.0,88.0 C 256.3,89.1 268.8,91.3 275.0,92.4 C 281.3,93.6 293.8,96.0 300.0,97.2 C 306.3,98.5 318.8,101.0 325.0,102.2 C 331.3,103.4 343.8,105.8 350.0,107.0 C 356.3,108.1 368.8,110.3 375.0,111.4 C 381.3,112.3 393.8,114.2 400.0,115.1 C 406.3,115.8 418.8,117.2 425.0,117.9 C 431.3,118.3 443.8,119.2 450.0,119.6 C 456.3,119.7 468.8,119.9 475.0,120.0 C 481.3,119.8 493.8,119.4 500.0,119.2 C 506.3,118.7 518.8,117.7 525.0,117.2 C 531.3,116.4 543.8,114.9 550.0,114.1 C 556.3,113.1 568.8,111.2 575.0,110.2 C 581.3,109.0 593.8,106.8 600.0,105.6 C 606.3,104.4 618.8,101.9 625.0,100.7 C 631.3,99.5 643.8,97.0 650.0,95.7 C 656.3,94.5 668.8,92.2 675.0,91.0 C 681.3,90.0 693.8,87.9 700.0,86.9 C 706.3,86.1 718.8,84.3 725.0,83.5 C 731.3,82.9 743.8,81.8 750.0,81.2 C 756.3,80.9 768.8,80.4 775.0,80.1 C 781.3,80.1 793.8,80.2 800.0,80.2 C 806.3,80.5 818.8,81.2 825.0,81.5 C 831.3,82.1 843.8,83.4 850.0,84.0 C 856.3,84.9 868.8,86.6 875.0,87.5 C 881.3,88.6 893.8,90.7 900.0,91.8 C 906.3,93.0 918.8,95.3 925.0,96.5 C 931.3,97.8 943.8,100.3 950.0,101.5 C 956.3,102.7 968.8,105.2 975.0,106.4 C 981.3,107.5 993.8,109.8 1000.0,110.9 C 1006.3,111.9 1018.8,113.8 1025.0,114.7 L1000.0,200.0 L0,200.0Z;
         M0,200 L0.0,100.0 C 6.3,101.2 18.8,103.7 25.0,104.9 C 31.3,106.1 43.8,108.4 50.0,109.6 C 56.3,110.6 68.8,112.6 75.0,113.6 C 81.3,114.4 93.8,116.0 100.0,116.8 C 106.3,117.3 118.8,118.5 125.0,119.0 C 131.3,119.2 143.8,119.7 150.0,119.9 C 156.3,119.9 168.8,119.8 175.0,119.7 C 181.3,119.3 193.8,118.6 200.0,118.2 C 206.3,117.5 218.8,116.3 225.0,115.6 C 231.3,114.7 243.8,112.9 250.0,112.0 C 256.3,110.9 268.8,108.7 275.0,107.6 C 281.3,106.4 293.8,104.0 300.0,102.8 C 306.3,101.5 318.8,99.0 325.0,97.8 C 331.3,96.6 343.8,94.2 350.0,93.0 C 356.3,91.9 368.8,89.7 375.0,88.6 C 381.3,87.7 393.8,85.8 400.0,84.9 C 406.3,84.2 418.8,82.8 425.0,82.1 C 431.3,81.7 443.8,80.8 450.0,80.4 C 456.3,80.3 468.8,80.1 475.0,80.0 C 481.3,80.2 493.8,80.6 500.0,80.8 C 506.3,81.3 518.8,82.3 525.0,82.8 C 531.3,83.6 543.8,85.1 550.0,85.9 C 556.3,86.9 568.8,88.8 575.0,89.8 C 581.3,91.0 593.8,93.3 600.0,94.4 C 606.3,95.6 618.8,98.1 625.0,99.3 C 631.3,100.5 643.8,103.0 650.0,104.3 C 656.3,105.5 668.8,107.8 675.0,109.0 C 681.3,110.0 693.8,112.1 700.0,113.1 C 706.3,113.9 718.8,115.7 725.0,116.5 C 731.3,117.1 743.8,118.2 750.0,118.8 C 756.3,119.1 768.8,119.6 775.0,119.9 C 781.3,119.9 793.8,119.8 800.0,119.8 C 806.3,119.5 818.8,118.8 825.0,118.5 C 831.3,117.9 843.8,116.6 850.0,116.0 C 856.3,115.1 868.8,113.4 875.0,112.5 C 881.3,111.4 893.8,109.3 900.0,108.2 C 906.3,107.0 918.8,104.7 925.0,103.5 C 931.3,102.3 943.8,99.8 950.0,98.5 C 956.3,97.3 968.8,94.8 975.0,93.6 C 981.3,92.5 993.8,90.2 1000.0,89.1 C 1006.3,88.1 1018.8,86.3 1025.0,85.3 L1000.0,200.0 L0,200.0Z"
              />
            </path>
          </svg>
        </div>
        <div className="-right-20 -top-20 pointer-events-none absolute h-40 w-40 animate-pulse rounded-full bg-white/10 blur-3xl transition-all duration-1000 group-hover:scale-125" />
        <div className="-bottom-10 -left-10 pointer-events-none absolute h-32 w-32 animate-pulse rounded-full bg-emerald-400/15 blur-2xl delay-500" />

        <div className="relative flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="group/icon relative rounded-xl bg-black/10 p-3 backdrop-blur-sm transition-all duration-300 hover:rotate-6 hover:bg-white/25">
              <Clock className="h-7 w-7 text-white drop-shadow-md drop-shadow-neutral-800/20 transition-transform duration-300 group-hover/icon:scale-105" />
              <Sparkles className="-right-1 -top-1 absolute h-4 w-4 animate-ping text-yellow-300" />
            </div>

            {/* Title */}
            <div>
              <h2 className="font-bold text-2xl text-shadow-md text-shadow-neutral-800/20 text-white transition-all duration-300 sm:text-3xl">
                {t("home.latestVerifications")}
              </h2>
            </div>
          </div>

          {/* Indicators */}
          <div className="flex items-center gap-3">
            <Button
              className="group/btn flex items-center gap-2 rounded-full bg-black/10 px-4 py-2 backdrop-blur-sm transition-all duration-300 hover:bg-white/20"
              onClick={() => setIsExplanationModalOpen(true)}
              size="sm"
              variant="ghost"
            >
              <HelpCircle className="h-4 w-4 text-white transition-transform duration-300 group-hover/btn:rotate-12" />
              <span className="font-medium text-shadow-md text-shadow-neutral-800/20 text-sm text-white">
                {t("home.howItWorks")}
              </span>
            </Button>

            <div className="hidden items-center gap-2 rounded-full bg-black/10 px-4 py-2 backdrop-blur-sm transition-all duration-500 hover:bg-white/20 sm:flex">
              <Zap className="h-4 w-4 animate-pulse text-white" />
              <span className="font-medium text-shadow-md text-shadow-neutral-800/20 text-sm text-white">
                {t("home.realTime")}
              </span>
            </div>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="py-16 text-center text-muted-foreground">
          <p>{t("home.noRecentVerifications")}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          {verifications.map((v: any) => (
            <VerificationCard key={v.id} verification={v} />
          ))}
        </div>
      )}
    </div>
  );
}
