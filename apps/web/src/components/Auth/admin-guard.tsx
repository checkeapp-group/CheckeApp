"use client";

import { useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useAppRouter } from "@/lib/router";
import Loader from "../loader";

type AdminGuardProps = {
  children: React.ReactNode;
};


export default function AdminGuard({ children }: AdminGuardProps) {
  const { user, isLoading } = useAuth();
  const { navigate } = useAppRouter();

  useEffect(() => {
    if (!(isLoading || user?.isAdmin)) {
      navigate("/");
    }
  }, [isLoading, user, navigate]);

  if (isLoading) {
    return <Loader />;
  }

  if (user?.isAdmin) {
    return <>{children}</>;
  }

  return null;
}
