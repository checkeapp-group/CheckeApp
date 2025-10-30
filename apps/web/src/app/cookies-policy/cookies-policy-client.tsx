"use client";

import Head from "next/head";
import { useI18n } from "@/hooks/use-i18n";

export default function CookiesPolicyClient() {
  const { t } = useI18n();

  return (
    <>
      <Head>
        <title>{t("cookies.meta.title", { title: t("app.title") })}</title>
        <meta content={t("cookies.meta.description")} name="description" />
      </Head>

      <main>
        <section className="relative z-10 w-full px-6 py-10 sm:px-8 lg:px-12">
          <article
            aria-labelledby="cookies-policy-title"
            className="mx-auto max-w-3xl leading-relaxed"
          >
            <header className="mb-10 text-center">
              <h1
                className="font-bold text-3xl sm:text-4xl"
                id="cookies-policy-title"
              >
                {t("cookies.pageTitle")}
              </h1>
            </header>

            <section className="space-y-8">
              <div>
                <h2 className="font-semibold text-2xl">
                  {t("cookies.intro.title")}
                </h2>
                <p className="text-[var(--color-text)]">
                  {t("cookies.intro.text")}
                </p>
              </div>

              <div>
                <h2 className="font-semibold text-2xl">
                  {t("cookies.whatAre.title")}
                </h2>
                <p className="text-[var(--color-text)]">
                  {t("cookies.whatAre.text")}
                </p>
              </div>

              <div>
                <h2 className="font-semibold text-2xl">
                  {t("cookies.types.title")}
                </h2>
                <p className="text-[var(--color-text)]">
                  {t("cookies.types.text")}
                </p>

                <div className="overflow-x-auto">
                  <table className="my-4 w-full border-collapse border border-gray-300 text-left text-sm sm:text-base">
                    <thead>
                      <tr>
                        <th className="border border-gray-300 p-2 font-semibold">
                          {t("cookies.table.name")}
                        </th>
                        <th className="border border-gray-300 p-2 font-semibold">
                          {t("cookies.table.description")}
                        </th>
                        <th className="border border-gray-300 p-2 font-semibold">
                          {t("cookies.table.duration")}
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="border border-gray-300 p-2">Locale</td>
                        <td className="border border-gray-300 p-2">
                          {t("cookies.table.locale.description")}
                        </td>
                        <td className="border border-gray-300 p-2">
                          {t("cookies.table.persistent")}
                        </td>
                      </tr>
                      <tr>
                        <td className="border border-gray-300 p-2">_ga</td>
                        <td className="border border-gray-300 p-2">
                          {t("cookies.table.ga.description")}
                        </td>
                        <td className="border border-gray-300 p-2">
                          {t("cookies.table.twoYears")}
                        </td>
                      </tr>
                      <tr>
                        <td className="border border-gray-300 p-2">_ga_(id)</td>
                        <td className="border border-gray-300 p-2">
                          {t("cookies.table.gaId.description")}
                        </td>
                        <td className="border border-gray-300 p-2">
                          {t("cookies.table.twoYears")}
                        </td>
                      </tr>
                      <tr>
                        <td className="border border-gray-300 p-2">
                          cc_cookie
                        </td>
                        <td className="border border-gray-300 p-2">
                          {t("cookies.table.ccCookie.description")}
                        </td>
                        <td className="border border-gray-300 p-2">
                          {t("cookies.table.sixMonths")}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <div>
                <h2 className="font-semibold text-2xl">
                  {t("cookies.security.title")}
                </h2>
                <p className="text-[var(--color-text)]">
                  {t("cookies.security.text")}
                </p>
              </div>

              <div>
                <h2 className="font-semibold text-2xl">
                  {t("cookies.rights.title")}
                </h2>
                <p className="text-[var(--color-text)]">
                  {t("cookies.rights.intro")}
                </p>
                <ul className="ml-6 list-disc space-y-2">
                  <li className="text-[var(--color-text)]">
                    {t("cookies.rights.clearInfo")}
                  </li>
                  <li className="text-[var(--color-text)]">
                    {t("cookies.rights.manage")}
                  </li>
                  <li className="text-[var(--color-text)]">
                    {t("cookies.rights.access")}{" "}
                    <a
                      className="text-blue-600 underline hover:text-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-400 dark:text-blue-400 dark:hover:text-blue-300"
                      href="/privacy-policy"
                    >
                      {t("cookies.rights.privacyLink")}
                    </a>
                    .
                  </li>
                </ul>
              </div>

              <div>
                <h2 className="font-semibold text-2xl">
                  {t("cookies.updates.title")}
                </h2>
                <p className="text-[var(--color-text)]">
                  {t("cookies.updates.text")}
                </p>
              </div>

              <div>
                <h2 className="font-semibold text-2xl">
                  {t("cookies.contact.title")}
                </h2>
                <p className="text-[var(--color-text)]">
                  {t("cookies.contact.text")}{" "}
                  <a
                    className="text-blue-600 underline hover:text-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-400 dark:text-blue-400 dark:hover:text-blue-300"
                    href={`mailto:${t("cookies.contact.email")}`}
                  >
                    {t("cookies.contact.email")}
                  </a>{" "}
                  {t("cookies.contact.textEnd")}
                </p>
              </div>
            </section>
          </article>
        </section>
      </main>
    </>
  );
}
