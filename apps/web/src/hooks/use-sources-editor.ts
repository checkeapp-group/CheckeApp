'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useMemo } from 'react';
import { toast } from 'sonner';
import { orpc } from '../utils/orpc';

type UseSourcesEditorProps = {
  verificationId: string;
};

export function useSourcesEditor({ verificationId }: UseSourcesEditorProps) {
  const queryClient = useQueryClient();

  const sourcesQuery = useQuery(
    orpc.getSources.queryOptions({
      input: { verificationId },
      enabled: !!verificationId,
    })
  );

  const invalidateSources = () => {
    queryClient.invalidateQueries({
      queryKey: orpc.getSources.key({ input: { verificationId } }),
    });
  };

  const updateSelectionMutation = useMutation(
    orpc.updateSourceSelection.mutationOptions({
      onSuccess: (data) => {
        toast.success(`Fuente ${data.isSelected ? 'seleccionada' : 'deseleccionada'}.`);
        invalidateSources();
      },
      // biome-ignore lint/suspicious/noExplicitAny: <explanation>
      onError: (error: any) => {
        toast.error(`Error: ${error.message}`);
        invalidateSources();
      },
    })
  );

  const sources = useMemo(() => sourcesQuery.data || [], [sourcesQuery.data]);
  const selectedSourcesCount = useMemo(() => sources.filter((s) => s.isSelected).length, [sources]);

  const toggleSourceSelection = (sourceId: string, isSelected: boolean) => {
    updateSelectionMutation.mutate({ verificationId, sourceId, isSelected });
  };

  return {
    sources,
    isLoading: sourcesQuery.isLoading,
    error: sourcesQuery.error,
    selectedSourcesCount,
    toggleSourceSelection,
    canContinue: selectedSourcesCount > 0,
  };
}
