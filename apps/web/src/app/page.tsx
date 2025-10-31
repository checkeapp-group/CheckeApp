"use client";

import Image from "next/image";
import { Suspense, useState } from "react";
import TextInputForm from "@/components/TextInputForm";
import VerificationsHome from "@/components/VerificationsHome";
import { useI18n } from "@/hooks/use-i18n";
import { usePageMetadata } from "@/hooks/use-page-metadata";
import { useAppRouter } from "@/lib/router";
import IleniaLogo from "@/public/ilenia_logo.svg";
import LatxaLogo from "@/public/latxa_logo.webp";

function PreviousVerifications() {
  return <VerificationsHome />;
}

export default function HomePage() {
  const { t } = useI18n();
  const [text, setText] = useState("");
  const { navigate } = useAppRouter();

  usePageMetadata(t("meta.home.title"), t("meta.home.description"));

  const handleSuccess = (verificationId: string) => {
    navigate(`/verify/${verificationId}/edit`);
  };

  return (
    <div className="mx-auto mb-10 flex max-w-4xl flex-col gap-5 px-4 py-6 sm:px-6 lg:px-8">
      {/* <div className="mb-8 text-center">
                <h1 className="mb-4 animate-gradient bg-clip-text font-extrabold text-transparent text-xl">
                    {t("home.title")}
                </h1>
            </div> */}

      <div className="w-full space-y-4">
        <div className="gradient-title-green mb-8 w-full items-center gap-4 py-2 text-center font-extrabold text-2xl uppercase md:text-5xl">
          <div className="inline-block">
            <span className="me-3 inline-block md:me-4">
              <span className="relative flex size-4 shrink-0 md:size-6 md:translate-y-[-3px]">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#83d59a] opacity-75" />
                <span className="relative inline-flex size-4 rounded-full bg-[#83d59a] md:size-6" />
              </span>
            </span>
            <span>{t("home.performVerification")}</span>
          </div>
        </div>
        <TextInputForm
          onSuccess={handleSuccess}
          onTextChange={setText}
          text={text}
        />
      </div>
      <Suspense fallback={<div>{t("home.loadingVerifications")}</div>}>
        <PreviousVerifications />
      </Suspense>
      <div className="my-14 w-full space-y-4 text-justify">
        <h1 className="gradient-title-green font-bold text-5xl uppercase">
          {t("home.aboutTitle")}
        </h1>

        <div className="space-y-4 text-neutral-600">
          <p className="text-lg">
            <b>CheckeApp</b> {t("home.aboutParagraph1").replace("CheckeApp ", "")}
          </p>
          <p className="text-lg">
            {t("home.aboutParagraph2")}
          </p>
          <p className="text-lg">
            <b>CheckeApp</b> {t("home.aboutParagraph3").replace("CheckeApp ", "")}
          </p>
        </div>
        <div className="mt-24 flex grid-cols-2 flex-col gap-3 lg:grid">
          <div className="flex items-center justify-center">
            <Image alt="ILENIA Logo" src={IleniaLogo} />
          </div>
          <div className="flex items-center justify-center border-s lg:border-neutral-200">
            <Image alt="ILENIA Logo" className="w-[128px]" src={LatxaLogo} />
          </div>
        </div>
      </div>
    </div>
  );
}
