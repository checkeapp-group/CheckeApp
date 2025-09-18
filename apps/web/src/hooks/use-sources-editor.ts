'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { orpc } from '../utils/orpc';

type UseSourcesEditorProps = {
  verificationId: string;
};

export function useSourcesEditor({ verificationId }: UseSourcesEditorProps) {
  const queryClient = useQueryClient();

  const [searchQuery, setSearchQuery] = useState('');

  const [filters, setFilters] = useState<{ domain?: string; sortBy?: string }>({});

  const sourcesQuery = useQuery(
    orpc.getSources.queryOptions({
      input: { verificationId, filters, searchQuery },
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

  const batchUpdateSelectionMutation = useMutation({
    mutationFn: async (isSelected: boolean) => {
      const promises = sources.map((s) =>
        updateSelectionMutation.mutateAsync({ verificationId, sourceId: s.id, isSelected })
      );
      await Promise.all(promises);
    },
    onSuccess: () => {
      toast.success('Selección masiva actualizada.');
      invalidateSources();
    },
    onError: (error: any) => {
      toast.error(`Error en la selección masiva: ${error.message}`);
    },
  });

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

    searchQuery,
    setSearchQuery,
    filters,
    setFilters,
    selectAll: () => batchUpdateSelectionMutation.mutate(true),
    deselectAll: () => batchUpdateSelectionMutation.mutate(false),
  };
}
