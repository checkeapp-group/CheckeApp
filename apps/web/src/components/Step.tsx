'use client';

import { Disclosure, Transition } from '@headlessui/react';
import { CheckCircleIcon, ChevronUpIcon } from 'lucide-react';
import type React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

type StepProps = {
  title: string;
  stepValue: string;
  isOpen: boolean;
  isCompleted: boolean;
  isDisabled: boolean;
  children: React.ReactNode;
  description?: string;
};

export default function Step({
  title,
  stepValue,
  isOpen,
  isCompleted,
  isDisabled,
  children,
  description,
}: StepProps) {
  const stepNumber = stepValue.split('-')[1];

  return (
    <Disclosure as="div" className="w-full" defaultOpen={isOpen}>
      {({ open }) => (
        <Card
          className={cn(
            'relative overflow-hidden border-l-2 border-l-transparent transition-all duration-300 sm:border-l-4',
            isOpen && !isCompleted && 'border-l-primary shadow-lg ring-1 ring-primary/20',
            isCompleted && 'border-l-green-500 bg-gradient-to-r from-green-50/50 to-transparent',
            isDisabled && 'bg-muted/50 opacity-60',
            !(isOpen || isCompleted) && 'hover:border-l-muted-foreground/30 hover:shadow-md'
          )}
        >
          <Disclosure.Button
            as={Button}
            className={cn(
              'h-auto w-full justify-start p-0 text-left font-normal',
              'focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
              isDisabled && 'pointer-events-none'
            )}
            disabled={isDisabled}
            variant="ghost"
          >
            <CardContent className="w-full p-3 sm:p-4 md:p-6">
              <div className="flex items-center justify-between gap-2 sm:gap-4">
                <div className="flex min-w-0 flex-1 items-start gap-2 sm:gap-3 md:gap-4">
                  {/* Step indicator */}
                  <div className="relative flex-shrink-0 pt-0.5 sm:pt-1">
                    {isCompleted ? (
                      <div className="relative">
                        <CheckCircleIcon className="h-5 w-5 text-green-500 sm:h-6 sm:w-6 md:h-7 md:w-7" />
                        <div className="-right-0.5 -top-0.5 sm:-right-1 sm:-top-1 absolute h-2 w-2 animate-pulse rounded-full bg-green-500 sm:h-3 sm:w-3" />
                      </div>
                    ) : (
                      <div
                        className={cn(
                          'relative flex h-5 w-5 items-center justify-center rounded-full border-2 transition-all duration-200 sm:h-6 sm:w-6 md:h-7 md:w-7',
                          isOpen
                            ? 'border-primary bg-primary text-primary-foreground shadow-md'
                            : 'border-muted-foreground/40 bg-background hover:border-primary/60'
                        )}
                      >
                        <span className="font-semibold text-xs sm:text-sm">{stepNumber}</span>
                        {isOpen && (
                          <div className="-inset-0.5 sm:-inset-1 absolute animate-ping rounded-full bg-primary/20" />
                        )}
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-2">
                      <h3
                        className={cn(
                          'font-semibold text-sm leading-tight transition-colors duration-200 sm:text-base md:text-lg',
                          isCompleted
                            ? 'text-green-700 dark:text-green-400'
                            : isOpen
                              ? 'text-primary'
                              : 'text-foreground'
                        )}
                      >
                        {title}
                      </h3>
                      {isCompleted && (
                        <span className="inline-flex items-center self-start rounded-full bg-green-100 px-1.5 py-0.5 font-medium text-green-800 text-xs sm:self-center sm:px-2 sm:py-1 dark:bg-green-900/30 dark:text-green-400">
                          <span className="hidden sm:inline">Completado</span>
                          <span className="sm:hidden">✓</span>
                        </span>
                      )}
                    </div>
                    {description && (
                      <p className="mt-0.5 line-clamp-2 text-muted-foreground text-xs leading-tight sm:mt-1 sm:text-sm">
                        {description}
                      </p>
                    )}
                  </div>
                </div>

                {/* Expand icon */}
                <div className="flex-shrink-0">
                  <ChevronUpIcon
                    className={cn(
                      'h-4 w-4 text-muted-foreground transition-all duration-300 sm:h-5 sm:w-5',
                      open ? 'rotate-180 text-primary' : 'rotate-0'
                    )}
                  />
                </div>
              </div>
            </CardContent>
          </Disclosure.Button>

          <Transition
            enter="transition-all duration-300 ease-out"
            enterFrom="transform translate-y-2 opacity-0 scale-98"
            enterTo="transform translate-y-0 opacity-100 scale-100"
            leave="transition-all duration-200 ease-in"
            leaveFrom="transform translate-y-0 opacity-100 scale-100"
            leaveTo="transform translate-y-2 opacity-0 scale-98"
          >
            <Disclosure.Panel>
              <CardContent className="px-3 pt-0 pb-3 sm:px-4 sm:pb-4 md:px-6 md:pb-6">
                {/* Mobile layout - no left line, simpler structure */}
                <div className="sm:hidden">
                  <div className="space-y-3 rounded-lg bg-muted/30 p-3">{children}</div>
                </div>

                {/* Desktop layout - with connecting line */}
                <div className="ml-6 hidden border-muted-foreground/20 border-l-2 border-dashed pl-3 sm:block md:ml-11 md:pl-4">
                  <div className="space-y-3 rounded-lg bg-muted/30 p-3 md:space-y-4 md:p-4">
                    {children}
                  </div>
                </div>
              </CardContent>
            </Disclosure.Panel>
          </Transition>

          {/* Subtle background pattern for visual interest */}
          {isOpen && !isCompleted && (
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent" />
          )}
        </Card>
      )}
    </Disclosure>
  );
}
