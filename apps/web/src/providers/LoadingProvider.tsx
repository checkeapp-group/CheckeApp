'use client';

import type React from 'react';
import { createContext, useCallback, useContext, useMemo, useState } from 'react';

type LoadingContextType = {
  isLoading: boolean;
  addLoader: (id: string) => void;
  removeLoader: (id: string) => void;
};

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

// Context provider managing global loading state with support for multiple concurrent loaders
export const LoadingProvider = ({ children }: { children: React.ReactNode }) => {
  const [activeLoaders, setActiveLoaders] = useState<Set<string>>(new Set());

    // Registers a new loader by ID to show global loading indicator
  const addLoader = useCallback((id: string) => {
    setActiveLoaders((prev) => {
      const newSet = new Set(prev);
      newSet.add(id);
      return newSet;
    });
  }, []);

    // Unregisters a loader by ID to hide loading indicator when all loaders complete
  const removeLoader = useCallback((id: string) => {
    setActiveLoaders((prev) => {
      const newSet = new Set(prev);
      newSet.delete(id);
      return newSet;
    });
  }, []);

  const value = useMemo(
    () => ({
      isLoading: activeLoaders.size > 0,
      addLoader,
      removeLoader,
    }),
    [activeLoaders.size, addLoader, removeLoader]
  );

  return <LoadingContext.Provider value={value}>{children}</LoadingContext.Provider>;
};

// Hook to access loading context for adding/removing loaders
export const useLoading = () => {
  const context = useContext(LoadingContext);
  if (context === undefined) {
    throw new Error('useLoading must be used within a LoadingProvider');
  }
  return context;
};
