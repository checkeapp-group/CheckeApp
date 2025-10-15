'use client';

import { useEffect } from 'react';
import { authClient } from '@/lib/auth-client';

type AuthGuardProps = {
  children: React.ReactNode;
  openAuthModal?: () => void;
};

export default function AuthGuard({ children, openAuthModal }: AuthGuardProps) {
  const { data: session, isPending } = authClient.useSession();

  useEffect(() => {
    if (!(isPending || session) && openAuthModal) {
      openAuthModal();
    }
  }, [isPending, session, openAuthModal]);

  if (session) {
    return <>{children}</>;
  }

  return null;
}
