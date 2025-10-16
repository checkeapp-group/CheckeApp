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
}

type AuthState = {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

// Function to fetch verification status from the backend
async function fetchVerificationStatus(): Promise<{ isVerified: boolean }> {
  const response = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/user/status`, {
    method: 'GET',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch verification status');
  }

  return response.json();
}

export function useAuth() {
  const router = useRouter();
  const { data: session, isPending: isSessionLoading } = authClient.useSession();

  // Fetch verification status using useQuery
  const { data: verificationStatus, isPending: isStatusLoading } = useQuery({
    queryKey: ['userVerificationStatus'],
    queryFn: fetchVerificationStatus,
    enabled: !!session?.user,
    staleTime: 5 * 60 * 1000,
  });

  // Combine loading states
  const isLoading = isSessionLoading || isStatusLoading;

  // Memoize the auth state object to prevent unnecessary re-renders
  const authState: AuthState = useMemo(
    () => ({
      user: session?.user
        ? {
            id: session.user.id,
            email: session.user.email,
            name: session.user.name,
            emailVerified: session.user.emailVerified,
            image: session.user.image,
            isVerified: verificationStatus?.isVerified ?? false,
          }
        : null,
      isAuthenticated: !!session?.user,
      isLoading,
    }),
    [session?.user, isLoading, verificationStatus?.isVerified]
  );

  // Memoize functions to prevent unnecessary re-creations
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
        fetchOptions: {
          onSuccess: () => {
            // Session will be updated automatically by authClient.useSession()
          },
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
      const response = await authClient.updateUser(data);
      // Session will be updated automatically by authClient.useSession()
      return { success: true };
    } catch (error) {
      console.error('Update profile failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error',
      };
    }
  }, []);

  // Memoize the return object to prevent unnecessary re-renders
  return useMemo(
    () => ({
      ...authState,
      isVerified: authState.user?.isVerified ?? false,
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
