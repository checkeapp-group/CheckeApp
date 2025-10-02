'use client';

import { Dialog, Transition } from '@headlessui/react';
import { Fragment, useState } from 'react';
import ForgotPasswordForm from './forgot-password-form';
import SignInForm from './sign-in-form';
import SignUpForm from './sign-up-form';

type AuthModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const [mode, setMode] = useState<'signIn' | 'signUp' | 'forgotPassword'>('signIn');

  const renderForm = () => {
    if (mode === 'signUp') {
      return <SignUpForm onClose={onClose} onSwitchToSignIn={() => setMode('signIn')} />;
    }
    if (mode === 'forgotPassword') {
      return <ForgotPasswordForm onClose={onClose} onSwitchToSignIn={() => setMode('signIn')} />;
    }
    return (
      <SignInForm
        onClose={onClose}
        onSwitchToForgotPassword={() => setMode('forgotPassword')}
        onSwitchToSignUp={() => setMode('signUp')}
      />
    );
  };

  return (
    <Transition as={Fragment} show={isOpen}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
        as={Fragment}
        enter="ease-out duration-300"
        enterFrom="opacity-0"
        enterTo="opacity-100"
        leave="ease-in duration-200"
        leaveFrom="opacity-100"
        leaveTo="opacity-0"
      >
        <div className="fixed inset-0" />
      </Transition.Child>

        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
          >
            <Dialog.Panel className="w-full max-w-md">{renderForm()}</Dialog.Panel>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition>
  );
}
