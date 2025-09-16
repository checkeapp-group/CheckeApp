'use client';

import { Disclosure, Transition } from '@headlessui/react';
import { CheckCircleIcon, ChevronUpIcon, LockIcon } from 'lucide-react';
import type React from 'react';
import { Card } from '@/components/ui/Card';
import { cn } from '@/lib/utils';

type StepProps = {
  title: string;
  stepNumber: number;
  isOpen: boolean;
  isCompleted: boolean;
  isDisabled: boolean;
  children: React.ReactNode;
  description?: string;
};

export default function Step({
  title,
  stepNumber,
  isOpen,
  isCompleted,
  isDisabled,
  children,
  description,
}: StepProps) {
  return (
    <Disclosure as="div" className="w-full" defaultOpen={isOpen}>
      {/** biome-ignore lint/complexity/noExcessiveCognitiveComplexity: <explanation> */}
      {({ open }) => (
        <Card
          className={cn(
            'relative overflow-hidden transition-all duration-300',
            isOpen && !isCompleted && 'border-primary shadow-lg ring-2 ring-primary/20',
            isCompleted && 'border-green-500/30 bg-green-500/5',
            isDisabled && 'bg-muted/50 opacity-60'
          )}
        >
          <Disclosure.Button
            className={cn(
              'flex w-full items-center justify-between p-4 text-left',
              'focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
              isDisabled && 'cursor-not-allowed'
            )}
            disabled={isDisabled}
          >
            <div className="flex items-start gap-4">
              <div className="relative flex-shrink-0 pt-1">
                {isCompleted ? (
                  <CheckCircleIcon className="h-6 w-6 text-success" />
                  // biome-ignore lint/style/noNestedTernary: <explanation>
                ) : isDisabled ? (
                  <LockIcon className="h-6 w-6 text-muted-foreground" />
                ) : (
                  <div
                    className={cn(
                      'flex h-6 w-6 items-center justify-center rounded-full border-2 font-bold',
                      isOpen
                        ? 'border-primary bg-primary text-primary-foreground'
                        : 'border-muted-foreground bg-background text-muted-foreground'
                    )}
                  >
                    {stepNumber}
                  </div>
                )}
              </div>
              <div className="flex-1 text-left">
                <h3
                  className={cn(
                    'font-semibold text-lg',
                    isOpen ? 'text-primary' : 'text-foreground'
                  )}
                >
                  {title}
                </h3>
                {description && <p className="mt-1 text-muted-foreground text-sm">{description}</p>}
              </div>
            </div>
            <ChevronUpIcon
              className={cn(
                'h-5 w-5 text-muted-foreground transition-transform duration-300',
                open && 'rotate-180'
              )}
            />
          </Disclosure.Button>

          <Transition
            enter="transition duration-100 ease-out"
            enterFrom="transform scale-95 opacity-0"
            enterTo="transform scale-100 opacity-100"
            leave="transition duration-75 ease-out"
            leaveFrom="transform scale-100 opacity-100"
            leaveTo="transform scale-95 opacity-0"
          >
            <Disclosure.Panel className="px-4 pt-2 pb-4">
              <div className="ml-10 border-border border-l-2 border-dashed pl-4">{children}</div>
            </Disclosure.Panel>
          </Transition>
        </Card>
      )}
    </Disclosure>
  );
}
