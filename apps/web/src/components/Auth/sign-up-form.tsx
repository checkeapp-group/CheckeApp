import { Field, Fieldset, Input, Label } from '@headlessui/react';
import { useForm } from '@tanstack/react-form';
import { toast } from 'sonner';
import { z } from 'zod';
import Loader from '@/components/loader';
import { Button } from '@/components/ui/button';
import { useAuthNavigation } from '@/hooks/use-auth-navigation';
import { authClient } from '@/lib/auth-client';

type SignUpFormProps = {
  onSwitchToSignIn: () => void;
  onClose?: () => void;
};

export default function SignUpForm({ onSwitchToSignIn, onClose }: SignUpFormProps) {
  const { signUp } = useAuthNavigation();
  const { isPending } = authClient.useSession();

  const form = useForm({
    defaultValues: { name: '', email: '', password: '' },
    onSubmit: async ({ value }) => {
      await signUp(
        { name: value.name, email: value.email, password: value.password },
        {
          redirectTo: window.location.pathname,
          onSuccess: () => {
            onClose?.();
          },
          onError: (error) => {
            const errorMessage = error?.error?.message || 'Sign up failed. Please try again.';
            toast.error(errorMessage);
          },
        }
      );
    },
    validators: {
      onSubmit: z.object({
        name: z.string().min(2, 'Name must be at least 2 characters'),
        email: z.string().email('Invalid email address'),
        password: z.string().min(8, 'Password must be at least 8 characters'),
      }),
    },
  });

  if (isPending) {
    return <Loader />;
  }

  return (
    <div className="relative overflow-hidden rounded-2xl bg-white shadow-xl ring-1 ring-gray-900/5 transition-all duration-300 hover:shadow-2xl">
      {onClose && (
        <Button
          aria-label="Close modal"
          className="absolute top-4 right-4 h-8 w-8"
          onClick={onClose}
          size="icon"
          variant="ghost"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              d="M6 18L18 6M6 6l12 12"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
            />
          </svg>
        </Button>
      )}

      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary via-success to-info" />

      <div className="px-6 py-8 sm:px-8 sm:py-10">
        <div className="mb-6 text-center">
          <h1 className="font-bold text-2xl text-foreground tracking-tight sm:text-3xl">
            Create an Account
          </h1>
          <p className="mt-2 text-gray-600 text-sm">Sign up to get started with our platform</p>
        </div>

        {/* Form */}
        <form
          className="mt-8 space-y-6"
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            form.handleSubmit();
          }}
        >
          <Fieldset className="space-y-5">
            {['name', 'email', 'password'].map((fieldName) => (
              <form.Field key={fieldName} name={fieldName}>
                {(field) => (
                  <Field className="space-y-2">
                    <Label
                      className="block font-semibold text-gray-700 text-sm"
                      htmlFor={field.name}
                    >
                      {field.name[0].toUpperCase() + field.name.slice(1)}
                    </Label>
                    <Input
                      aria-describedby={
                        field.state.meta.errors.length > 0 ? `${field.name}-error` : undefined
                      }
                      aria-invalid={field.state.meta.errors.length > 0}
                      className={`block w-full rounded-lg border-0 px-3 py-3 shadow-sm ring-1 ring-inset transition-all duration-200 placeholder:text-muted-foreground focus:ring-2 focus:ring-ring focus:ring-inset sm:text-sm sm:leading-6 ${
                        field.state.meta.errors.length > 0
                          ? 'text-destructive-foreground ring-destructive focus:ring-destructive'
                          : 'text-foreground ring-border'
                      }`}
                      id={field.name}
                      name={field.name}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      placeholder={`Enter your ${field.name}`}
                      type={field.name === 'password' ? 'password' : 'text'}
                      value={field.state.value}
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
            ))}
          </Fieldset>

          <form.Subscribe>
            {(state) => (
              <Button
                className="flex w-full justify-center rounded-lg bg-primary px-3 py-3 font-semibold text-primary-foreground text-sm leading-6 shadow-sm transition-all duration-200 hover:bg-success"
                disabled={!state.canSubmit || state.isSubmitting}
                type="submit"
              >
                {state.isSubmitting ? 'Signing you up...' : 'Sign Up'}
              </Button>
            )}
          </form.Subscribe>
        </form>

        <div className="mt-6 text-center">
          <Button className="font-semibold text-sm" onClick={onSwitchToSignIn} variant="link">
            Already have an account? Sign In
          </Button>
        </div>
      </div>
    </div>
  );
}
