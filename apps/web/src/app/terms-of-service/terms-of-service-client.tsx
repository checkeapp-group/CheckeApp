"use client";

import Head from "next/head";
import { useI18n } from "@/hooks/use-i18n";

export default function TermsOfServiceClient() {
  const { t } = useI18n();

  return (
    <>
      <Head>
        <title>{t("terms.meta.title", { title: t("app.title") })}</title>
        <meta content={t("terms.meta.description")} name="description" />
      </Head>
      <main>
        <section className="relative z-10 w-full px-6 py-10 sm:px-8 lg:px-12">
          <article
            aria-labelledby="terms-of-service-title"
            className="mx-auto max-w-3xl leading-relaxed"
          >
            <header className="mb-10 text-center">
              <h1
                className="font-bold text-3xl sm:text-4xl"
                id="terms-of-service-title"
              >
                {t("terms.pageTitle")}
              </h1>
            </header>

            <section className="space-y-8">
              <div>
                <h2 className="font-semibold text-2xl">
                  {t("terms.section1.title")}
                </h2>
                <p className="text-[var(--color-text)]">
                  {t("terms.section1.text")}
                </p>
              </div>

              <div>
                <h2 className="font-semibold text-2xl">
                  {t("terms.section2.title")}
                </h2>
                <p className="text-[var(--color-text)]">
                  {t("terms.section2.intro")}
                </p>
                <ul className="ml-6 list-disc space-y-1">
                  <li className="text-[var(--color-text)]">
                    {t("terms.section2.item1")}
                  </li>
                  <li className="text-[var(--color-text)]">
                    {t("terms.section2.item2")}
                  </li>
                  <li className="text-[var(--color-text)]">
                    {t("terms.section2.item3")}
                  </li>
                  <li className="text-[var(--color-text)]">
                    {t("terms.section2.item4")}
                  </li>
                </ul>
              </div>

              <div>
                <h2 className="font-semibold text-2xl">
                  {t("terms.section3.title")}
                </h2>
                <h3 className="mt-4 font-semibold text-xl">
                  {t("terms.section3.subtitle1")}
                </h3>
                <p className="text-[var(--color-text)]">
                  {t("terms.section3.text1")}
                </p>
                <p className="text-[var(--color-text)]">
                  {t("terms.section3.text2")}
                </p>

                <h3 className="mt-4 font-semibold text-xl">
                  {t("terms.section3.subtitle2")}
                </h3>
                <p className="text-[var(--color-text)]">
                  {t("terms.section3.disclaimer.intro")}
                </p>
                <ul className="ml-6 list-disc space-y-1">
                  <li className="text-[var(--color-text)]">
                    {t("terms.section3.disclaimer.item1")}
                  </li>
                  <li className="text-[var(--color-text)]">
                    {t("terms.section3.disclaimer.item2")}
                  </li>
                  <li className="text-[var(--color-text)]">
                    {t("terms.section3.disclaimer.item3")}
                  </li>
                  <li className="text-[var(--color-text)]">
                    {t("terms.section3.disclaimer.item4")}
                  </li>
                  <li className="text-[var(--color-text)]">
                    {t("terms.section3.disclaimer.item5")}
                  </li>
                </ul>

                <h3 className="mt-4 font-semibold text-xl">
                  {t("terms.section3.subtitle3")}
                </h3>
                <p className="text-[var(--color-text)]">
                  {t("terms.section3.modifications")}
                </p>
              </div>

              <div>
                <h2 className="font-semibold text-2xl">
                  {t("terms.section4.title")}
                </h2>
                <h3 className="mt-4 font-semibold text-xl">
                  {t("terms.section4.subtitle1")}
                </h3>
                <p className="text-[var(--color-text)]">
                  {t("terms.section4.text1")}
                </p>

                <h3 className="mt-4 font-semibold text-xl">
                  {t("terms.section4.subtitle2")}
                </h3>
                <p className="text-[var(--color-text)]">
                  {t("terms.section4.text2")}
                </p>

                <h3 className="mt-4 font-semibold text-xl">
                  {t("terms.section4.subtitle3")}
                </h3>
                <p className="text-[var(--color-text)]">
                  {t("terms.section4.text3")}
                </p>
              </div>

              <div>
                <h2 className="font-semibold text-2xl">
                  {t("terms.section5.title")}
                </h2>
                <p className="text-[var(--color-text)]">
                  {t("terms.section5.text")}
                </p>
              </div>

              <div>
                <h2 className="font-semibold text-2xl">
                  {t("terms.section6.title")}
                </h2>
                <p className="text-[var(--color-text)]">
                  {t("terms.section6.text")}{" "}
                  <a
                    className="text-blue-600 underline hover:text-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-400 dark:text-blue-400 dark:hover:text-blue-300"
                    href="/privacy-policy"
                  >
                    {t("terms.section6.link")}
                  </a>
                  .
                </p>
              </div>

              <div>
                <h2 className="font-semibold text-2xl">
                  {t("terms.section7.title")}
                </h2>
                <p className="text-[var(--color-text)]">
                  {t("terms.section7.text")}
                </p>
              </div>

              <div>
                <h2 className="font-semibold text-2xl">
                  {t("terms.section8.title")}
                </h2>
                <ul className="ml-6 list-disc space-y-1">
                  <li className="text-[var(--color-text)]">
                    {t("terms.section8.item1")}
                  </li>
                  <li className="text-[var(--color-text)]">
                    {t("terms.section8.item2")}
                  </li>
                  <li className="text-[var(--color-text)]">
                    {t("terms.section8.item3")}
                  </li>
                </ul>
              </div>
            </section>
          </article>
        </section>
      </main>
    </>
  );
}
