"use client";

import { Check, ExternalLink } from "lucide-react";
import { useState } from "react";
import type { Source } from "@/../server/src/db/schema/schema";
import { Card } from "@/components/ui/card";
import { useI18n } from "@/hooks/use-i18n";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";

type SourceCardProps = {
  source: Source;
  onSelectionChange: (isSelected: boolean) => void;
};

export default function SourceCard({
  source,
  onSelectionChange,
}: SourceCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const { t } = useI18n();

  const summary = source.summary || "";
  const TRUNCATE_LENGTH = 350;
  const isTruncated = summary.length > TRUNCATE_LENGTH;
  const displaySummary = isExpanded
    ? summary
    : `${summary.slice(0, TRUNCATE_LENGTH)}${isTruncated ? "..." : ""}`;

  return (
    <Card
      aria-checked={source.isSelected}
      className={cn(
        "group cursor-pointer overflow-hidden p-5 transition-all duration-200",
        source.isSelected
          ? "scale-[1.02] border-primary bg-card shadow-lg shadow-primary/10"
          : "border-border bg-card hover:border-primary/40 hover:shadow-md"
      )}
      onClick={() => onSelectionChange(!source.isSelected)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelectionChange(!source.isSelected);
        }
      }}
      role="checkbox"
      tabIndex={0}
    >
      {/* Header */}
      <div
        className={cn(
          "absolute top-0 right-0 left-0 h-1.5 rounded-t-lg transition-all duration-200",
          source.isSelected
            ? "bg-gradient-to-r from-primary to-primary/60"
            : "bg-transparent"
        )}
      />

      <div className="flex items-start gap-4">
        {/* Selection checkbox */}
        <div className="relative mt-0.5 h-5 w-5 shrink-0">
          <div
            className={cn(
              "flex h-full w-full items-center justify-center rounded-md border-2 transition-all duration-200",
              source.isSelected
                ? "border-primary bg-primary"
                : "border-muted-foreground/30 bg-background group-hover:border-primary/50"
            )}
          >
            {source.isSelected && (
              <Check
                className="h-3.5 w-3.5 text-primary-foreground"
                strokeWidth={3}
              />
            )}
          </div>
        </div>

        <div className="flex-1 space-y-2.5">
          {/* Title */}
          <h3
            className={cn(
              "line-clamp-2 font-bold text-base leading-snug transition-colors",
              source.isSelected ? "text-primary" : "text-foreground"
            )}
          >
            {source.title}
          </h3>

          {/* Metadata: domain and date */}
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <a
              aria-label={`Abrir ${source.domain} en nueva pestaña`}
              className="inline-flex items-center gap-1.5 font-medium text-primary transition-colors hover:text-primary/80 hover:underline"
              href={source.url}
              onClick={(e) => e.stopPropagation()}
              rel="noopener noreferrer"
              target="_blank"
            >
              <img
                alt=""
                className="h-4 w-4"
                onError={(e) => {
                  e.currentTarget.src = `https://icons.duckduckgo.com/ip3/${source.domain}.ico`;
                }}
                src={
                  source.favicon ||
                  `https://www.google.com/s2/favicons?domain=${source.domain}&sz=16`
                }
              />
              {source.domain}
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
            {source.scrapingDate && (
              <>
                <span className="text-muted-foreground">•</span>
                <span className="text-muted-foreground text-xs">
                  {new Date(source.scrapingDate).toLocaleDateString("es-ES", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </span>
              </>
            )}
          </div>

          {/* Summary */}
          {summary && (
            <>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {displaySummary}
              </p>

              {isTruncated && (
                <Button
                  aria-expanded={isExpanded}
                  className="h-auto p-0 font-semibold text-xs hover:no-underline"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsExpanded(!isExpanded);
                  }}
                  variant="link"
                >
                  {isExpanded ? "← Mostrar menos" : "Leer más →"}
                </Button>
              )}
            </>
          )}
        </div>
      </div>
    </Card>
  );
}
