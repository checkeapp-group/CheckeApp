import { useEffect } from 'react';
import { useLoading } from '@/providers/LoadingProvider';

export const useGlobalLoader = (isLoading: boolean, id: string) => {
  const { addLoader, removeLoader } = useLoading();

  useEffect(() => {
    if (isLoading) {
      addLoader(id);
    } else {
      removeLoader(id);
    }

    return () => {
      removeLoader(id);
    };
  }, [isLoading, id, addLoader, removeLoader]);
};