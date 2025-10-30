"use client";
"use client";

import { useEffect } from "react";
import { run } from "vanilla-cookieconsent";
import "vanilla-cookieconsent/dist/cookieconsent.css";
import { useI18n } from "@/hooks/use-i18n";

declare global {
  interface Window {
    cc: any;
  }
}

export default function CookieConsentComponent() {
  const { t } = useI18n();

  useEffect(() => {
    if (window.cc) {
      return;
    }

    run({
      guiOptions: {
        consentModal: {
          layout: "box",
          position: "bottom left",
          equalWeightButtons: true,
          flipButtons: false,
        },
        preferencesModal: {
          layout: "box",
          position: "right",
          equalWeightButtons: true,
          flipButtons: false,
        },
      },
      categories: {
        necessary: {
          readOnly: true,
          enabled: true,
        },
        analytics: {
          autoClear: {
            cookies: [
              { name: /^better-auth.session_token/ },
              { name: "better-auth.state" },
              { name: "cc_cookie" },
              { name: "__next_hmr_refresh_hash__" },
            ],
          },
        },
      },
      language: {
        default: "es",
        translations: {
          es: {
            consentModal: {
              title: t("cookies.modalTitle"),
              description: t("cookies.modalDescription"),
              acceptAllBtn: t("cookies.acceptAll"),
              acceptNecessaryBtn: t("cookies.acceptNecessary"),
              showPreferencesBtn: t("cookies.showPreferences"),
              footer: `
                <a href="/legal-notice" target="_blank">${t(
                  "nav.legalAdvice"
                )}</a>
                <a href="/privacy-policy" target="_blank">${t(
                  "nav.privacyPolicy"
                )}</a>
                <a href="/cookies-policy" target="_blank">${t(
                  "nav.cookiesPolicy"
                )}</a>
              `,
            },
            preferencesModal: {
              title: t("cookies.preferencesTitle"),
              acceptAllBtn: t("cookies.acceptAll"),
              acceptNecessaryBtn: t("cookies.acceptNecessary"),
              savePreferencesBtn: t("cookies.savePreferences"),
              closeIconLabel: t("common.closeModal"),
              sections: [
                {
                  title: t("cookies.usageTitle"),
                  description: t("cookies.usageDescription"),
                },
                {
                  title: t("cookies.necessaryTitle"),
                  description: t("cookies.necessaryDescription"),
                  linkedCategory: "necessary",
                },
                {
                  title: t("cookies.analyticsTitle"),
                  description: t("cookies.analyticsDescription"),
                  linkedCategory: "analytics",
                },
                {
                  title: t("cookies.moreInfoTitle"),
                  description: `${t(
                    "cookies.moreInfoDescription"
                  )} <a href="/cookies-policy" target="_blank">${t(
                    "nav.cookiesPolicy"
                  )}</a>.`,
                },
              ],
            },
          },
        },
      },
    });
  }, [t]);

  return null;
}
