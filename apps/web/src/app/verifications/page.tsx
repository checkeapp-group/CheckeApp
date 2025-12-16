"use client";

import { Suspense } from "react";
import VerificationsList from "@/components/VerificationsList";
import { useI18n } from "@/hooks/use-i18n";
import { usePageMetadata } from "@/hooks/use-page-metadata";

function VerificationsPageContent() {
  const { t } = useI18n();

  usePageMetadata(
    t("meta.verifications.title"),
    t("meta.verifications.description")
  );

  return (
    <div className="relative mx-auto max-w-7xl overflow-hidden p-4 text-foreground sm:p-6 lg:p-8">
      <h1 className="m-3 mb-6 font-bold text-3xl">
        {t("verifications.title")}
      </h1>
      <Suspense fallback={<div>Loading...</div>}>
        <VerificationsList />
      </Suspense>
    </div>
  );
}

// Public verifications list page with search and filtering
export default function VerificationsPage() {
  return <VerificationsPageContent />;
}
