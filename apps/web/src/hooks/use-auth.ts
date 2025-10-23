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
};

type AuthState = {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
};

async function fetchUserStatus(): Promise<{ isVerified: boolean; isAdmin: boolean }> {
  const response = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/user/status`, {
    method: 'GET',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    if (response.status === 401 || response.status === 404) {
      return { isVerified: false, isAdmin: false };
    }
    throw new Error('Failed to fetch user status');
  }

  return response.json();
}

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
          }
        : null,
      isAuthenticated: !!session?.user,
      isLoading,
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

  const login = useCallback(async (email: string, password: string) => {
    console.warn('useAuth.login is deprecated, use useAuthNavigation.signIn instead');
    return { success: false, error: 'Use useAuthNavigation.signIn instead' };
  }, []);

  const signup = useCallback(async (email: string, password: string, name?: string) => {
    console.warn('useAuth.signup is deprecated, use useAuthNavigation.signUp instead');
    return { success: false, error: 'Use useAuthNavigation.signUp instead' };
  }, []);

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

  const forgotPassword = useCallback(async (email: string) => {
    try {
      await authClient.forgetPassword({
        email,
        redirectTo: `${window.location.origin}/reset-password`,
      });
      return { success: true };
    } catch (error) {
      console.error('Forgot password failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error',
      };
    }
  }, []);

  const resetPassword = useCallback(async (token: string, password: string) => {
    try {
      await authClient.resetPassword({
        token,
        password,
      });
      return { success: true };
    } catch (error) {
      console.error('Reset password failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error',
      };
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
      login,
      logout,
      signup,
      signInWithProvider,
      forgotPassword,
      resetPassword,
      updateProfile,
      checkAuthStatus,
    }),
    [
      authState,
      login,
      logout,
      signup,
      signInWithProvider,
      forgotPassword,
      resetPassword,
      updateProfile,
      checkAuthStatus,
    ]
  );
}
