'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { useGlobalLoader } from '@/hooks/use-global-loader';
import type { Source } from '@/types/source';
import { orpc } from '../utils/orpc';

type UseSourcesEditorProps = {
  verificationId: string;
};

export function useSourcesEditor({ verificationId }: UseSourcesEditorProps) {
  const queryClient = useQueryClient();

  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<{ domain?: string; sortBy?: string }>({
    sortBy: 'date_desc',
  });

  const queryKey = orpc.getSources.key({
    input: { verificationId, filters, searchQuery },
  });

  const sourcesQuery = useQuery({
    queryKey,
    queryFn: () =>
      orpc.getSources.call({
        verificationId,
        filters,
        searchQuery,
      }),
    enabled: !!verificationId,
  });

  const updateSelectionMutation = useMutation({
    mutationFn: (variables: { sourceId: string; isSelected: boolean }) =>
      orpc.updateSourceSelection.call({ ...variables, verificationId }),

    onMutate: async (variables: {
      previousSources: any;
      sourceId: string;
      isSelected: boolean;
    }) => {
      await queryClient.cancelQueries({ queryKey });
      const previousSources = queryClient.getQueryData<Source[]>(queryKey);

      queryClient.setQueryData<Source[]>(queryKey, (oldData) =>
        oldData
          ? oldData.map((s) =>
              s.id === variables.sourceId ? { ...s, isSelected: variables.isSelected } : s
            )
          : []
      );

      return { previousSources };
    },
    onError: (context) => {
      if (context?.previousSources) {
        queryClient.setQueryData(queryKey, context.previousSources);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey });
    },
    onSuccess: (data) => {
      toast.success(`Fuente ${data.isSelected ? 'seleccionada' : 'deseleccionada'}.`);
    },
  });

  const batchUpdateSelectionMutation = useMutation({
    mutationFn: async (isSelected: boolean) => {
      const sourcesToUpdate = sourcesQuery.data || [];
      const promises = sourcesToUpdate.map((s) =>
        orpc.updateSourceSelection.call({ verificationId, sourceId: s.id, isSelected })
      );
      return Promise.all(promises);
    },
    onMutate: async (isSelected: boolean) => {
      await queryClient.cancelQueries({ queryKey });
      const previousSources = queryClient.getQueryData<Source[]>(queryKey);

      queryClient.setQueryData<Source[]>(queryKey, (oldData) =>
        oldData ? oldData.map((s) => ({ ...s, isSelected })) : []
      );

      return { previousSources };
    },
    onError: (err, variables, context) => {
      toast.error(`Error en la selección masiva: ${err.message}`);
      if (context?.previousSources) {
        queryClient.setQueryData(queryKey, context.previousSources);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey });
    },
    onSuccess: () => {
      toast.success('Selección masiva actualizada.');
    },
  });

  const previewSourceMutation = useMutation({
    mutationFn: (url: string) => orpc.getSourcePreview.call({ url }),
    onError: (error: any) => {
      toast.error(`Error al obtener vista previa: ${error.message}`);
    },
  });

  const sources = useMemo(() => sourcesQuery.data || [], [sourcesQuery.data]);
  const selectedSourcesCount = useMemo(() => sources.filter((s) => s.isSelected).length, [sources]);

  const toggleSourceSelection = (sourceId: string, isSelected: boolean) => {
    updateSelectionMutation.mutate({ sourceId, isSelected });
  };

  const allDomainsQuery = useQuery({
    queryKey: orpc.getSources.key({ input: { verificationId } }),
    queryFn: () => orpc.getSources.call({ verificationId }),
    enabled: !!verificationId,
  });

  const availableDomains = useMemo(() => {
    const domains = allDomainsQuery.data?.map((s) => s.domain).filter(Boolean) as string[];
    return [...new Set(domains)];
  }, [allDomainsQuery.data]);

  useGlobalLoader(sourcesQuery.isLoading, `sources-loading-${verificationId}`);
  useGlobalLoader(updateSelectionMutation.isPending, `source-update-${verificationId}`);
  useGlobalLoader(batchUpdateSelectionMutation.isPending, `source-batch-update-${verificationId}`);

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

    availableDomains,
    isUpdating: updateSelectionMutation.isPending || batchUpdateSelectionMutation.isPending,
  };
}
