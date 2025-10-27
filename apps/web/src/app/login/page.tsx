"use client";

import { useState } from "react";
import SignInForm from "@/components/Auth/sign-in-form";
import SignUpForm from "@/components/Auth/sign-up-form";
import { useI18n } from "@/hooks/use-i18n";
import { usePageMetadata } from "@/hooks/use-page-metadata";

export default function LoginPage() {
  const [showSignIn, setShowSignIn] = useState(true);
  const { t } = useI18n();

  usePageMetadata(t("meta.login.title"), t("meta.login.description"));

  return showSignIn ? (
    <SignInForm onSwitchToSignUp={() => setShowSignIn(false)} />
  ) : (
    <SignUpForm onSwitchToSignIn={() => setShowSignIn(true)} />
  );
}
