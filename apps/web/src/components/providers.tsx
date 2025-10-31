"use client";

import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { Suspense } from "react";
import { LoadingProvider } from "@/providers/LoadingProvider";
import { queryClient } from "@/utils/orpc";
import RootLayout from "./Layout/RootLayout";
import { ThemeProvider } from "./theme-provider";
import { Toaster } from "./ui/sonner";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      disableTransitionOnChange
      enableSystem
    >
      <QueryClientProvider client={queryClient}>
        <LoadingProvider>
          <Suspense fallback={<div>Loading...</div>}>
            <RootLayout>{children}</RootLayout>
          </Suspense>
        </LoadingProvider>
        <ReactQueryDevtools />
      </QueryClientProvider>
      <Toaster richColors />
    </ThemeProvider>
  );
}
