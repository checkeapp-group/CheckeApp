'use client';

import SignInForm from '@/components/Auth/sign-in-form';
import SignUpForm from '@/components/Auth/sign-up-form';
import { useState } from 'react';

export default function LoginPage() {
  const [showSignIn, setShowSignIn] = useState(true);

  return showSignIn ? (
    <SignInForm onSwitchToSignUp={() => setShowSignIn(false)} />
  ) : (
    <SignUpForm onSwitchToSignIn={() => setShowSignIn(true)} />
  );
}
