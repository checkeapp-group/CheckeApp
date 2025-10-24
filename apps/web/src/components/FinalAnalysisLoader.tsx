"use client";

import Typewriter from "typewriter-effect";
import { useI18n } from "@/hooks/use-i18n";

type FinalAnalysisLoaderProps = {
  title: string;
};

export const FinalAnalysisLoader = ({ title }: FinalAnalysisLoaderProps) => {
  const { t } = useI18n();

  return (
    <div className="mt-10 w-full p-10 text-center">
      <div className="mx-auto flex h-24 w-24 items-center justify-center">
        <div className="relative h-16 w-16">
          <div className="absolute inset-0 animate-spin rounded-full border-4 border-zinc-300 border-t-4 border-t-blue-500" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-8 w-8 scale-0 transform animate-[pop_1s_ease-in-out_0.5s_forwards] rounded-full bg-blue-500 opacity-0" />
          </div>
        </div>
      </div>

      <div className="mx-auto mt-5 w-max text-xs text-zinc-400 uppercase">
        {t("finalResult.doing_fact_check", "Realizando la verificación...")}
      </div>

      <div className="mx-auto mt-5 flex max-w-3xl justify-center text-zinc-800">
        <div className="w-max font-semibold text-xl">
          <Typewriter
            onInit={(typewriter) => {
              typewriter.pauseFor(500).typeString(title).start();
            }}
            options={{
              autoStart: true,
              loop: false,
              delay: 40,
            }}
          />
        </div>
      </div>

      <style jsx>{`
        @keyframes pop {
          0% {
            transform: scale(0);
            opacity: 0;
          }
          50% {
            transform: scale(1.2);
            opacity: 1;
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
};
