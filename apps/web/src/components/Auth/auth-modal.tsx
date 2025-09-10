import { Dialog, Transition } from '@headlessui/react';
import { Fragment, useState } from 'react';
import SignInForm from '@/components/Auth/sign-in-form';
import SignUpForm from '@/components/Auth/sign-up-form';

type AuthModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

export default function AuthModal({ isOpen, onClose }: AuthModalProps) {

  const [mode, setMode] = useState<'signIn' | 'signUp'>('signIn');

  const switchToSignUp = () => setMode('signUp');
  const switchToSignIn = () => setMode('signIn');

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
          <div className="fixed inset-0 bg-black/40" />
        </Transition.Child>

        <div className="fixed inset-0 flex items-center justify-center p-4 sm:p-6 lg:p-8">
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
          >
            <Dialog.Panel className="w-full max-w-md">
              {mode === 'signIn' ? (
                <SignInForm onClose={onClose} onSwitchToSignUp={switchToSignUp} />
              ) : (
                <SignUpForm onClose={onClose} onSwitchToSignIn={switchToSignIn} />
              )}
            </Dialog.Panel>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition>
  );
}
