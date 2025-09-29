import { useCallback } from 'react';
import { toast } from 'sonner';
import { authClient } from '@/lib/auth-client';
import { ROUTES, useAppRouter } from '@/lib/router';

type AuthCredentials = {
  email: string;
  password: string;
  name?: string;
};

type AuthOptions = {
  redirectTo?: string;
  onSuccess?: () => void;
  onError?: (error: any) => void;
};

export function useAuthNavigation() {
  const { navigateToRoute, navigate } = useAppRouter();

  const signUp = useCallback(
    async (credentials: AuthCredentials, options?: AuthOptions) => {
      const { redirectTo = ROUTES.DASHBOARD, onSuccess, onError } = options || {};

      try {
        await authClient.signUp.email(
          {
            email: credentials.email,
            password: credentials.password,
            name: credentials.name || '',
          },
          {
            onSuccess: () => {
              navigate(redirectTo);
              toast.success('Sign up successful');
              onSuccess?.();
            },
            onError: (error) => {
              const message = error.error?.message || error.error?.statusText || 'Sign up failed';
              toast.error(message);
              onError?.(error);
            },
          }
        );
      } catch (error) {
        console.error('SignUp error:', error);
        toast.error('An unexpected error occurred');
        onError?.(error);
      }
    },
    [navigate]
  );

  const signIn = useCallback(
    async (credentials: Omit<AuthCredentials, 'name'>, options?: AuthOptions) => {
      const { redirectTo = ROUTES.HOME, onSuccess, onError } = options || {};

      try {
        await authClient.signIn.email(
          {
            email: credentials.email,
            password: credentials.password,
          },
          {
            onSuccess: () => {
              navigate(redirectTo);
              toast.success('Sign in successful');
              onSuccess?.();
            },
            onError: (error) => {
              const message = error.error?.message || error.error?.statusText || 'Sign in failed';
              toast.error(message);
              onError?.(error);
            },
          }
        );
      } catch (error) {
        console.error('SignIn error:', error);
        toast.error('An unexpected error occurred');
        onError?.(error);
      }
    },
    [navigate]
  );

  const signOut = useCallback(
    async (options?: Pick<AuthOptions, 'redirectTo' | 'onSuccess' | 'onError'>) => {
      const { redirectTo = ROUTES.LOGIN, onSuccess, onError } = options || {};

      try {
        await authClient.signOut({
          onSuccess: () => {
            navigate(redirectTo);
            toast.success('Signed out successfully');
            onSuccess?.();
          },
          onError: (error) => {
            console.error('SignOut error:', error);
            toast.error('Sign out failed');
            onError?.(error);
          },
        });
      } catch (error) {
        console.error('SignOut error:', error);
        toast.error('An unexpected error occurred');
        onError?.(error);
      }
    },
    [navigate]
  );

  return {
    signUp,
    signIn,
    signOut,

    goToSignIn: () => navigate('/login'),
    goToSignUp: () => navigate('/register'),
    goToRecoverPassword: () => navigate('/recover-password'),
    goToDashboard: () => navigateToRoute('DASHBOARD'),
    goHome: () => navigateToRoute('HOME'),
  };
}
