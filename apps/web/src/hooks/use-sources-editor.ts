'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { useGlobalLoader } from '@/hooks/use-global-loader';
import type { Source } from '@/types/source';
import { orpc } from '../utils/orpc';
import { useI18n } from './use-i18n';

type UseSourcesEditorProps = {
  verificationId: string;
};

const POLLING_TIMEOUT = Number(process.env.EXTERNAL_API_TIMEOUT) || 6000000;

type UseSourcesEditorReturn = {
  sources: Source[];
  isLoading: boolean;
  error: Error | null;
  selectedSourcesCount: number;
  toggleSourceSelection: (sourceId: string, isSelected: boolean) => void;
  canContinue: boolean;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  filters: { domain?: string; sortBy?: string };
  setFilters: (filters: { domain?: string; sortBy?: string }) => void;
  selectAll: () => void;
  deselectAll: () => void;
  availableDomains: string[];
  isUpdating: boolean;
  refetch: () => any;
  hasTimedOut: boolean;
  isPollingForSources: boolean;
};

export function useSourcesEditor({ verificationId }: UseSourcesEditorProps): UseSourcesEditorReturn {
  const queryClient = useQueryClient();
  const { t } = useI18n();

  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<{ domain?: string; sortBy?: string }>({
    sortBy: 'date_desc',
  });
  const [pollingStartTime, setPollingStartTime] = useState<number | null>(null);
  const [hasTimedOut, setHasTimedOut] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

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
    refetchInterval: (query: { state: { data?: Source[]; error: any } }) => {
      const hasData = query.state.data && query.state.data.length > 0;
      const hasError = query.state.error;
      const maxRetriesReached = retryCount >= 60;

      if (hasData || hasError || maxRetriesReached || hasTimedOut) {
        return false;
      }
      return Number(process.env.RETRY_DELAY) || 1000;
    },
  });

  // Iniciar el polling cuando se empiece a cargar
  useEffect(() => {
    const data = sourcesQuery.data;
    const shouldStartPolling =
      !pollingStartTime &&
      (!data || data.length === 0) &&
      !hasTimedOut &&
      !sourcesQuery.error &&
      (sourcesQuery.isLoading || sourcesQuery.isFetching);

    if (shouldStartPolling) {
      setPollingStartTime(Date.now());
    }
  }, [pollingStartTime, sourcesQuery.data, hasTimedOut, sourcesQuery.error, sourcesQuery.isLoading, sourcesQuery.isFetching]);

  // Detectar timeout
  useEffect(() => {
    if (!pollingStartTime || hasTimedOut) {
      return;
    }

    const checkTimeout = () => {
      const elapsed = Date.now() - pollingStartTime;
      const data = sourcesQuery.data;
      if (elapsed >= POLLING_TIMEOUT && (!data || data.length === 0)) {
        setHasTimedOut(true);
        toast.info(t('sources.timeout_error'));
      }
    };

    const timeoutId = setTimeout(checkTimeout, POLLING_TIMEOUT);
    return () => clearTimeout(timeoutId);
  }, [pollingStartTime, hasTimedOut, sourcesQuery.data, t]);

  // Actualizar retry count
  useEffect(() => {
    const data = sourcesQuery.data;
    if (data && data.length > 0) {
      setRetryCount(30);
      setPollingStartTime(null);
    } else if (sourcesQuery.isFetching) {
      setRetryCount((c) => c + 1);
    }
  }, [sourcesQuery.data, sourcesQuery.isFetching]);

  const updateSelectionMutation = useMutation({
    mutationFn: (variables: { sourceId: string; isSelected: boolean }) =>
      orpc.updateSourceSelection.call({ ...variables, verificationId }),

    onMutate: async (variables: { sourceId: string; isSelected: boolean }) => {
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
    onError: (_error, _variables, context) => {
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

  const refetch = useCallback(() => {
    setHasTimedOut(false);
    setPollingStartTime(null);
    setRetryCount(0);
    return sourcesQuery.refetch();
  }, [sourcesQuery]);

  const isPollingForSources =
    pollingStartTime !== null &&
    sources.length === 0 &&
    !hasTimedOut &&
    !sourcesQuery.error;

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
    refetch,
    hasTimedOut,
    isPollingForSources,
  };
}
