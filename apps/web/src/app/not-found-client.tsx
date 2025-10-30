"use client";

import Link from "next/link";
import { useI18n } from "@/hooks/use-i18n";

export default function NotFoundClient() {
  const { t } = useI18n();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center text-center">
      <h1 className="font-bold text-4xl">404 - {t("common.error")}</h1>
      <p className="mt-4 text-lg">{t("common.pageNotFound")}</p>
      <Link className="mt-6 text-primary hover:underline" href="/">
        {t("common.go_back")}
      </Link>
    </div>
  );
}
