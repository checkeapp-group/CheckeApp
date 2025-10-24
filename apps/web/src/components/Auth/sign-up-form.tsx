"use client";

import { Field, Fieldset, Input, Label } from "@headlessui/react";
import { useForm } from "@tanstack/react-form";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { useAuthNavigation } from "@/hooks/use-auth-navigation";
import { useGlobalLoader } from "@/hooks/use-global-loader";
import { useI18n } from "@/hooks/use-i18n";
import { authClient } from "@/lib/auth-client";

const GoogleIcon = () => (
  <svg
    className="mr-2 h-4 w-4"
    viewBox="0 0 48 48"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C12.955 4 4 12.955 4 24s8.955 20 20 20s20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"
      fill="#FFC107"
    />
    <path
      d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C16.318 4 9.656 8.337 6.306 14.691z"
      fill="#FF3D00"
    />
    <path
      d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238C29.211 35.091 26.715 36 24 36c-5.222 0-9.618-3.226-11.283-7.582l-6.522 5.025C9.505 39.556 16.227 44 24 44z"
      fill="#4CAF50"
    />
    <path
      d="M43.611 20.083H24v8h11.303c-.792 2.237-2.231 4.166-4.087 5.571l6.19 5.238C42.012 36.49 44 30.686 44 24c0-1.341-.138-2.65-.389-3.917z"
      fill="#1976D2"
    />
  </svg>
);

type SignUpFormProps = {
  onSwitchToSignIn: () => void;
  onClose?: () => void;
};

export default function SignUpForm({
  onSwitchToSignIn,
  onClose,
}: SignUpFormProps) {
  const { signUp } = useAuthNavigation();
  const { isPending } = authClient.useSession();
  const { t } = useI18n();

  useGlobalLoader(isPending, "sign-up-form");

  const form = useForm({});

  if (isPending) {
    return null;
  }

  return (
    <div className="... relative overflow-hidden">
      <div className="px-6 py-8 sm:px-8 sm:py-10">
        <div className="mb-6 text-center">
          <h1 className="... font-bold">{t("auth.SignUp.title")}</h1>
          <p className="... mt-2">{t("auth.signUp.description")}</p>
        </div>

        <form className="space-y-6" onSubmit={(e) => {}}></form>

        <div className="relative my-6">
          <div
            aria-hidden="true"
            className="absolute inset-0 flex items-center"
          >
            <div className="w-full border-border border-t" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="bg-white px-2 text-muted-foreground">
              O regístrate con
            </span>
          </div>
        </div>

        <div>
          <Button
            className="w-full"
            onClick={() => authClient.signIn.social({ provider: "google" })}
            variant="outline"
          >
            <GoogleIcon />
            Google
          </Button>
        </div>

        <div className="mt-6 text-center">
          <Button
            className="font-semibold text-sm"
            onClick={onSwitchToSignIn}
            variant="link"
          >
            {t("auth.signIn.cta")}
          </Button>
        </div>
      </div>
    </div>
  );
}
