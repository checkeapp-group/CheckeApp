"use client";

import { useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useGlobalLoader } from "@/hooks/use-global-loader";
import { useAppRouter } from "@/lib/router";

type AdminGuardProps = {
  children: React.ReactNode;
};

// Route guard component that restricts access to admin users only
export default function AdminGuard({ children }: AdminGuardProps) {
  const { user, isLoading } = useAuth();
  const { navigate } = useAppRouter();

  useGlobalLoader(isLoading, "admin-guard");

  useEffect(() => {
    if (!(isLoading || user?.isAdmin)) {
      navigate("/");
    }
  }, [isLoading, user, navigate]);

  if (isLoading) {
    return null;
  }

  if (user?.isAdmin) {
    return <>{children}</>;
  }

  return null;
}
