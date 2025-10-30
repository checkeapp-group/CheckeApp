"use client";

import { useState } from "react";
import TextInputForm from "@/components/TextInputForm";
import VerificationsHome from "@/components/VerificationsHome";
import { useI18n } from "@/hooks/use-i18n";
import { usePageMetadata } from "@/hooks/use-page-metadata";
import { useAppRouter } from "@/lib/router";

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
    <div className="mx-auto flex max-w-4xl flex-col gap-5 px-4 py-8 sm:px-6 lg:px-8">
      {/* <div className="mb-8 text-center">
                <h1 className="mb-4 animate-gradient bg-clip-text font-extrabold text-transparent text-xl">
                    {t("home.title")}
                </h1>
            </div> */}

      <div className="w-full space-y-4">
        <TextInputForm
          onSuccess={handleSuccess}
          onTextChange={setText}
          text={text}
        />
      </div>
      <PreviousVerifications />
    </div>
  );
}
