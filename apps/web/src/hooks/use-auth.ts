import { useEffect, useState } from 'react';

import { authClient } from '@/lib/auth-client';
import { useRouter } from 'next/navigation';

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
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
  });

  useEffect(() => {
    // Check authentication status on mount
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const session = await authClient.getSession();

      if (session && session.user) {
        setAuthState({
          user: {
            id: session.user.id,
            email: session.user.email,
            name: session.user.name,
            emailVerified: session.user.emailVerified,
            image: session.user.image,
          },
          isAuthenticated: true,
          isLoading: false,
        });
      } else {
        setAuthState({
          user: null,
          isAuthenticated: false,
          isLoading: false,
        });
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      setAuthState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
      });
    }
  };

  const logout = async () => {
    try {
      await authClient.signOut({
        fetchOptions: {
          onSuccess: () => {
            setAuthState({
              user: null,
              isAuthenticated: false,
              isLoading: false,
            });
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
  };

  const login = async (email: string, password: string) => {
    try {
      const response = await authClient.signIn.email({
        email,
        password,
        fetchOptions: {
          onSuccess: (ctx) => {
            const user = ctx.data?.user;
            if (user) {
              setAuthState({
                user: {
                  id: user.id,
                  email: user.email,
                  name: user.name,
                  emailVerified: user.emailVerified,
                  image: user.image,
                },
                isAuthenticated: true,
                isLoading: false,
              });
            }
          },
          onError: (ctx) => {
            console.error('Login failed:', ctx.error);
          },
        },
      });

      return {
        success: !!response?.user,
        error: response?.user ? null : 'Login failed',
      };
    } catch (error) {
      console.error('Login failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error',
      };
    }
  };

  const signup = async (email: string, password: string, name?: string) => {
    try {
      const response = await authClient.signUp.email({
        email,
        password,
        name,
        fetchOptions: {
          onSuccess: (ctx) => {
            const user = ctx.data?.user;
            if (user) {
              setAuthState({
                user: {
                  id: user.id,
                  email: user.email,
                  name: user.name,
                  emailVerified: user.emailVerified,
                  image: user.image,
                },
                isAuthenticated: true,
                isLoading: false,
              });
            }
          },
          onError: (ctx) => {
            console.error('Signup failed:', ctx.error);
          },
        },
      });

      return {
        success: !!response?.user,
        error: response?.user ? null : 'Signup failed',
      };
    } catch (error) {
      console.error('Signup failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error',
      };
    }
  };

  const signInWithProvider = async (provider: 'github' | 'google' | 'discord') => {
    try {
      await authClient.signIn.social({
        provider,
        fetchOptions: {
          onSuccess: () => {
            // Session will be updated automatically by Better Auth
            checkAuthStatus();
          },
          onError: (ctx) => {
            console.error(`${provider} signin failed:`, ctx.error);
          },
        },
      });
    } catch (error) {
      console.error(`${provider} signin failed:`, error);
    }
  };

  const forgotPassword = async (email: string) => {
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
  };

  const resetPassword = async (token: string, password: string) => {
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
  };

  const updateProfile = async (data: { name?: string; image?: string }) => {
    try {
      const response = await authClient.updateUser(data);

      if (response && authState.user) {
        setAuthState({
          ...authState,
          user: {
            ...authState.user,
            ...data,
          },
        });
      }

      return { success: true };
    } catch (error) {
      console.error('Update profile failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error',
      };
    }
  };

  return {
    ...authState,
    login,
    logout,
    signup,
    signInWithProvider,
    forgotPassword,
    resetPassword,
    updateProfile,
    checkAuthStatus,
  };
}
