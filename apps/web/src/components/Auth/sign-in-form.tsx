import { Field, Fieldset, Input, Label } from '@headlessui/react';
import { useForm } from '@tanstack/react-form';
import { toast } from 'sonner';
import { z } from 'zod';
import Loader from '@/components/loader';
import { Button } from '@/components/ui/button';
import { useAuthNavigation } from '@/hooks/use-auth-navigation';
import { authClient } from '@/lib/auth-client';
import { useI18n } from '@/hooks/use-i18n';

type SignInFormProps = {
  onSwitchToSignUp: () => void;
  onClose: () => void;
};

export default function SignInForm({ onSwitchToSignUp, onClose }: SignInFormProps) {
  const { signIn } = useAuthNavigation();
  const { isPending } = authClient.useSession();
  const { t } = useI18n();

  const form = useForm({
    defaultValues: { email: '', password: '' },
    onSubmit: async ({ value }) => {
      await signIn(
        { email: value.email, password: value.password },
        {
          redirectTo: window.location.pathname,
          onSuccess: () => {
            onClose();
          },
          onError: (error) => {
            const errorMessage = error?.error?.message || t('auth.signIn.error');
            toast.error(errorMessage);
          },
        }
      );
    },
    validators: {
      onSubmit: z.object({
        email: z.string().email(t('auth.validation.email.invalid')),
        password: z.string().min(8, t('auth.validation.password.min')),
      }),
    },
  });

  if (isPending) {
    return <Loader />;
  }

  return (
    <div className="relative overflow-hidden rounded-2xl bg-white shadow-xl ring-1 ring-gray-900/5 transition-all duration-300 hover:shadow-2xl">
      {/* Botón de cierre */}
      <Button
        aria-label="Close modal"
        className="absolute top-4 right-4 h-8 w-8"
        onClick={onClose}
        size="icon"
        variant="ghost"
      >
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            d="M6 18L18 6M6 6l12 12"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
          />
        </svg>
      </Button>

      {/* Gradient Accent */}
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary via-info to-success" />

      <div className="px-6 py-8 sm:px-8 sm:py-10">
        <div className="mb-6 text-center">
          <div className="mx-auto inline-flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-primary to-success shadow-lg">
            <svg
              className="h-6 w-6 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
              />
            </svg>
          </div>
          <h1 className="mt-4 font-bold text-2xl text-foreground tracking-tight sm:text-3xl">
            {t('auth.welcome')}
          </h1>
          <p className="mt-2 text-gray-600 text-sm">{t('textInput.loginToSubmit')}</p>
        </div>

        {/* Form */}
        <form
          className="mt-8 space-y-6"
          onSubmit={(e) => {
            e.preventDefault();
            form.handleSubmit();
          }}
        >
          <Fieldset className="space-y-5">
            <form.Field name="email">
              {(field) => (
                <Field className="space-y-2" key="email">
                  <Label className="block font-semibold text-gray-700 text-sm" htmlFor={field.name}>
                    {t('auth.Email')}
                  </Label>
                  <Input
                    aria-describedby={
                      field.state.meta.errors.length > 0 ? `${field.name}-error` : undefined
                    }
                    aria-invalid={field.state.meta.errors.length > 0}
                    autoComplete="email"
                    className={`block w-full rounded-lg border-0 px-3 py-3 shadow-sm ring-1 ring-inset transition-all duration-200 placeholder:text-muted-foreground focus:ring-2 focus:ring-ring focus:ring-inset sm:text-sm sm:leading-6 ${
                      field.state.meta.errors.length > 0
                        ? 'text-destructive-foreground ring-destructive focus:ring-destructive'
                        : 'text-foreground ring-border'
                    }`}
                    id={field.name}
                    name={field.name}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    placeholder={t('auth.Email.placeholder')}
                    type="email"
                    value={field.state.value as string}
                  />
                  {field.state.meta.errors.length > 0 && (
                    <div
                      aria-live="polite"
                      className="space-y-1"
                      id={`${field.name}-error`}
                      role="alert"
                    >
                      {field.state.meta.errors.map((error, i) => (
                        <p className="flex items-center text-destructive text-sm" key={i}>
                          {error.message}
                        </p>
                      ))}
                    </div>
                  )}
                </Field>
              )}
            </form.Field>

            <form.Field name="password">
              {(field) => (
                <Field className="space-y-2" key="password">
                  <Label className="block font-semibold text-gray-700 text-sm" htmlFor={field.name}>
                    {t('auth.Password')}
                  </Label>
                  <Input
                    aria-describedby={
                      field.state.meta.errors.length > 0 ? `${field.name}-error` : undefined
                    }
                    aria-invalid={field.state.meta.errors.length > 0}
                    autoComplete="current-password"
                    className={`block w-full rounded-lg border-0 px-3 py-3 shadow-sm ring-1 ring-inset transition-all duration-200 placeholder:text-muted-foreground focus:ring-2 focus:ring-ring focus:ring-inset sm:text-sm sm:leading-6 ${
                      field.state.meta.errors.length > 0
                        ? 'text-destructive-foreground ring-destructive focus:ring-destructive'
                        : 'text-foreground ring-border'
                    }`}
                    id={field.name}
                    name={field.name}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    placeholder={t('auth.Password.placeholder')}
                    type="password"
                    value={field.state.value as string}
                  />
                  {field.state.meta.errors.length > 0 && (
                    <div
                      aria-live="polite"
                      className="space-y-1"
                      id={`${field.name}-error`}
                      role="alert"
                    >
                      {field.state.meta.errors.map((error, i) => (
                        <p className="flex items-center text-destructive text-sm" key={i}>
                          {error.message}
                        </p>
                      ))}
                    </div>
                  )}
                </Field>
              )}
            </form.Field>
          </Fieldset>

          <form.Subscribe>
            {(state) => (
              <Button
                className="flex w-full justify-center rounded-lg bg-primary px-3 py-3 font-semibold text-primary-foreground text-sm leading-6 shadow-sm transition-all duration-200 hover:bg-success"
                disabled={!state.canSubmit || state.isSubmitting}
                type="submit"
              >
                {state.isSubmitting ? t('auth.signIn.Loader') : t('auth.signIn')}
              </Button>
            )}
          </form.Subscribe>
        </form>

        <div className="mt-6 text-center">
          <Button className="font-semibold text-sm" onClick={onSwitchToSignUp} variant="link">
            {t('auth.signUp.cta')}
          </Button>
        </div>
      </div>
    </div>
  );
}
