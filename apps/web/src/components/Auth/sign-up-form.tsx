import { Field, Fieldset, Input, Label } from '@headlessui/react';
import { useForm } from '@tanstack/react-form';
import { z } from 'zod';
import Loader from '@/components/loader';
import { Button } from '@/components/ui/button';
import { useAuthNavigation } from '@/hooks/use-auth-navigation';
import { authClient } from '@/lib/auth-client';

type SignUpFormProps = {
  onSwitchToSignIn: () => void;
};

export default function SignUpForm({ onSwitchToSignIn }: SignUpFormProps) {
  const { signUp } = useAuthNavigation();
  const { isPending } = authClient.useSession();

  const form = useForm({
    defaultValues: {
      email: '',
      password: '',
      name: '',
    },
    onSubmit: async ({ value }) => {
      await signUp({
        email: value.email,
        password: value.password,
        name: value.name,
      });
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
    <div className="flex min-h-screen w-full items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-md">
        {/* Card Container with Professional Styling */}
        <div className="relative overflow-hidden rounded-2xl bg-white shadow-xl ring-1 ring-gray-900/5 transition-all duration-300 hover:shadow-2xl">
          {/* Gradient Background Accent */}
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary via-success to-info" />

          {/* Card Content */}
          <div className="px-6 py-8 sm:px-8 sm:py-10">
            {/* Header Section */}
            <div className="text-center">
              <div className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-primary to-success shadow-lg">
                <svg
                  aria-hidden="true"
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

              <h1 className="font-bold text-2xl text-foreground tracking-tight sm:text-3xl">
                Create account
              </h1>
              <p className="mt-2 text-gray-600 text-sm">Join us today and start your journey</p>
            </div>

            {/* Form Section */}
            <form
              className="mt-8 space-y-6"
              onSubmit={(e) => {
                e.preventDefault();
                e.stopPropagation();
                form.handleSubmit();
              }}
            >
              <Fieldset className="space-y-5">
                <form.Field name="name">
                  {(field) => (
                    <Field className="space-y-2">
                      <Label
                        className="block font-semibold text-gray-700 text-sm"
                        htmlFor={field.name}
                      >
                        Name
                      </Label>
                      <Input
                        aria-describedby={
                          field.state.meta.errors.length > 0 ? `${field.name}-error` : undefined
                        }
                        aria-invalid={field.state.meta.errors.length > 0}
                        autoComplete="name"
                        className={`block w-full rounded-lg border-0 px-3 py-3 shadow-sm ring-1 ring-inset transition-all duration-200 placeholder:text-muted-foreground focus:ring-2 focus:ring-ring focus:ring-inset disabled:cursor-not-allowed disabled:bg-muted disabled:text-muted-foreground sm:text-sm sm:leading-6 ${
                          field.state.meta.errors.length > 0
                            ? 'text-destructive-foreground ring-destructive focus:ring-destructive'
                            : 'text-foreground ring-border'
                        }
                        `}
                        id={field.name}
                        name={field.name}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        placeholder="Enter your name"
                        type="text"
                        value={field.state.value}
                      />
                      {field.state.meta.errors.length > 0 && (
                        <div
                          aria-live="polite"
                          className="space-y-1"
                          id={`${field.name}-error`}
                          role="alert"
                        >
                          {field.state.meta.errors.map((error, index) => (
                            <p
                              className="flex items-center text-destructive text-sm"
                              key={`${error?.message}-${index}`}
                            >
                              <svg
                                className="mr-1 h-4 w-4 flex-shrink-0"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path
                                  clipRule="evenodd"
                                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                                  fillRule="evenodd"
                                />
                              </svg>
                              {error?.message}
                            </p>
                          ))}
                        </div>
                      )}
                    </Field>
                  )}
                </form.Field>

                <form.Field name="email">
                  {(field) => (
                    <Field className="space-y-2">
                      <Label
                        className="block font-semibold text-gray-700 text-sm"
                        htmlFor={field.name}
                      >
                        Email
                      </Label>
                      <Input
                        aria-describedby={
                          field.state.meta.errors.length > 0 ? `${field.name}-error` : undefined
                        }
                        aria-invalid={field.state.meta.errors.length > 0}
                        autoComplete="email"
                        className={`block w-full rounded-lg border-0 px-3 py-3 shadow-sm ring-1 ring-inset transition-all duration-200 placeholder:text-muted-foreground focus:ring-2 focus:ring-ring focus:ring-inset disabled:cursor-not-allowed disabled:bg-muted disabled:text-muted-foreground sm:text-sm sm:leading-6 ${
                          field.state.meta.errors.length > 0
                            ? 'text-destructive-foreground ring-destructive focus:ring-destructive'
                            : 'text-foreground ring-border'
                        }
                        `}
                        id={field.name}
                        name={field.name}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        placeholder="Enter your email"
                        type="email"
                        value={field.state.value}
                      />
                      {field.state.meta.errors.length > 0 && (
                        <div
                          aria-live="polite"
                          className="space-y-1"
                          id={`${field.name}-error`}
                          role="alert"
                        >
                          {field.state.meta.errors.map((error, index) => (
                            <p
                              className="flex items-center text-destructive text-sm"
                              key={`${error?.message}-${index}`}
                            >
                              <svg
                                className="mr-1 h-4 w-4 flex-shrink-0"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path
                                  clipRule="evenodd"
                                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                                  fillRule="evenodd"
                                />
                              </svg>
                              {error?.message}
                            </p>
                          ))}
                        </div>
                      )}
                    </Field>
                  )}
                </form.Field>

                <form.Field name="password">
                  {(field) => (
                    <Field className="space-y-2">
                      <Label
                        className="block font-semibold text-gray-700 text-sm"
                        htmlFor={field.name}
                      >
                        Password
                      </Label>
                      <Input
                        aria-describedby={
                          field.state.meta.errors.length > 0 ? `${field.name}-error` : undefined
                        }
                        aria-invalid={field.state.meta.errors.length > 0}
                        autoComplete="new-password"
                        className={`block w-full rounded-lg border-0 px-3 py-3 shadow-sm ring-1 ring-inset transition-all duration-200 placeholder:text-muted-foreground focus:ring-2 focus:ring-ring focus:ring-inset disabled:cursor-not-allowed disabled:bg-muted disabled:text-muted-foreground sm:text-sm sm:leading-6 ${
                          field.state.meta.errors.length > 0
                            ? 'text-destructive-foreground ring-destructive focus:ring-destructive'
                            : 'text-foreground ring-border'
                        }
                        `}
                        id={field.name}
                        name={field.name}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        placeholder="Create a password"
                        type="password"
                        value={field.state.value}
                      />
                      {field.state.meta.errors.length > 0 && (
                        <div
                          aria-live="polite"
                          className="space-y-1"
                          id={`${field.name}-error`}
                          role="alert"
                        >
                          {field.state.meta.errors.map((error, index) => (
                            <p
                              className="flex items-center text-destructive text-sm"
                              key={`${error?.message}-${index}`}
                            >
                              <svg
                                className="mr-1 h-4 w-4 flex-shrink-0"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path
                                  clipRule="evenodd"
                                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                                  fillRule="evenodd"
                                />
                              </svg>
                              {error?.message}
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
                    aria-describedby="submit-button-description"
                    className="cursor: pointer flex w-full justify-center rounded-lg bg-primary px-3 py-3 font-semibold text-primary-foreground text-sm leading-6 shadow-sm transition-all duration-200 hover:bg-success focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    disabled={!state.canSubmit || state.isSubmitting}
                    type="submit"
                  >
                    {state.isSubmitting ? (
                      <div className="flex items-center">
                        <svg className="mr-2 h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          />
                          <path
                            className="opacity-75"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            fill="currentColor"
                          />
                        </svg>
                        Creating account...
                      </div>
                    ) : (
                      'Create account'
                    )}
                  </Button>
                )}
              </form.Subscribe>
            </form>

            {/* Footer Section */}
            <div className="mt-8 text-center">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-gray-300 border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-2 text-gray-500">Or</span>
                </div>
              </div>

              <div className="mt-6">
                <Button
                  className="inline-flex items-center font-medium text-info text-sm transition-colors hover:text-info/80 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  onClick={onSwitchToSignIn}
                  type="button"
                  variant="link"
                >
                  Already have an account?
                  <span className="ml-1 font-semibold">Sign In</span>
                  <svg
                    className="ml-1 h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      d="M9 5l7 7-7 7"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                    />
                  </svg>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="sr-only" id="submit-button-description">
        Creates a new account and redirects to dashboard
      </div>
    </div>
  );
}
