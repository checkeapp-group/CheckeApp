"use client";

import AuthGuard from "@/components/Auth/auth-guard";
import UserVerificationsList from "@/components/UserVerificationsList";
import { useI18n } from "@/hooks/use-i18n";
import { usePageMetadata } from "@/hooks/use-page-metadata";

function UserVerificationsPageContent() {
  const { t } = useI18n();

  usePageMetadata(
    t("meta.userVerifications.title"),
    t("meta.userVerifications.description")
  );

  return (
    <div className="container mx-auto py-8">
      <h1 className="m-3 mb-6 font-bold text-3xl">
        {t("user_verifications.title")}
      </h1>
      <UserVerificationsList />
    </div>
  );
}

export default function UserVerificationsPage() {
  return (
    <AuthGuard>
      <UserVerificationsPageContent />
    </AuthGuard>
  );
}
