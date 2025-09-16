import { useRouter } from 'next/navigation';
import { useCallback, useMemo } from 'react';
import { authClient } from '@/lib/auth-client';

// biome-ignore lint/nursery/useConsistentTypeDefinitions: <explanation>
interface User {
  id: string;
  email: string;
  name?: string;
  emailVerified?: boolean;
  image?: string;
}

// biome-ignore lint/nursery/useConsistentTypeDefinitions: <explanation>
interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export function useAuth() {
  const router = useRouter();
  const { data: session, isPending: isLoading } = authClient.useSession();

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
          }
        : null,
      isAuthenticated: !!session?.user,
      isLoading,
    }),
    [session?.user, isLoading]
  );

  // Memoize functions to prevent unnecessary re-creations
  const checkAuthStatus = useCallback(async () => {
    // This function is now handled automatically by authClient.useSession()
    // Keep for backward compatibility but it's essentially a no-op
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

  // Note: Use useAuthNavigation hook for login/signup instead
  // These are kept for backward compatibility but are deprecated
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
