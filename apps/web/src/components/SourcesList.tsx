"use client";

import { AlertCircle, Info, Loader2, RefreshCw } from "lucide-react";
import SourceCard from "@/components/SourceCards";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { UiSelect } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
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
  isPollingForSources?: boolean;
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
    refetch,
    hasTimedOut,
    isPollingForSources,
  } = useSourcesEditor({ verificationId });

  if (isPollingForSources && !sources.length) {
    return (
      <div className="space-y-4">
        <Card className="border-primary/30 bg-primary/5 p-6 text-center sm:p-12">
          <Loader2 className="mx-auto mb-4 h-10 w-10 animate-spin text-primary sm:h-12 sm:w-12" />
          <p className="mb-2 font-semibold text-base text-primary sm:text-lg">
            {t("sources.searching")}
          </p>
          <p className="text-muted-foreground text-xs sm:text-sm">
            {t("sources.searching_description")}
          </p>
        </Card>
        {hasTimedOut && (
          <Card className="fade-in slide-in-from-bottom-4 animate-in border-green-200 bg-green-50 p-4 duration-700">
            <div className="flex items-start gap-3">
              <Info className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-600" />
              <div className="flex-1">
                <p className="font-medium text-green-900 text-sm">
                  {t("sources.taking_long_title")}
                </p>
                <p className="mt-1 text-green-700 text-xs">
                  {t("sources.taking_long_description")}
                </p>
              </div>
            </div>
          </Card>
        )}
      </div>
    );
  }

  if (hasTimedOut && !sources.length) {
    return (
      <Card className="border-green-200 bg-green-50 p-6 text-center sm:p-8">
        <Info className="mx-auto mb-4 h-10 w-10 text-green-600 sm:h-12 sm:w-12" />
        <p className="mb-4 font-semibold text-green-900">
          {t("sources.timeout_error")}
        </p>
        <Button onClick={() => refetch()} variant="default">
          <RefreshCw className="mr-2 h-4 w-4" /> {t("common.retry")}
        </Button>
      </Card>
    );
  }

  if (isLoading && !sources.length) {
    return <SourcesListSkeleton />;
  }

  if (error) {
    return (
      <Card className="border-green-200 bg-green-50 p-6 text-center sm:p-8">
        <AlertCircle className="mx-auto mb-4 h-10 w-10 text-green-600 sm:h-12 sm:w-12" />
        <p className="mb-4 font-semibold text-green-900">
          {t("sources.error_loading")}: {error.message}
        </p>
        <Button onClick={() => refetch()} variant="default">
          <RefreshCw className="mr-2 h-4 w-4" /> {t("common.retry")}
        </Button>
      </Card>
    );
  }

  return (
    <div
      className={`space-y-4 sm:space-y-6 ${
        isLocked ? "pointer-events-none opacity-70" : ""
      }`}
    >
      <div className="grid grid-cols-1 gap-3 rounded-lg border bg-gray-100 p-3 sm:grid-cols-2 sm:gap-4 sm:p-4 lg:grid-cols-3">
        <Input
          className="w-full"
          disabled={isLocked}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={t("sources.search_placeholder")}
          value={searchQuery}
        />
        <UiSelect
          disabled={isLocked}
          onChange={(domain) =>
            setFilters({
              ...filters,
              domain: domain === "all" ? undefined : domain,
            })
          }
          options={[
            { value: "all", label: t("sources.all_domains") },
            ...availableDomains.map((d) => ({ value: d, label: d })),
          ]}
          placeholder={t("sources.filter_by_domain")}
          value={filters.domain || "all"}
        />
        <UiSelect
          className="sm:col-span-2 lg:col-span-1"
          disabled={isLocked}
          onChange={(domain) =>
            setFilters({
              ...filters,
              domain: domain === "all" ? undefined : domain,
            })
          }
          options={[
            {
              value: "date_desc",
              label: t("sources.sort_newest_first"),
            },
            {
              value: "date_asc",
              label: t("sources.sort_oldest_first"),
            },
          ]}
          placeholder={t("sources.sort_by")}
          value={filters.sortBy}
        />
      </div>

      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h4 className="font-semibold text-sm sm:text-base">
          {t("sources.found_title", { count: sources.length })}
        </h4>
        <div className="flex flex-wrap items-center gap-2 sm:gap-4">
          <Button
            className="h-auto p-0 text-xs sm:text-sm"
            disabled={isLocked}
            onClick={selectAll}
            size="sm"
            variant="link"
          >
            {t("sources.select_all")}
          </Button>
          <Button
            className="h-auto p-0 text-xs sm:text-sm"
            disabled={isLocked}
            onClick={deselectAll}
            size="sm"
            variant="link"
          >
            {t("sources.deselect_all")}
          </Button>
          <p className="font-medium text-xs sm:text-sm">
            {t("sources.selected_count", {
              count: selectedSourcesCount,
            })}
          </p>
        </div>
      </div>

      <div className="space-y-3 sm:space-y-4">
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

      <div className="flex justify-end border-t pt-3 sm:pt-4">
        <Button
          className="w-full sm:w-auto"
          disabled={!canContinue || isContinuing || isLocked}
          onClick={onComplete}
          size="default"
        >
          {isContinuing
            ? t("sources.starting")
            : t("sources.continue_analysis")}
        </Button>
      </div>
    </div>
  );
}
