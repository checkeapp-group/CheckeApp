'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { authClient } from '@/lib/auth-client';
import Loader from '../loader';

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const { data: session, isPending } = authClient.useSession();
  const router = useRouter();

  useEffect(() => {
    if (!(isPending || session)) {
      router.push('/login');
    }
  }, [isPending, session, router]);

  if (isPending) {
    return <Loader />;
  }

  return <>{children}</>;
}
