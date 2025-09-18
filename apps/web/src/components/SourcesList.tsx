'use client';

import SourceCard from '@/components/SourceCards';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { UiSelect } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { useSourcesEditor } from '@/hooks/use-sources-editor';

type SourcesListProps = {
  verificationId: string;
  onComplete: () => void;
};

export default function SourcesList({ verificationId, onComplete }: SourcesListProps) {
  const {
    sources,
    isLoading,
    error,
    selectedSourcesCount,
    toggleSourceSelection,
    canContinue,
    searchQuery,
    setSearchQuery,
    filters,
    setFilters,
    selectAll,
    deselectAll,
  } = useSourcesEditor({ verificationId });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
      </div>
    );
  }

  if (error) {
    return <p className="text-destructive">Error al cargar las fuentes: {error.message}</p>;
  }

  const domains = [...new Set(sources.map((s) => s.domain).filter(Boolean))];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 rounded-lg border bg-muted/50 p-4 md:grid-cols-3">
        <Input
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Buscar en título y resumen..."
          value={searchQuery}
        />
        <UiSelect
          onChange={(domain) => setFilters((prev) => ({ ...prev, domain }))}
          options={domains.map((d) => ({ value: d!, label: d! }))}
          placeholder="Filtrar por dominio"
          value={filters.domain}
        />
        <UiSelect
          onChange={(sortBy) => setFilters((prev) => ({ ...prev, sortBy }))}
          options={[
            { value: 'date_desc', label: 'Más recientes primero' },
            { value: 'date_asc', label: 'Más antiguos primero' },
          ]}
          placeholder="Ordenar por..."
          value={filters.sortBy}
        />
      </div>

      <div className="flex items-center justify-between">
        <h4 className="font-semibold">Fuentes Encontradas ({sources.length})</h4>
        <div className="flex items-center gap-4">
          <Button onClick={selectAll} size="sm" variant="link">
            Seleccionar todas
          </Button>
          <Button onClick={deselectAll} size="sm" variant="link">
            Deseleccionar todas
          </Button>
          <p className="font-medium text-sm">{selectedSourcesCount} seleccionada(s)</p>
        </div>
      </div>
      <div className="space-y-4">
        {sources.map((source) => (
          <SourceCard
            key={source.id}
            onSelectionChange={(isSelected) => toggleSourceSelection(source.id, isSelected)}
            source={source}
          />
        ))}
      </div>

      <div className="flex justify-end border-t pt-4">
        <Button disabled={!canContinue} onClick={onComplete}>
          Continuar con el Análisis
        </Button>
      </div>
    </div>
  );
}
