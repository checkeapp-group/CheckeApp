'use client';

import type { source } from '@/../server/src/db/schema/schema';
import { Card } from '@/components/ui/Card';
import { Checkbox } from '@/components/ui/checkbox';

type SourceCardProps = {
  source: source;
  onSelectionChange: (isSelected: boolean) => void;
};

export default function SourceCard({ source, onSelectionChange }: SourceCardProps) {
  return (
    <Card
      className={`p-4 transition-all ${source.isSelected ? 'border-primary ring-2 ring-primary/20' : ''}`}
    >
      <div className="flex items-start gap-4">
        <Checkbox
          checked={source.isSelected}
          className="mt-1"
          id={source.id}
          onCheckedChange={(checked) => onSelectionChange(Boolean(checked))}
        />
        <div className="grid gap-1.5 leading-none">
          <label
            className="cursor-pointer font-semibold text-base text-foreground"
            htmlFor={source.id}
          >
            {source.title}
          </label>
          <a
            className="text-muted-foreground text-sm hover:underline"
            href={source.url}
            rel="noopener noreferrer"
            target="_blank"
          >
            {source.domain}
          </a>
          <p className="mt-2 text-muted-foreground text-sm">{source.summary}</p>
        </div>
      </div>
    </Card>
  );
}
