'use client';

import { useCallback } from 'react';
import { toast } from 'sonner';
import { authClient } from '@/lib/auth-client';
import { ROUTES, useAppRouter } from '@/lib/router';
import { useI18n } from './use-i18n';

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
  const { navigate, refresh } = useAppRouter();
  const { t } = useI18n();

  const signUp = useCallback(
    async (credentials: AuthCredentials, options?: AuthOptions) => {
      const { onSuccess, onError } = options || {};

      try {
        await authClient.signUp.email(
          {
            email: credentials.email,
            password: credentials.password,
            name: credentials.name || '',
          },
          {
            onSuccess: () => {
              toast.success(t('auth.signUp.success') || 'Sign up successful!');
              refresh();
              onSuccess?.();
            },
            onError: (error) => {
              const message = error.error?.message || t('auth.signUp.error');
              toast.error(message);
              onError?.(error);
            },
          }
        );
      } catch (error) {
        console.error('SignUp error:', error);
        toast.error(t('common.error'));
        onError?.(error);
      }
    },
    [refresh, t]
  );

  const signIn = useCallback(
    async (credentials: Omit<AuthCredentials, 'name'>, options?: AuthOptions) => {
      const { onSuccess, onError } = options || {};

      try {
        await authClient.signIn.email(
          {
            email: credentials.email,
            password: credentials.password,
          },
          {
            onSuccess: () => {
              toast.success(t('auth.signIn.success') || 'Sign in successful!');
              refresh();
              onSuccess?.();
            },
            onError: (error) => {
              const message = error.error?.message || t('auth.signIn.error');
              toast.error(message);
              onError?.(error);
            },
          }
        );
      } catch (error) {
        console.error('SignIn error:', error);
        toast.error(t('common.error'));
        onError?.(error);
      }
    },
    [refresh, t]
  );

  const signOut = useCallback(
    async (options?: Pick<AuthOptions, 'redirectTo' | 'onSuccess' | 'onError'>) => {
      const { redirectTo = ROUTES.HOME, onSuccess, onError } = options || {};

      try {
        await authClient.signOut({
          onSuccess: () => {
            navigate(redirectTo);
            toast.success(t('auth.loggedOut'));
            onSuccess?.();
          },
          onError: (error) => {
            console.error('SignOut error:', error);
            toast.error(t('auth.signOut.error') || 'Sign out failed');
            onError?.(error);
          },
        });
      } catch (error) {
        console.error('SignOut error:', error);
        toast.error(t('common.error'));
        onError?.(error);
      }
    },
    [navigate, t]
  );

  return {
    signUp,
    signIn,
    signOut,
  };
}
