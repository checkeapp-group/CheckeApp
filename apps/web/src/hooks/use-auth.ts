import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useCallback, useMemo } from 'react';
import { authClient } from '@/lib/auth-client';

type User = {
  id: string;
  email: string;
  name?: string;
  emailVerified?: boolean;
  image?: string;
  isVerified?: boolean;
  isAdmin?: boolean;
  termsAccepted?: boolean;
};

type AuthState = {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  termsAccepted: boolean;
};

async function fetchUserStatus(): Promise<{
  isVerified: boolean;
  isAdmin: boolean;
  termsAccepted: boolean;
}> {
  const response = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/user/status`, {
    method: 'GET',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    if (response.status === 401 || response.status === 404) {
      return { isVerified: false, isAdmin: false, termsAccepted: false };
    }
    throw new Error('Failed to fetch user status');
  }

  return response.json();
}

// Hook providing authentication state, user data, and verification status with session management
export function useAuth() {
  const router = useRouter();
  const { data: session, isPending: isSessionLoading } = authClient.useSession();

  const { data: userStatus, isPending: isStatusLoading } = useQuery({
    queryKey: ['userStatus', session?.user?.id],
    queryFn: fetchUserStatus,
    enabled: !!session?.user,
    staleTime: 5 * 60 * 1000,
  });

  const isLoading = isSessionLoading || (!!session?.user && isStatusLoading);

  const authState: AuthState = useMemo(
    () => ({
      user: session?.user
        ? {
            id: session.user.id,
            email: session.user.email,
            name: session.user.name,
            emailVerified: session.user.emailVerified,
            image: session.user.image,
            isVerified: userStatus?.isVerified ?? false,
            isAdmin: userStatus?.isAdmin ?? false,
            termsAccepted: userStatus?.termsAccepted ?? false,
          }
        : null,
      isAuthenticated: !!session?.user,
      isLoading,
      termsAccepted: userStatus?.termsAccepted ?? false,
    }),
    [session?.user, isLoading, userStatus]
  );

  const checkAuthStatus = useCallback(async () => {
    return Promise.resolve();
  }, []);

  const logout = useCallback(async () => {
    try {
      await authClient.signOut({
        fetchOptions: {
          onSuccess: () => {
            router.push('/');
          },
          onError: (ctx) => {
            console.error('Logout failed:', ctx.error);
          },
        },
      });
    } catch (error) {
      console.error('Logout failed:', error);
    }
  }, [router]);

  const signInWithProvider = useCallback(async (provider: 'github' | 'google' | 'discord') => {
    try {
      await authClient.signIn.social({
        provider,
        callbackURL: process.env.NEXT_PUBLIC_APP_URL || window.location.origin,
        fetchOptions: {
          onSuccess: () => {},
          onError: (ctx) => {
            console.error(`${provider} signin failed:`, ctx.error);
          },
        },
      });
    } catch (error) {
      console.error(`${provider} signin failed:`, error);
    }
  }, []);

  const updateProfile = useCallback(async (data: { name?: string; image?: string }) => {
    try {
      await authClient.updateUser(data);
      return { success: true };
    } catch (error) {
      console.error('Update profile failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error',
      };
    }
  }, []);

  return useMemo(
    () => ({
      ...authState,
      isVerified: authState.user?.isVerified ?? false,
      isAdmin: authState.user?.isAdmin ?? false,
      logout,
      signInWithProvider,
      updateProfile,
      checkAuthStatus,
    }),
    [authState, logout, signInWithProvider, updateProfile, checkAuthStatus]
  );
}
