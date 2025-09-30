'use client';

import { useForm } from '@tanstack/react-form';
import { toast } from 'sonner';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useI18n } from '@/hooks/use-i18n';
import { authClient } from '@/lib/auth-client';

type ForgotPasswordFormProps = {
  onClose?: () => void;
  onSwitchToSignIn: () => void;
};

export default function ForgotPasswordForm({ onClose, onSwitchToSignIn }: ForgotPasswordFormProps) {
  const { t } = useI18n();

  const form = useForm({
    defaultValues: { email: '' },
    onSubmit: async ({ value }) => {
      const promise = authClient.forgetPassword({
        email: value.email,
        redirectTo: `${window.location.origin}/reset-password`,
      });

      toast.promise(promise, {
        loading: t('forgotPassword.sending'),
        success: () => {
          onClose?.();
          return t('forgotPassword.success');
        },
        error: t('forgotPassword.error'),
      });
    },
    validators: {
      onSubmit: z.object({
        email: z.string().email(t('auth.validation.email.invalid')),
      }),
    },
  });

  return (
    <div className="relative overflow-hidden rounded-2xl bg-white p-8 shadow-xl ring-1 ring-gray-900/5">
      <div className="text-center">
        <h1 className="font-bold text-2xl text-foreground tracking-tight">{t('forgotPassword.title')}</h1>
        <p className="mt-2 text-gray-600 text-sm">
          {t('forgotPassword.subtitle')}
        </p>
      </div>

      <form
        className="mt-8 space-y-6"
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          form.handleSubmit();
        }}
      >
        <form.Field name="email">
          {(field) => (
            <div>
              <Label htmlFor={field.name}>{t('auth.Email')}</Label>
              <Input
                className="mt-1"
                id={field.name}
                name={field.name}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                placeholder={t('auth.Email.placeholder')}
                type="email"
                value={field.state.value}
              />
              {field.state.meta.errors.length > 0 && (
                <p className="mt-1 text-destructive text-sm">
                  {field.state.meta.errors.join(', ')}
                </p>
              )}
            </div>
          )}
        </form.Field>

        <form.Subscribe>
          {(state) => (
            <Button
              className="w-full"
              disabled={!state.canSubmit || state.isSubmitting}
              loading={state.isSubmitting}
              type="submit"
            >
              {t('forgotPassword.sendLink')}
            </Button>
          )}
        </form.Subscribe>
      </form>
      <div className="mt-6 text-center">
        <Button onClick={onSwitchToSignIn} variant="link">
          {' '}
          {t('forgotPassword.backToSignIn')}
        </Button>
      </div>
    </div>
  );
}
