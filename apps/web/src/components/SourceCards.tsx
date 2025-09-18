'use client';

import { useState } from 'react';
import type { source } from '@/../server/src/db/schema/schema';
import { Card } from '@/components/ui/Card';
import { cn } from '@/lib/utils';
import { Button } from './ui/button';
import { Checkbox } from './ui/checkbox';

type SourceCardProps = {
  source: source;
  onSelectionChange: (isSelected: boolean) => void;
};

export default function SourceCard({ source, onSelectionChange }: SourceCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const summary = source.summary || '';
  const isTruncated = summary.length > 200;
  const displaySummary = isExpanded
    ? summary
    : `${summary.slice(0, 200)}${isTruncated ? '...' : ''}`;

  return (
    <Card
      className={cn(
        'p-4 transition-all',
        source.isSelected && 'border-primary ring-2 ring-primary/20'
      )}
    >
      <div className="flex items-start gap-4">
        <Checkbox
          checked={source.isSelected}
          className="mt-1 scale-60"
          id={source.id}
          onCheckedChange={(checked) => onSelectionChange(Boolean(checked))}
        />
        <div className="grid flex-1 gap-1.5 leading-none">
          <label className="cursor-pointer" htmlFor={source.id}>
            <p className="font-semibold text-foreground">{source.title}</p>
            <a
              className="text-muted-foreground text-sm hover:underline"
              href={source.url}
              onClick={(e) => e.stopPropagation()}
              rel="noopener noreferrer"
              target="_blank"
            >
              {source.domain}
            </a>
          </label>

          {source.scrapingDate && (
            <p className="mt-1 text-muted-foreground text-xs">
              Obtenido: {new Date(source.scrapingDate).toLocaleDateString()}
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
              {isExpanded ? 'Ver menos' : 'Ver completo'}
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}
