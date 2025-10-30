"use client";

import { Suspense } from "react";
import SignInForm from "@/components/Auth/sign-in-form";
import { useI18n } from "@/hooks/use-i18n";
import { usePageMetadata } from "@/hooks/use-page-metadata";

export default function LoginPage() {
  const { t } = useI18n();

  usePageMetadata(t("meta.login.title"), t("meta.login.description"));

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SignInForm />
    </Suspense>
  );
}
