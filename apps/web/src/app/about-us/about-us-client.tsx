"use client";

import Head from "next/head";
import { useI18n } from "@/hooks/use-i18n";

export default function AboutUsPage() {
  const { t } = useI18n();

  return (
    <>
      <Head>
        <title>{t("about.meta.title", { title: t("app.title") })}</title>
        <meta content={t("about.meta.description")} name="description" />
      </Head>

      <main>
        <section className="relative z-10 w-full px-6 py-10 sm:px-8 lg:px-12">
          <article
            aria-labelledby="about-us-title"
            className="mx-auto max-w-3xl leading-relaxed"
          >
            <header className="mb-10 text-center">
              <h1
                className="font-bold text-3xl sm:text-4xl"
                id="about-us-title"
              >
                {t("about.pageTitle")}
              </h1>
            </header>

            <div className="space-y-6">
              <p className="text-[var(--color-text)]">
                {t("about.paragraph1")}{" "}
                <a
                  className="text-blue-600 underline hover:text-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-400 dark:text-blue-400 dark:hover:text-blue-300"
                  href="https://linkedin.com/in/iker-garcía-ferrero-75343b172/"
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  {t("about.ikerName")}
                </a>{" "}
                {t("about.and")}{" "}
                <a
                  className="text-blue-600 underline hover:text-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-400 dark:text-blue-400 dark:hover:text-blue-300"
                  href="https://surlabs.com/"
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  {t("about.surlabs")}
                </a>
                {t("about.paragraph1End")}
              </p>

              <p className="text-[var(--color-text)]">
                {t("about.paragraph2")}
              </p>

              <p className="text-[var(--color-text)]">
                {t("about.paragraph3")}
              </p>

              <p className="text-[var(--color-text)]">
                {t("about.paragraph4")}
              </p>
            </div>
          </article>
        </section>
      </main>
    </>
  );
}
