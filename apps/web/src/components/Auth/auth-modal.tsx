"use client";

import { Dialog, Transition } from "@headlessui/react";
import { Fragment } from "react";
import SignInForm from "./sign-in-form";

type AuthModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

// Modal dialog wrapper for authentication form with transition animations
export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
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
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" />
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
            <Dialog.Panel className="w-full max-w-md">
              <SignInForm onClose={onClose} />
            </Dialog.Panel>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition>
  );
}
