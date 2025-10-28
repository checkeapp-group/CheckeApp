"use client";

import Head from "next/head";
import { useI18n } from "@/hooks/use-i18n";

export default function LegalNoticePage() {
  const { t } = useI18n();

  return (
    <>
      <Head>
        <title>{t("legal.meta.title", { title: t("app.title") })}</title>
        <meta content={t("legal.meta.description")} name="description" />
      </Head>

      <main>
        <section className="relative z-10 w-full px-6 py-10 sm:px-8 lg:px-12">
          <article
            aria-labelledby="legal-notice-title"
            className="mx-auto max-w-3xl leading-relaxed"
          >
            <header className="mb-10 text-center">
              <h1
                className="font-bold text-3xl sm:text-4xl"
                id="legal-notice-title"
              >
                {t("legal.pageTitle")}
              </h1>
            </header>

            <section className="space-y-8">
              <div>
                <h2 className="font-semibold text-2xl">
                  {t("legal.ownerData.title")}
                </h2>
                <p className="text-[var(--color-text)]">
                  {t("legal.ownerData.intro")}{" "}
                  <a
                    className="text-blue-600 underline hover:text-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    href="https://linkedin.com/in/iker-garcía-ferrero-75343b172/"
                    rel="noopener noreferrer"
                    target="_blank"
                  >
                    {t("legal.ownerData.ikerName")}
                  </a>{" "}
                  {t("legal.ownerData.and")}{" "}
                  <a
                    className="text-blue-600 underline hover:text-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    href="https://surlabs.com/"
                    rel="noopener noreferrer"
                    target="_blank"
                  >
                    {t("legal.ownerData.surlabs")}
                  </a>
                  .
                </p>
                <address className="not-italic text-[var(--color-text)]">
                  <strong>{t("legal.ownerData.owner")}</strong>{" "}
                  {t("legal.ownerData.ownerName")}
                  <br />
                  <strong>{t("legal.ownerData.address")}</strong>{" "}
                  {t("legal.ownerData.addressValue")}
                  <br />
                  <strong>{t("legal.ownerData.cif")}</strong>{" "}
                  {t("legal.ownerData.cifValue")}
                  <br />
                  <strong>{t("legal.ownerData.email")}</strong>{" "}
                  <a
                    className="text-blue-600 underline hover:text-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-400 dark:text-blue-400 dark:hover:text-blue-300"
                    href={`mailto:${t("legal.ownerData.emailValue")}`}
                  >
                    {t("legal.ownerData.emailValue")}
                  </a>
                </address>
              </div>

              <div>
                <h2 className="font-semibold text-2xl">
                  {t("legal.purpose.title")}
                </h2>
                <p className="text-[var(--color-text)]">{t("legal.purpose.text")}</p>
              </div>

              <div>
                <h2 className="font-semibold text-2xl">
                  {t("legal.use.title")}
                </h2>
                <p className="text-[var(--color-text)]">{t("legal.use.text")}</p>
              </div>

              <div>
                <h2 className="font-semibold text-2xl">
                  {t("legal.content.title")}
                </h2>

                <h3 className="font-semibold text-xl">
                  {t("legal.content.verifications.title")}
                </h3>
                <p className="text-[var(--color-text)]">{t("legal.content.verifications.text")}</p>

                <h3 className="font-semibold text-xl">
                  {t("legal.content.exemption.title")}
                </h3>
                <p className="text-[var(--color-text)]">{t("legal.content.exemption.text")}</p>

                <h3 className="font-semibold text-xl">
                  {t("legal.content.modifications.title")}
                </h3>
                <p className="text-[var(--color-text)]">{t("legal.content.modifications.text")}</p>
              </div>

              <div>
                <h2 className="font-semibold text-2xl">
                  {t("legal.ip.title")}
                </h2>

                <h3 className="font-semibold text-xl">
                  {t("legal.ip.license.title")}
                </h3>
                <p className="text-[var(--color-text)]">{t("legal.ip.license.text")}</p>

                <h3 className="font-semibold text-xl">
                  {t("legal.ip.trademarks.title")}
                </h3>
                <p className="text-[var(--color-text)]">{t("legal.ip.trademarks.text")}</p>

                <h3 className="font-semibold text-xl">
                  {t("legal.ip.exceptions.title")}
                </h3>
                <p className="text-[var(--color-text)]">{t("legal.ip.exceptions.text")}</p>
              </div>

              <div>
                <h2 className="font-semibold text-2xl">
                  {t("legal.links.title")}
                </h2>
                <p className="text-[var(--color-text)]">{t("legal.links.text")}</p>
              </div>

              <div>
                <h2 className="font-semibold text-2xl">
                  {t("legal.dataProtection.title")}
                </h2>
                <p className="text-[var(--color-text)]">
                  {t("legal.dataProtection.text")}{" "}
                  <a
                    className="text-blue-600 underline hover:text-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    href="/privacy-policy"
                  >
                    {t("legal.dataProtection.privacyLink")}
                  </a>
                  .
                </p>
              </div>

              <div>
                <h2 className="font-semibold text-2xl">
                  {t("legal.cookies.title")}
                </h2>
                <p className="text-[var(--color-text)]">
                  {t("legal.cookies.text")}{" "}
                  <a
                    className="text-blue-600 underline hover:text-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    href="/cookies-policy"
                  >
                    {t("legal.cookies.link")}
                  </a>
                  .
                </p>
              </div>

              <div>
                <h2 className="font-semibold text-2xl">
                  {t("legal.jurisdiction.title")}
                </h2>
                <p className="text-[var(--color-text)]">{t("legal.jurisdiction.text")}</p>
              </div>

              <div>
                <h2 className="font-semibold text-2xl">
                  {t("legal.contact.title")}
                </h2>
                <p className="text-[var(--color-text)]">{t("legal.contact.text")}</p>
              </div>
            </section>
          </article>
        </section>
      </main>
    </>
  );
}
