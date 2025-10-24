"use client";

import { useEffect } from "react";
import { useGlobalLoader } from "@/hooks/use-global-loader";
import { authClient } from "@/lib/auth-client";
import { useAppRouter } from "@/lib/router";

type AuthGuardProps = {
  children: React.ReactNode;
  openAuthModal?: () => void;
};

export default function AuthGuard({ children }: AuthGuardProps) {
  const { data: session, isPending } = authClient.useSession();
  const { navigate } = useAppRouter();

  useGlobalLoader(isPending, "auth-guard");

  useEffect(() => {
    if (!(isPending || session)) {
      navigate("/");
    }
  }, [isPending, session, navigate]);

  if (isPending) {
    return null;
  }

  if (session) {
    return <>{children}</>;
  }

  return null;
}
