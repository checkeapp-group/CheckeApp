"use client";

import { Dialog, Transition } from "@headlessui/react";
import { X } from "lucide-react";
import { Fragment } from "react";
import { Button } from "./button";
import { Card } from "./card";

type ModalProps = {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
  description?: string;
  size?: "sm" | "md" | "lg" | "xl";
  backgroundColor?: string;
};

export function Modal({
  isOpen,
  onClose,
  title,
  description,
  children,
  size = "md",
  backgroundColor = "bg-background",
}: ModalProps) {
  const sizeClasses = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
  };

  return (
    <Transition appear as={Fragment} show={isOpen}>
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
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center sm:p-6">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel asChild>
                <Card
                  className={`w-full ${sizeClasses[size]} ${backgroundColor} transform overflow-hidden bg-white p-4 text-left align-middle shadow-xl transition-all sm:p-6`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      {title && (
                        <Dialog.Title
                          as="h3"
                          className="pr-8 font-bold text-foreground text-lg leading-6 sm:text-xl"
                        >
                          {title}
                        </Dialog.Title>
                      )}
                      {description && (
                        <Dialog.Description className="mt-1 text-muted-foreground text-sm">
                          {description}
                        </Dialog.Description>
                      )}
                    </div>
                    <Button
                      aria-label="Cerrar modal"
                      className="-mt-1 -mr-1 shrink-0"
                      onClick={onClose}
                      size="icon"
                      variant="ghost"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="mt-4">{children}</div>
                </Card>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
