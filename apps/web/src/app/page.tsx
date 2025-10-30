"use client";

import { useState } from "react";
import TextInputForm from "@/components/TextInputForm";
import VerificationsHome from "@/components/VerificationsHome";
import { useI18n } from "@/hooks/use-i18n";
import { usePageMetadata } from "@/hooks/use-page-metadata";
import { useAppRouter } from "@/lib/router";
import Image from "next/image";
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
		<div className="w-full my-14 space-y-4 text-justify">
			<h1 className="text-5xl gradient-title-green uppercase font-bold">Sobre CheckeApp</h1>
			
			<div className="space-y-4 text-neutral-600">
				<p className="text-lg">
					<b>CheckeApp</b> es una plataforma web española de <b>verificación de información</b> y de código abierto basada en <b>inteligencia artificial</b>.
				</p>
				<p className="text-lg">
					Su objetivo es ofrecer una <b>herramienta transparente, ética y accesible</b> para combatir la desinformación sin depender de infraestructuras o tecnologías externas.
				</p>
				<p className="text-lg">
					<b>CheckeApp</b> forma parte del marco estratégico del proyecto <b>ILENIA</b> (Impulso de las Lenguas en Inteligencia Artificial), una iniciativa nacional cuya misión es fortalecer las lenguas oficiales de España en el ámbito digital y de la IA. 
				</p>
				

			</div>
			<div className="flex flex-col gap-3 lg:grid grid-cols-2 mt-24">
				<div className="flex justify-center items-center">
					<Image 
						src={IleniaLogo}
						alt="ILENIA Logo"
					/>
				</div>
				<div className="flex justify-center items-center border-s lg:border-neutral-200">
					<Image 
						src={LatxaLogo}
						alt="ILENIA Logo"
						className="w-[128px]"
					/>
				</div>

			</div>
		</div>
      </div>
  );
}
