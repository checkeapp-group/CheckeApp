"use client";

import { useEffect, useState } from "react";
import Typewriter from "typewriter-effect";
import { useI18n } from "@/hooks/use-i18n";
import AnimationLoader from "./AnimationLoader";
import { Card } from "./ui/card";

type FinalVerificationLoaderProps = {
  question: string;
  isProcessing: boolean;
  onComplete: () => void;
};

// Loading state component shown during final result generation
export default function FinalVerificationLoader({
  question,
  isProcessing,
  onComplete,
}: FinalVerificationLoaderProps) {
  const { t } = useI18n();
  const loadingSteps = [
    t("loader.step.initiating"),
    t("loader.step.generating_questions"),
    t("loader.step.searching_sources"),
    t("loader.step.evaluating_credibility"),
    t("loader.step.extracting_data"),
    t("loader.step.synthesizing"),
    t("loader.step.generating_verdict"),
    t("loader.step.checking_biases"),
    t("loader.step.finalizing"),
  ];
  const [progress, setProgress] = useState(0);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [statusText, setStatusText] = useState(loadingSteps[0]);

  useEffect(() => {
    if (isProcessing) {
      const stepInterval = setInterval(() => {
        setCurrentStepIndex((prev) => {
          const nextIndex = (prev + 1) % loadingSteps.length;
          setStatusText(loadingSteps[nextIndex]);
          return nextIndex;
        });
      }, 4000);

      const progressInterval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 95) {
            return prev;
          }

          let increment;
          if (prev < 30) {
            increment = Math.random() * 2 + 1;
          } else if (prev < 60) {
            increment = Math.random() * 1.5 + 0.5;
          } else if (prev < 85) {
            increment = Math.random() * 1 + 0.3;
          } else {
            increment = Math.random() * 0.5 + 0.1;
          }

          return Math.min(prev + increment, 95);
        });
      }, 800);

      return () => {
        clearInterval(stepInterval);
        clearInterval(progressInterval);
      };
    }
  }, [isProcessing]);
  useEffect(() => {
    if (!isProcessing && progress > 0) {
      setStatusText(t("loader.analysis_completed"));

      const remainingProgress = 100 - progress;
      const animationSteps = 20;
      const increment = remainingProgress / animationSteps;
      let currentProgress = progress;

      const finalAnimation = setInterval(() => {
        currentProgress += increment;
        if (currentProgress >= 100) {
          setProgress(100);
          clearInterval(finalAnimation);

          setTimeout(() => {
            onComplete();
          }, 1500);
        } else {
          setProgress(currentProgress);
        }
      }, 50);

      return () => clearInterval(finalAnimation);
    }
  }, [isProcessing, onComplete, progress]);

  return (
    <Card className="mx-auto my-12 w-full max-w-3xl bg-white p-6">
      <div className="mx-auto w-full max-w-3xl p-6 text-center">
        <div className="relative mx-auto mb-6 h-50 w-53 rounded-xl bg-white">
          <AnimationLoader />
        </div>

        <div className="mx-auto mb-4 w-max font-semibold text-gray-500 text-sm uppercase tracking-wider">
          <span className="inline-block transition-opacity duration-500">
            {statusText}
          </span>
        </div>

        <div className="mb-6 min-h-[60px] font-semibold text-gray-800 text-xl md:text-2xl">
          <Typewriter
            key={question}
            onInit={(typewriter) => {
              typewriter.typeString(question).start();
            }}
            options={{
              loop: true,
              delay: 50,
              cursor: "",
            }}
          />
        </div>

        <div className="h-4 w-full overflow-hidden rounded-full bg-gray-200">
          <div
            className="h-4 rounded-full bg-gradient-to-r from-teal-500 to-teal-600 transition-all duration-1000 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="mt-4 text-center font-bold text-2xl text-teal-700 transition-all duration-300">
          {Math.round(progress)}%
        </p>
      </div>
    </Card>
  );
}
