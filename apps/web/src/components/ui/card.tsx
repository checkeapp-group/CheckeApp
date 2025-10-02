import { Slot } from '@radix-ui/react-slot';
import React from 'react';
import { cn } from '@/lib/utils';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  asChild?: boolean;
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'div';

    return (
      <Comp
        className={cn(
          'text-card-foreground',
          'rounded-xl border border-border/50',
          'shadow-sm transition-shadow duration-300 hover:shadow-md',
          'focus-within:border-ring focus-within:ring-2 focus-within:ring-ring/20',
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Card.displayName = 'Card';

export { Card };
