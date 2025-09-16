import type * as React from 'react';
import { cn } from '@/lib/utils';

interface CardProps extends React.ComponentProps<'div'> {
  asChild?: boolean;
  role?: string;
  'aria-labelledby'?: string;
  'aria-describedby'?: string;
}

function Card({ className, role = 'region', asChild = false, ...props }: CardProps) {
  const Component = asChild ? React.Fragment : 'div';

  return (
    <Component
      className={cn(
        'flex w-full flex-col',
        'gap-3 p-3 sm:gap-4 sm:p-4 md:gap-6 md:py-6',
        'rounded-lg border bg-card text-card-foreground shadow-sm sm:rounded-xl',
        'transition-shadow duration-200 focus-within:shadow-lg hover:shadow-md',
        'forced-colors:border-[ButtonBorder]',
        className
      )}
      data-slot="card"
      role={role}
      {...props}
    />
  );
}

interface CardHeaderProps extends React.ComponentProps<'header'> {
  asChild?: boolean;
}

function CardHeader({ className, asChild = false, ...props }: CardHeaderProps) {
  const Component = asChild ? React.Fragment : 'header';

  return (
    <Component
      className={cn(
        '@container/card-header grid w-full auto-rows-min items-start',
        'gap-1 px-3 sm:gap-1.5 sm:px-4 md:px-6',
        'grid-rows-[auto_auto] has-data-[slot=card-action]:grid-cols-[1fr_auto] has-data-[slot=card-action]:gap-2 sm:has-data-[slot=card-action]:gap-3',
        '[&.border-b]:border-b [&.border-b]:pb-3 sm:[&.border-b]:pb-4 md:[&.border-b]:pb-6',
        className
      )}
      data-slot="card-header"
      {...props}
    />
  );
}

interface CardTitleProps extends React.ComponentProps<'h3'> {
  asChild?: boolean;
  level?: 1 | 2 | 3 | 4 | 5 | 6;
}

function CardTitle({ className, asChild = false, level = 3, ...props }: CardTitleProps) {
  if (asChild) {
    return <React.Fragment {...props} />;
  }

  const HeadingComponent = `h${level}` as keyof JSX.IntrinsicElements;

  return (
    <HeadingComponent
      className={cn(
        'font-semibold text-sm leading-tight sm:text-base md:text-lg',
        'hyphens-auto break-words',
        'text-card-foreground',
        'forced-colors:text-[ButtonText]',
        className
      )}
      data-slot="card-title"
      {...props}
    />
  );
}

interface CardDescriptionProps extends React.ComponentProps<'p'> {
  asChild?: boolean;
}

function CardDescription({ className, asChild = false, ...props }: CardDescriptionProps) {
  const Component = asChild ? React.Fragment : 'p';

  return (
    <Component
      className={cn(
        'text-muted-foreground text-xs sm:text-sm',
        'leading-relaxed',
        'hyphens-auto break-words',
        'forced-colors:text-[ButtonText]',
        className
      )}
      data-slot="card-description"
      {...props}
    />
  );
}

interface CardActionProps extends React.ComponentProps<'div'> {
  asChild?: boolean;
  'aria-label'?: string;
}

function CardAction({
  className,
  asChild = false,
  'aria-label': ariaLabel,
  ...props
}: CardActionProps) {
  const Component = asChild ? React.Fragment : 'div';

  return (
    <Component
      aria-label={ariaLabel || 'Card actions'}
      className={cn(
        // Grid positioning - responsive
        'col-start-2 row-span-2 row-start-1 self-start justify-self-end',
        // Flex layout for action items
        'flex flex-wrap items-center justify-end gap-1 sm:gap-2',
        // Responsive sizing
        'min-h-[2rem] sm:min-h-[2.5rem]',
        className
      )}
      data-slot="card-action"
      role="group"
      {...props}
    />
  );
}

interface CardContentProps extends React.ComponentProps<'div'> {
  asChild?: boolean;
  role?: string;
}

function CardContent({ className, asChild = false, role, ...props }: CardContentProps) {
  const Component = asChild ? React.Fragment : 'div';

  return (
    <Component
      className={cn(
        // Responsive padding
        'px-3 sm:px-4 md:px-6',
        // Full width and proper spacing
        'w-full',
        // Text and content styling
        'text-sm sm:text-base',
        // Overflow handling
        'overflow-hidden',
        className
      )}
      data-slot="card-content"
      role={role}
      {...props}
    />
  );
}

interface CardFooterProps extends React.ComponentProps<'footer'> {
  asChild?: boolean;
}

function CardFooter({ className, asChild = false, ...props }: CardFooterProps) {
  const Component = asChild ? React.Fragment : 'footer';

  return (
    <Component
      className={cn(
        // Flex layout - responsive
        'flex w-full flex-col gap-2 px-3 sm:flex-row sm:items-center sm:gap-3 sm:px-4 md:px-6',
        // Border handling
        '[&.border-t]:border-t [&.border-t]:pt-3 sm:[&.border-t]:pt-4 md:[&.border-t]:pt-6',
        // Responsive text size
        'text-sm',
        className
      )}
      data-slot="card-footer"
      {...props}
    />
  );
}

// Additional utility components for better responsive behavior
interface CardImageProps extends React.ComponentProps<'div'> {
  src?: string;
  alt?: string;
  aspectRatio?: 'square' | 'video' | 'wide' | 'auto';
}

function CardImage({
  className,
  src,
  alt = '',
  aspectRatio = 'auto',
  children,
  ...props
}: CardImageProps) {
  const aspectRatioClasses = {
    square: 'aspect-square',
    video: 'aspect-video',
    wide: 'aspect-[2/1]',
    auto: 'aspect-auto',
  };

  return (
    <div
      className={cn(
        // Responsive container
        'w-full overflow-hidden',
        // Aspect ratio
        aspectRatioClasses[aspectRatio],
        // Border radius - responsive
        'rounded-t-lg sm:rounded-t-xl',
        className
      )}
      {...props}
    >
      {src ? (
        <img alt={alt} className="h-full w-full object-cover" loading="lazy" src={src} />
      ) : (
        children
      )}
    </div>
  );
}

// Responsive grid container for multiple cards
interface CardGridProps extends React.ComponentProps<'div'> {
  cols?: 1 | 2 | 3 | 4;
}

function CardGrid({ className, cols = 1, ...props }: CardGridProps) {
  const gridClasses = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
  };

  return (
    <div
      className={cn(
        'grid w-full',
        gridClasses[cols],
        // Responsive gaps
        'gap-3 sm:gap-4 md:gap-6',
        // Auto-fit for very large screens
        'auto-rows-fr',
        className
      )}
      {...props}
    />
  );
}

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardAction,
  CardDescription,
  CardContent,
  CardImage,
  CardGrid,
};
