"use client";

import AuthGuard from "@/components/Auth/auth-guard";
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
    <div className="container mx-auto py-8">
      <h1 className="m-3 mb-6 font-bold text-3xl">
        {t("verifications.title")}
      </h1>
      <VerificationsList />
    </div>
  );
}

export default function VerificationsPage() {
  return (
    <AuthGuard>
      <VerificationsPageContent />
    </AuthGuard>
  );
}
