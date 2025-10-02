'use client';

import { Check } from 'lucide-react';
import { useState } from 'react';
import type { Source } from '@/../server/src/db/schema/schema';
import { Card } from '@/components/ui/card';
import { useI18n } from '@/hooks/use-i18n';
import { cn } from '@/lib/utils';
import { Button } from './ui/button';

type SourceCardProps = {
  source: Source;
  onSelectionChange: (isSelected: boolean) => void;
};

export default function SourceCard({ source, onSelectionChange }: SourceCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const { t } = useI18n();

  const summary = source.summary || '';
  const isTruncated = summary.length > 200;
  const displaySummary = isExpanded
    ? summary
    : `${summary.slice(0, 200)}${isTruncated ? '...' : ''}`;

  return (
    <Card
      aria-checked={source.isSelected}
      className={cn(
        'group cursor-pointer p-4 transition-all duration-300',
        source.isSelected
          ? 'scale-[1.02] border-primary bg-card shadow-lg shadow-primary/20'
          : 'border-border bg-card hover:border-primary/50 hover:shadow-md'
      )}
      onClick={() => onSelectionChange(!source.isSelected)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelectionChange(!source.isSelected);
        }
      }}
      tabIndex={0}
    >
      {/* Indicador visual superior */}
      <div
        className={cn(
          'md absolute top-0 right-0 left-0 h-2 rounded-t-lg border-radius transition-all duration-300',
          source.isSelected ? 'bg-gradient-to-r from-primary to-primary/50' : 'bg-transparent'
        )}
      />

      <div className="flex items-start gap-4">
        {/* Icono de selección animado */}
        <div className="relative mt-1 h-6 w-6 shrink-0">
          <div
            className={cn(
              'absolute inset-0 flex items-center justify-center rounded-full border-2 transition-all duration-300',
              source.isSelected
                ? 'scale-100 border-primary bg-primary'
                : 'scale-100 border-muted-foreground/30 bg-background group-hover:border-primary/50'
            )}
          >
            {source.isSelected && (
              <Check className="h-4 w-4 text-primary-foreground" strokeWidth={3} />
            )}
          </div>

          {/* Efecto de pulso al seleccionar */}
          {source.isSelected && (
            <div className="absolute inset-0 animate-ping rounded-full border-2 border-primary opacity-75" />
          )}
        </div>

        <div className="grid flex-1 gap-1.5 leading-none">
          <div>
            <p
              className={cn(
                'font-semibold transition-colors',
                source.isSelected ? 'text-primary' : 'text-foreground'
              )}
            >
              {source.title}
            </p>
            <a
              className="text-muted-foreground text-sm hover:underline"
              href={source.url}
              onClick={(e) => e.stopPropagation()}
              rel="noopener noreferrer"
              target="_blank"
            >
              {source.domain}
            </a>
          </div>

          {source.scrapingDate && (
            <p className="mt-1 text-muted-foreground text-xs">
              {t('sources.scraped')}: {new Date(source.scrapingDate).toLocaleDateString()}
            </p>
          )}

          <p className="mt-2 text-muted-foreground text-sm">{displaySummary}</p>

          {isTruncated && (
            <Button
              className="h-auto justify-start p-0 text-primary"
              onClick={(e) => {
                e.stopPropagation();
                setIsExpanded(!isExpanded);
              }}
              size="sm"
              variant="link"
            >
              {isExpanded ? t('sources.showLess') : t('sources.showMore')}
            </Button>
          )}
        </div>
      </div>

      {/* Hint text en hover */}
      <div
        className={cn(
          'mt-2 text-center text-muted-foreground text-xs transition-opacity',
          source.isSelected ? 'opacity-0' : 'opacity-0 group-hover:opacity-100'
        )}
      >
        {t('sources.clickToSelect')}
      </div>
    </Card>
  );
}
