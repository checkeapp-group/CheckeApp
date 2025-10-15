'use client';

import type React from 'react';
import { createContext, useCallback, useContext, useMemo, useState } from 'react';

type LoadingContextType = {
  isLoading: boolean;
  addLoader: (id: string) => void;
  removeLoader: (id: string) => void;
};

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

export const LoadingProvider = ({ children }: { children: React.ReactNode }) => {
  const [activeLoaders, setActiveLoaders] = useState<Set<string>>(new Set());

  const addLoader = useCallback((id: string) => {
    setActiveLoaders((prev) => {
      const newSet = new Set(prev);
      newSet.add(id);
      return newSet;
    });
  }, []);

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

export const useLoading = () => {
  const context = useContext(LoadingContext);
  if (context === undefined) {
    throw new Error('useLoading must be used within a LoadingProvider');
  }
  return context;
};
