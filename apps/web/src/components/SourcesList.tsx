'use client';

import SourceCard from '@/components/SourceCards';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useSourcesEditor } from '@/hooks/use-sources-editor';

type SourcesListProps = {
  verificationId: string;
  onComplete: () => void;
};

export default function SourcesList({ verificationId, onComplete }: SourcesListProps) {
  const { sources, isLoading, error, selectedSourcesCount, toggleSourceSelection, canContinue } =
    useSourcesEditor({ verificationId });

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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h4 className="font-semibold">Fuentes Encontradas ({sources.length})</h4>
        <p className="font-medium text-sm">{selectedSourcesCount} seleccionada(s)</p>
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
