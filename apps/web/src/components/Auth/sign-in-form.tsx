import React, { useState } from 'react';

type SignInFormProps = {
  onSwitchToSignUp: () => void;
};

export default function SignInForm({ onSwitchToSignUp = () => {} }: SignInFormProps) {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState({
    email: '',
    password: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
      return 'Email is required';
    }
    if (!emailRegex.test(email)) {
      return 'Invalid email address';
    }
    return '';
  };

  const validatePassword = (password: string) => {
    if (!password) {
      return 'Password is required';
    }
    if (password.length < 8) {
      return 'Password must be at least 8 characters';
    }
    return '';
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const handleBlur = (field: string) => {
    if (field === 'email') {
      const emailError = validateEmail(formData.email);
      setErrors((prev) => ({ ...prev, email: emailError }));
    } else if (field === 'password') {
      const passwordError = validatePassword(formData.password);
      setErrors((prev) => ({ ...prev, password: passwordError }));
    }
  };

  const handleSubmit = async () => {
    const emailError = validateEmail(formData.email);
    const passwordError = validatePassword(formData.password);

    setErrors({
      email: emailError,
      password: passwordError,
    });

    if (!(emailError || passwordError)) {
      setIsSubmitting(true);
      try {
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 2000));
        console.log('Signing in with:', formData);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const canSubmit =
    formData.email && formData.password && !errors.email && !errors.password && !isSubmitting;

  return (
    <div className="flex min-h-screen w-full items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-md">
        {/* Card Container with Professional Styling */}
        <div className="relative overflow-hidden rounded-2xl bg-white shadow-xl ring-1 ring-gray-900/5 transition-all duration-300 hover:shadow-2xl">
          {/* Gradient Background Accent */}
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary via-info to-success" />

          {/* Card Content */}
          <div className="px-6 py-8 sm:px-8 sm:py-10">
            {/* Header Section */}
            <div className="text-center">
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
              </div>

              <h1 className="font-bold text-2xl text-foreground tracking-tight sm:text-3xl">
                Welcome Back
              </h1>
              <p className="mt-2 text-gray-600 text-sm">Sign in to your account to continue</p>
            </div>

            {/* Form Section */}
            <div className="mt-8 space-y-6">
              <div className="space-y-5">
                {/* Email Field */}
                <div className="space-y-2">
                  <label className="block font-semibold text-gray-700 text-sm" htmlFor="email">
                    Email
                  </label>
                  <input
                    aria-describedby={errors.email ? 'email-error' : undefined}
                    aria-invalid={!!errors.email}
                    autoComplete="email"
                    className={`block w-full rounded-lg border-0 px-3 py-3 shadow-sm ring-1 ring-inset transition-all duration-200 placeholder:text-muted-foreground focus:ring-2 focus:ring-ring focus:ring-inset disabled:cursor-not-allowed disabled:bg-muted disabled:text-muted-foreground sm:text-sm sm:leading-6 ${
                      errors.email
                        ? 'text-destructive-foreground ring-destructive focus:ring-destructive'
                        : 'text-foreground ring-border'
                    }
                    `}
                    id="email"
                    name="email"
                    onBlur={() => handleBlur('email')}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="Enter your email"
                    type="email"
                    value={formData.email}
                  />
                  {errors.email && (
                    <div aria-live="polite" className="space-y-1" id="email-error" role="alert">
                      <p className="flex items-center text-destructive text-sm">
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
                        {errors.email}
                      </p>
                    </div>
                  )}
                </div>

                {/* Password Field */}
                <div className="space-y-2">
                  <label className="block font-semibold text-gray-700 text-sm" htmlFor="password">
                    Password
                  </label>
                  <input
                    aria-describedby={errors.password ? 'password-error' : undefined}
                    aria-invalid={!!errors.password}
                    autoComplete="current-password"
                    className={`block w-full rounded-lg border-0 px-3 py-3 shadow-sm ring-1 ring-inset transition-all duration-200 placeholder:text-muted-foreground focus:ring-2 focus:ring-ring focus:ring-inset disabled:cursor-not-allowed disabled:bg-muted disabled:text-muted-foreground sm:text-sm sm:leading-6 ${
                      errors.password
                        ? 'text-destructive-foreground ring-destructive focus:ring-destructive'
                        : 'text-foreground ring-border'
                    }
                    `}
                    id="password"
                    name="password"
                    onBlur={() => handleBlur('password')}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    placeholder="Enter your password"
                    type="password"
                    value={formData.password}
                  />
                  {errors.password && (
                    <div aria-live="polite" className="space-y-1" id="password-error" role="alert">
                      <p className="flex items-center text-destructive text-sm">
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
                        {errors.password}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Submit Button */}
              <button
                aria-describedby="submit-button-description"
                className="flex w-full justify-center rounded-lg bg-primary px-3 py-3 font-semibold text-primary-foreground text-sm leading-6 shadow-sm transition-all duration-200 hover:bg-success focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                disabled={!canSubmit}
                onClick={handleSubmit}
                type="button"
              >
                {isSubmitting ? (
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
                    Signing you in...
                  </div>
                ) : (
                  'Sign In'
                )}
              </button>
            </div>

            {/* Footer Section */}
            <div className="mt-8">
              {/* Forgot Password Link */}
              <div className="text-center">
                <button
                  className="rounded-md px-2 py-1 font-medium text-info text-sm transition-colors hover:text-info/80 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  type="button"
                >
                  Forgot your password?
                </button>
              </div>

              {/* Divider */}
              <div className="relative mt-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-gray-300 border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-2 text-gray-500">Or</span>
                </div>
              </div>

              {/* Sign Up Link */}
              <div className="mt-6 text-center">
                <button
                  className="inline-flex items-center rounded-md px-2 py-1 font-medium text-info text-sm transition-colors hover:text-info/80 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  onClick={onSwitchToSignUp}
                  type="button"
                >
                  Need an account?
                  <span className="ml-1 font-semibold">Sign Up</span>
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
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="sr-only" id="submit-button-description">
        Sign in to your account and redirect to homepage
      </div>
    </div>
  );
}
