'use client';

import type { source } from '@/../server/src/db/schema/schema';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';

type SourceCardProps = {
  source: source;
  onSelectionChange: (isSelected: boolean) => void;
};

export default function SourceCard({ source, onSelectionChange }: SourceCardProps) {
  return (
    <Card className={`transition-all ${source.isSelected ? 'border-primary' : ''}`}>
      <CardHeader className="flex-row items-start gap-4 space-y-0">
        <Checkbox
          checked={source.isSelected}
          id={source.id}
          onCheckedChange={(checked) => onSelectionChange(Boolean(checked))}
        />
        <div className="grid gap-1.5 leading-none">
          <label className="cursor-pointer font-medium text-base" htmlFor={source.id}>
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
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground text-sm">{source.summary}</p>
      </CardContent>
    </Card>
  );
}
