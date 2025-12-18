'use client';

import { ThemeProvider as NextThemesProvider } from 'next-themes';
import type * as React from 'react';

// Theme provider component wrapping next-themes with forced light mode configuration
export function ThemeProvider({
  children,
  ...props
}: React.ComponentProps<typeof NextThemesProvider>) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="light"
      disableTransitionOnChange
      enableSystem={false}
      forcedTheme="light"
      {...props}
    >
      {children}
    </NextThemesProvider>
  );
}
