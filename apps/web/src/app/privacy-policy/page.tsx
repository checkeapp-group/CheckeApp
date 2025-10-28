"use client";

import Head from "next/head";
import { useI18n } from "@/hooks/use-i18n";

export default function PrivacyPolicyPage() {
  const { t } = useI18n();

  return (
    <>
      {" "}
      <Head>
        {" "}
        <title>{t("privacy.meta.title", { title: t("app.title") })}</title>
        <meta content={t("privacy.meta.description")} name="description" />{" "}
      </Head>
      <main
      >
        <section className="relative z-10 w-full px-6 py-10 sm:px-8 lg:px-12">
          <article
            aria-labelledby="privacy-policy-title"
            className="mx-auto max-w-3xl leading-relaxed"
          >
            <header className="mb-10 text-center">
              <h1
                className="font-bold text-3xl sm:text-4xl"
                id="privacy-policy-title"
              >
                {t("privacy.pageTitle")}
              </h1>
            </header>

            <section className="space-y-8">
              <div>
                <h2 className="font-semibold text-2xl">
                  {t("privacy.intro.title")}
                </h2>
                <p className="text-[var(--color-text)]">{t("privacy.intro.text")}</p>
              </div>

              <div>
                <h2 className="font-semibold text-2xl">
                  {t("privacy.consent.title")}
                </h2>
                <p className="text-[var(--color-text)]">{t("privacy.consent.text")}</p>
              </div>

              <div>
                <h2 className="font-semibold text-2xl">
                  {t("privacy.collection.title")}
                </h2>
                <p className="text-[var(--color-text)]">{t("privacy.collection.text1")}</p>
                <p className="text-[var(--color-text)]">{t("privacy.collection.text2")}</p>
                <p className="text-[var(--color-text)]">{t("privacy.collection.text3")}</p>
              </div>

              <div>
                <h2 className="font-semibold text-2xl">
                  {t("privacy.usage.title")}
                </h2>
                <ul className="ml-6 list-disc space-y-1">
                  <li className="text-[var(--color-text)]">{t("privacy.usage.provide")}</li>
                  <li className="text-[var(--color-text)]">{t("privacy.usage.improve")}</li>
                  <li className="text-[var(--color-text)]">{t("privacy.usage.understand")}</li>
                  <li className="text-[var(--color-text)]">{t("privacy.usage.develop")}</li>
                  <li className="text-[var(--color-text)]">{t("privacy.usage.communicate")}</li>
                  <li className="text-[var(--color-text)]">{t("privacy.usage.sendEmails")}</li>
                  <li className="text-[var(--color-text)]">{t("privacy.usage.findFraud")}</li>
                </ul>
              </div>

              <div>
                <h2 className="font-semibold text-2xl">
                  {t("privacy.logFiles.title")}
                </h2>
                <p className="text-[var(--color-text)]">{t("privacy.logFiles.text")}</p>
              </div>

              <div>
                <h2 className="font-semibold text-2xl">
                  {t("privacy.cookies.title")}
                </h2>
                <p className="text-[var(--color-text)]">{t("privacy.cookies.text1")}</p>
                <p className="text-[var(--color-text)]">
                  {t("privacy.cookies.text2")}{" "}
                  <a
                    className="text-blue-600 underline hover:text-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-400 dark:text-blue-400 dark:hover:text-blue-300"
                    href="/cookies-policy"
                  >
                    {t("privacy.cookies.link")}
                  </a>
                  .
                </p>
              </div>

              <div>
                <h2 className="font-semibold text-2xl">
                  {t("privacy.thirdParty.title")}
                </h2>
                <p className="text-[var(--color-text)]">{t("privacy.thirdParty.text")}</p>
              </div>

              <div>
                <h2 className="font-semibold text-2xl">
                  {t("privacy.gdpr.title")}
                </h2>
                <p className="text-[var(--color-text)]">{t("privacy.gdpr.text1")}</p>
                <p className="text-[var(--color-text)]">{t("privacy.gdpr.text2")}</p>
                <p className="text-[var(--color-text)]">{t("privacy.gdpr.text3")}</p>
                <ul className="ml-6 list-disc space-y-1">
                  <li className="text-[var(--color-text)]">{t("privacy.gdpr.rightAccess")}</li>
                  <li className="text-[var(--color-text)]">{t("privacy.gdpr.rightRectification")}</li>
                  <li className="text-[var(--color-text)]">{t("privacy.gdpr.rightObject")}</li>
                  <li className="text-[var(--color-text)]">{t("privacy.gdpr.rightRestriction")}</li>
                  <li className="text-[var(--color-text)]">{t("privacy.gdpr.rightPortability")}</li>
                  <li className="text-[var(--color-text)]">{t("privacy.gdpr.rightWithdraw")}</li>
                </ul>
                <p className="text-[var(--color-text)]">{t("privacy.gdpr.text4")}</p>
              </div>

              <div>
                <h2 className="font-semibold text-2xl">
                  {t("privacy.contact.title")}
                </h2>
                <p className="text-[var(--color-text)]">
                  {t("privacy.contact.text")}{" "}
                  <a
                    className="text-blue-600 underline hover:text-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-400 dark:text-blue-400 dark:hover:text-blue-300"
                    href={`mailto:${t("privacy.contact.email")}`}
                  >
                    {t("privacy.contact.email")}
                  </a>
                  .
                </p>
              </div>
            </section>
          </article>
        </section>
      </main>
    </>
  );
}
