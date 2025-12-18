"use client";

import Image from "next/image";
import {Suspense, useState} from "react";
import TextInputForm from "@/components/TextInputForm";
import VerificationsHome from "@/components/VerificationsHome";
import {useI18n} from "@/hooks/use-i18n";
import {usePageMetadata} from "@/hooks/use-page-metadata";
import {useAppRouter} from "@/lib/router";
import IleniaLogo from "@/public/ilenia_logo.svg";
import LatxaLogo from "@/public/latxa_logo.webp";

function PreviousVerifications() {
    return <VerificationsHome />;
}

// Homepage with text input form for starting new verifications
export default function HomePage() {
    const {t} = useI18n();
    const [text, setText] = useState("");
    const {navigate} = useAppRouter();

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
            <div className="my-14 w-full space-y-4 relative text-justify border border-neutral-200 lg:p-14 p-8 bg-gradient-to-br from-white to-neutral-100 shadow-sm rounded-lg">
                <div className="absolute opacity-30 top-10 right-10 hidden lg:block">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        version="1.1"
                        width="64"
                        height="64"
                        x="0"
                        y="0"
                        viewBox="0 0 60 60">
                        <g>
                            <g fill="#000" fill-rule="nonzero">
                                <path
                                    d="M3 53h2v2a3 3 0 0 0 3 3h38.84a1 1 0 0 0 0-2H8a1 1 0 0 1-1-1v-2h17.78a1 1 0 0 0 0-2H3a1 1 0 0 1-1-1V16h11a3 3 0 0 0 3-3V2h27a1 1 0 0 1 1 1v15.26a1 1 0 0 0 2 0V7h2a1 1 0 0 1 1 1v12.99a1 1 0 0 0 2 0V8a3 3 0 0 0-3-3h-2V3a3 3 0 0 0-3-3H15a1 1 0 0 0-.707.293l-14 14A1 1 0 0 0 0 15v35a3 3 0 0 0 3 3zm10-39H3.414L14 3.414V13a1 1 0 0 1-1 1z"
                                    fill="#000000"
                                    opacity="1"
                                    data-original="#000000"></path>
                                <path
                                    d="M5 42a1 1 0 0 0-1 1v5a1 1 0 0 0 1 1h5a1 1 0 0 0 0-2H6v-4a1 1 0 0 0-1-1zM41 11a1 1 0 0 0 1-1V5a1 1 0 0 0-1-1h-5a1 1 0 0 0 0 2h4v4a1 1 0 0 0 1 1zM38 54a16.9 16.9 0 0 0 8.058-2.026l6.8 6.806a4.19 4.19 0 0 0 5.922-5.928l-6.553-6.544A17 17 0 1 0 38 54zm19.36.264a2.19 2.19 0 1 1-3.092 3.1l-6.474-6.484a17.256 17.256 0 0 0 2.227-1.859c.35-.351.676-.72.992-1.094zm-29.966-27.87A15 15 0 1 1 23 37a14.9 14.9 0 0 1 4.394-10.606z"
                                    fill="#000000"
                                    opacity="1"
                                    data-original="#000000"></path>
                                <path
                                    d="M31.534 46.777a2.01 2.01 0 0 0 2.715.1l15.462-13.25a2 2 0 0 0 .218-2.819l-1.3-1.521a2 2 0 0 0-2.818-.216L33.157 39.914l-2.743-2.742a2 2 0 0 0-2.828 0l-1.414 1.414a2 2 0 0 0 0 2.828l5.361 5.362zM29 38.586l3.4 3.4a1 1 0 0 0 1.358.052l13.35-11.449 1.3 1.519-15.461 13.254L27.586 40zM6 22h18a1 1 0 0 0 0-2H6a1 1 0 0 0 0 2zM22.99 25a1 1 0 0 0-1-1H6a1 1 0 0 0 0 2h15.99a1 1 0 0 0 1-1zM20.66 29a1 1 0 0 0-1-1H6a1 1 0 0 0 0 2h13.66a1 1 0 0 0 1-1zM19.4 33a1 1 0 0 0-1-1H6a1 1 0 0 0 0 2h12.4a1 1 0 0 0 1-1zM19 37a1 1 0 0 0-1-1H6a1 1 0 0 0 0 2h12a1 1 0 0 0 1-1z"
                                    fill="#000000"
                                    opacity="1"
                                    data-original="#000000"></path>
                            </g>
                        </g>
                    </svg>
                </div>

                <h1 className="gradient-title-green font-bold lg:text-5xl text-3xl uppercase lg:mb-8">
                    {t("home.aboutTitle")}
                </h1>

                <div className="space-y-4 text-neutral-600 text-lg">
                    <p>
                        <b>CheckeApp</b>{" "}
                        {t("home.aboutParagraph1").replace("CheckeApp ", "")}
                    </p>
                    <p>{t("home.aboutParagraph2")}</p>
                    <p>
                        <b>CheckeApp</b>{" "}
                        {t("home.aboutParagraph3").replace("CheckeApp ", "")}
                    </p>
                </div>
                <div className="mt-12 flex grid-cols-2 flex-col gap-12 lg:gap-3 lg:grid">
                    <div className="flex items-center justify-center">
                        <Image alt="ILENIA Logo" src={IleniaLogo} />
                    </div>
                    <div className="flex items-center justify-center border-s border-transparent lg:border-neutral-200 ">
                        <Image
                            alt="ILENIA Logo"
                            className="w-[128px]"
                            src={LatxaLogo}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
