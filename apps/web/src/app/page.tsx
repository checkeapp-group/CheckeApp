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
    <div className="mx-auto flex max-w-4xl flex-col gap-5 px-4 py-6 sm:px-6 lg:px-8 mb-10">
        {/* <div className="mb-8 text-center">
                <h1 className="mb-4 animate-gradient bg-clip-text font-extrabold text-transparent text-xl">
                    {t("home.title")}
                </h1>
            </div> */}

        <div className="w-full space-y-4">
        	<div className="md:text-5xl py-2 text-center text-2xl font-extrabold mb-8 uppercase gradient-title-green items-center gap-4 w-full">
				<div className="inline-block">
					<span className="inline-block md:me-4 me-3">
						<span className="relative flex md:size-6 size-4 shrink-0 md:translate-y-[-3px]">
							<span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#83d59a] opacity-75"></span>
							<span className="relative inline-flex md:size-6 size-4 rounded-full bg-[#83d59a]"></span>
						</span>
					</span>
					<span>REALIZA UNA VERIFICACIÓN</span>
				</div>
			</div>
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
