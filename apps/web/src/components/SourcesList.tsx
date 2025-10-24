"use client";

import SourceCard from "@/components/SourceCards";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { UiSelect } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useGlobalLoader } from "@/hooks/use-global-loader";
import { useI18n } from "@/hooks/use-i18n";
import { useSourcesEditor } from "@/hooks/use-sources-editor";

function SourcesListSkeleton() {
  return (
    <div className="animate-pulse space-y-4">
      {[...new Array(3)].map((_, i) => (
        <Card className="liquid-glass p-4" key={i}>
          <div className="flex items-start gap-4">
            <Skeleton className="mt-1 h-5 w-5 flex-shrink-0 rounded-sm bg-white/20" />
            <div className="min-w-0 flex-1 space-y-2.5">
              <Skeleton className="h-4 w-3/4 rounded bg-white/20" />
              <Skeleton className="h-3 w-1/4 rounded bg-white/20" />
              <div className="space-y-2 pt-2">
                <Skeleton className="h-3 w-full rounded bg-white/20" />
                <Skeleton className="h-3 w-5/6 rounded bg-white/20" />
              </div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}

type SourcesListProps = {
  verificationId: string;
  onComplete: () => void;
  isContinuing?: boolean;
  isLocked?: boolean;
};

export default function SourcesList({
  verificationId,
  onComplete,
  isContinuing,
  isLocked = false,
}: SourcesListProps) {
  const { t } = useI18n();
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
    availableDomains,
    isUpdating,
  } = useSourcesEditor({ verificationId });

  if (isLoading && !sources.length) {
    return <SourcesListSkeleton />;
  }

  if (error) {
    return (
      <p className="text-destructive">
        {t("sources.error_loading")}: {error.message}
      </p>
    );
  }

  return (
    <div
      className={`space-y-6 bg-gray-100 ${
        isLocked ? "pointer-events-none opacity-70" : ""
      }`}
    >
      <div className="grid grid-cols-1 gap-4 rounded-lg border bg-gray-100 p-4 md:grid-cols-3">
        <Input
          disabled={isLocked}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={t("sources.search_placeholder")}
          value={searchQuery}
        />
        <UiSelect
          disabled={isLocked}
          onChange={(domain) =>
            setFilters((prev) => ({
              ...prev,
              domain: domain === "all" ? undefined : domain,
            }))
          }
          options={[
            { value: "all", label: t("sources.all_domains") },
            ...availableDomains.map((d) => ({ value: d, label: d })),
          ]}
          placeholder={t("sources.filter_by_domain")}
          value={filters.domain || "all"}
        />
        <UiSelect
          disabled={isLocked}
          onChange={(sortBy) => setFilters((prev) => ({ ...prev, sortBy }))}
          options={[
            { value: "date_desc", label: t("sources.sort_newest_first") },
            { value: "date_asc", label: t("sources.sort_oldest_first") },
          ]}
          placeholder={t("sources.sort_by")}
          value={filters.sortBy}
        />
      </div>

      <div className="flex items-center justify-between">
        <h4 className="font-semibold">
          {t("sources.found_title", { count: sources.length })}
        </h4>
        <div className="flex items-center gap-4">
          <Button
            disabled={isLocked}
            onClick={selectAll}
            size="sm"
            variant="link"
          >
            {t("sources.select_all")}
          </Button>
          <Button
            disabled={isLocked}
            onClick={deselectAll}
            size="sm"
            variant="link"
          >
            {t("sources.deselect_all")}
          </Button>
          <p className="font-medium text-sm">
            {t("sources.selected_count", { count: selectedSourcesCount })}
          </p>
        </div>
      </div>
      <div className="space-y-4">
        {sources.map((source) => (
          <SourceCard
            isLocked={isLocked}
            key={source.id}
            onSelectionChange={(isSelected) =>
              toggleSourceSelection(source.id, isSelected)
            }
            source={source}
          />
        ))}
      </div>

      <div className="flex justify-end border-t pt-4">
        <Button
          disabled={!canContinue || isContinuing || isLocked}
          onClick={onComplete}
        >
          {isContinuing
            ? t("sources.starting")
            : t("sources.continue_analysis")}
        </Button>
      </div>
    </div>
  );
}
