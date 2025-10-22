"use client";

import { useEffect } from "react";
import { authClient } from "@/lib/auth-client";
import { useAppRouter } from "@/lib/router";
import Loader from "../loader";

type AuthGuardProps = {
  children: React.ReactNode;
  openAuthModal?: () => void;
};

export default function AuthGuard({ children }: AuthGuardProps) {
  const { data: session, isPending } = authClient.useSession();
  const { navigate } = useAppRouter();

  useEffect(() => {
    if (!(isPending || session)) {
      navigate("/");
    }
  }, [isPending, session, navigate]);

  if (isPending) {
    return <Loader />;
  }

  if (session) {
    return <>{children}</>;
  }

  return null;
}
