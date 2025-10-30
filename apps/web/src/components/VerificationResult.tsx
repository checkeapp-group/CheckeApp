"use client";

import { useMutation } from "@tanstack/react-query";
import { FileText, MessageSquareQuote, Search, Share2 } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { appRouter } from "server/src/routers";
import { toast } from "sonner";
import { useI18n } from "@/hooks/use-i18n";
import { orpc } from "@/utils/orpc";
import { Button } from "./ui/button";
import { Card } from "./ui/card";

const SectionHeader = ({
  icon: Icon,
  title,
}: {
  icon: React.ElementType;
  title: string;
}) => (
  <div className="mb-4 flex items-center gap-3">
    <Icon className="h-6 w-6 text-primary" />
    <h2 className="font-bold text-2xl text-foreground">{title}</h2>
  </div>
);

const ContentWithCitations = ({
  text,
  citations,
}: {
  text: string | null;
  citations: Record<string, { url: string; source: string; favicon?: string }>;
}) => {
  if (!text) {
    return null;
  }

  const processedText = text.replace(/\[(\d+)\]/g, (match, num) => {
    const citation = citations[num];
    if (citation?.url) {
      return `[[${num}]](${citation.url} "${citation.source || citation.url}")`;
    }
    return match;
  });

  return (
    <ReactMarkdown
      components={{
        a: ({ node, href, children, title, ...props }) => {
          if (
            Array.isArray(children) &&
            typeof children[0] === "string" &&
            children[0].startsWith("[[")
          ) {
            return (
              <a
                className="reference-link"
                href={href}
                rel="noopener noreferrer"
                target="_blank"
                title={title}
                {...props}
              >
                {children}
              </a>
            );
          }
          return (
            <a
              className="text-primary underline hover:text-primary/80"
              href={href}
              rel="noopener noreferrer"
              target="_blank"
              {...props}
            >
              {children}
            </a>
          );
        },
        p: ({ children }) => <p className="mb-4 last:mb-0">{children}</p>,
        strong: ({ children }) => (
          <strong className="font-bold text-foreground">{children}</strong>
        ),
        em: ({ children }) => <em className="italic">{children}</em>,
        ul: ({ children }) => (
          <ul className="mb-4 ml-6 list-disc space-y-2">{children}</ul>
        ),
        ol: ({ children }) => (
          <ol className="mb-4 ml-6 list-decimal space-y-2">{children}</ol>
        ),
        li: ({ children }) => (
          <li className="text-muted-foreground">{children}</li>
        ),
        code: ({ children }) => (
          <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-sm">
            {children}
          </code>
        ),
        pre: ({ children }) => (
          <pre className="mb-4 overflow-x-auto rounded-lg bg-muted p-4">
            {children}
          </pre>
        ),
        h1: ({ children }) => (
          <h1 className="mb-4 font-bold text-2xl">{children}</h1>
        ),
        h2: ({ children }) => (
          <h2 className="mb-3 font-bold text-xl">{children}</h2>
        ),
        h3: ({ children }) => (
          <h3 className="mb-2 font-bold text-lg">{children}</h3>
        ),
        blockquote: ({ children }) => (
          <blockquote className="mb-4 border-primary/30 border-l-4 pl-4 text-muted-foreground italic">
            {children}
          </blockquote>
        ),
      }}
      remarkPlugins={[remarkGfm]}
    >
      {processedText}
    </ReactMarkdown>
  );
};

const FaviconImage = ({
  src,
  domain,
  alt = "",
}: {
  src?: string;
  domain: string;
  alt?: string;
}) => {
  const [imgError, setImgError] = useState(false);
  const [fallbackError, setFallbackError] = useState(false);

  const handleError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    if (!imgError) {
      // Try DuckDuckGo as fallback
      setImgError(true);
      e.currentTarget.src = `https://icons.duckduckgo.com/ip3/${domain}.ico`;
    } else if (!fallbackError) {
      setFallbackError(true);
      e.currentTarget.src =
        'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"%3E%3Cpath d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"%3E%3C/path%3E%3Cpath d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"%3E%3C/path%3E%3C/svg%3E';
    }
  };

  return (
    <Image
      alt={alt}
      className="h-4 w-4 flex-shrink-0 rounded-sm transition-all duration-300 ease-out group-hover:scale-110 group-hover:brightness-110"
      height={16}
      onError={handleError}
      src={src || `https://www.google.com/s2/favicons?domain=${domain}&sz=16`}
      width={16}
    />
  );
};

export default function VerificationResult({ data }) {
  const { t } = useI18n();
  const createShareLinkMutation = useMutation({
    mutationFn: () => {
      if (!data?.id) {
        throw new Error(t("error.verificationIdMissing"));
      }
      return orpc.createShareLink.call({ verificationId: data.id });
    },
    onSuccess: (result) => {
      const shareUrl = `${window.location.origin}/share/${result.shareToken}`;

      toast.success(t("result.shareLink.created"), {
        description: t("result.shareLink.description"),
        action: {
          label: t("result.shareLink.copyLink"),
          onClick: () => {
            navigator.clipboard.writeText(shareUrl);
            toast.info(t("result.shareLink.copied"));
          },
        },
        duration: 10_000,
      });
    },
    onError: (error) => {
      toast.error(t("error.createShareLink", { error: error.message }));
    },
  });

  if (!data?.finalResult) {
    return (
      <div className="mx-auto max-w-6xl p-4 sm:p-6 lg:p-8">
        <p className="text-center text-muted-foreground">
          {t("result.noData")}
        </p>
      </div>
    );
  }

  const { user, source = [], finalResult } = data;
  const {
    finalText,
    imageUrl,
    labelsJson,
    citationsJson,
    answersJson,
    createdAt,
    metadata,
  } = finalResult;

  // Safe JSON parsing with fallbacks
  const labels: string[] = (() => {
    try {
      return typeof labelsJson === "string"
        ? JSON.parse(labelsJson)
        : labelsJson || [];
    } catch {
      return [];
    }
  })();

  const citations: Record<
    string,
    { url: string; source: string; favicon?: string }
  > = (() => {
    try {
      return typeof citationsJson === "string"
        ? JSON.parse(citationsJson)
        : citationsJson || {};
    } catch {
      return {};
    }
  })();

  const answers: Record<string, string> = (() => {
    try {
      return typeof answersJson === "string"
        ? JSON.parse(answersJson)
        : answersJson || {};
    } catch {
      return {};
    }
  })();

  const { label, main_claim, title } = metadata ?? {};
  const fullImageUrl = imageUrl;
  // Determine label styling
  const getLabelStyles = (labelValue?: string) => {
    const normalizedLabel = labelValue?.toLowerCase();
    if (normalizedLabel === "true") {
      return "border-green-200 bg-green-100 text-green-800";
    }
    if (normalizedLabel === "false" || normalizedLabel === "fake") {
      return "border-red-200 bg-red-100 text-red-800";
    }
    return "border-orange-200 bg-orange-100 text-orange-800";
  };

  return (
    <div className="fadeIn relative w-full">
      <div className="absolute top-[-15vw] left-0 z-[-1] h-[40vw] w-full lg:top-[-20vw] xl:top-[-32vw]">
        <Image
          alt={
            metadata?.image_description ||
            title ||
            t("result.visualSummary.alt")
          }
          className="object-cover opacity-10 blur-lg"
          fill
          priority
          sizes="100vw"
          src={fullImageUrl}
          unoptimized
        />
        <div className="absolute inset-0 bg-gradient-to-b from-white/40 via-white/20 to-transparent" />
      </div>
      <div className="relative mx-auto max-w-7xl overflow-hidden p-4 font-sans text-foreground sm:p-6 lg:p-8">
        <div className="mb-6">
          <h1 className="mb-2 hyphens-auto break-words font-bold text-2xl text-foreground leading-tight sm:text-3xl lg:text-4xl">
            {title || t("result.untitled")}
          </h1>
          {main_claim && (
            <p
              className={`whitespace-pre-wrap rounded-md border px-3 py-2 font-semibold text-lg leading-6 transition-colors duration-200 ${getLabelStyles(
                label
              )}`}
            >
              {main_claim}
            </p>
          )}
        </div>

        {/* Main Grid Layout */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Main Content Column - Takes 2 columns on desktop */}
          <div className="space-y-6 lg:col-span-2">
            {/* Image Section */}
            <div className="relative w-full overflow-hidden rounded-lg shadow-lg">
              {fullImageUrl ? (
                <Image
                  alt={
                    metadata?.image_description ||
                    title ||
                    t("result.visualSummary.alt")
                  }
                  blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mN8+A8AAqsBO/Y/3+MAAAAASUVORK5CYII="
                  className="h-auto w-full rounded-lg object-cover"
                  height={600}
                  placeholder="blur"
                  priority
                  sizes="(max-width: 1024px) 100vw, 66vw"
                  src={fullImageUrl}
                  unoptimized
                  width={800}
                />
              ) : (
                <div className="flex h-64 w-full items-center justify-center rounded-lg bg-muted sm:h-80 lg:h-96">
                  <p className="text-muted-foreground">{t("result.noImage")}</p>
                </div>
              )}
            </div>

            {/* Response Section */}
            <section>
              <SectionHeader
                icon={MessageSquareQuote}
                title={t("result.response.title")}
              />
              <div className="prose prose-lg max-w-none text-muted-foreground leading-relaxed">
                <ContentWithCitations citations={citations} text={finalText} />
              </div>

              {/* Labels/Tags */}
              {labels.length > 0 && (
                <div className="mt-5 flex flex-wrap gap-2">
                  {labels.map((labelText, index) => (
                    <span
                      className="select-none rounded-full bg-neutral-300/60 px-3 py-1 font-medium text-gray-700 text-sm transition-all duration-150 ease-in-out"
                      key={`${labelText}-${index}`}
                    >
                      {labelText}
                    </span>
                  ))}
                </div>
              )}
            </section>
          </div>

          {/* Sidebar Column */}
          <div className="space-y-8">
            {/* User Info Card */}
            <Card className="bg-white p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                    <span className="font-bold text-muted-foreground text-xl">
                      {user?.name?.charAt(0).toUpperCase() || "A"}
                    </span>
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">
                      {user?.name || t("result.anonymous")}
                    </p>
                    <p className="text-muted-foreground text-sm">
                      {new Date(createdAt).toLocaleDateString("es-ES", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                </div>
                <Button
                  aria-label={t("result.share.ariaLabel")}
                  className="cursor-pointer bg-white text-foreground shadow-none hover:bg-neutral-200/60"
                  disabled={createShareLinkMutation.isPending}
                  onClick={() => createShareLinkMutation.mutate()}
                  size="icon"
                  variant="ghost"
                >
                  <Share2 className="h-5 w-5" />
                </Button>
              </div>
            </Card>

            {/* Detailed Answers Section */}
            {Object.keys(answers).length > 0 && (
              <section>
                <SectionHeader
                  icon={Search}
                  title={t("result.detailedAnswers.title")}
                />
                <div className="flex flex-col gap-2">
                  {Object.entries(answers).map(([question, answer], index) => (
                    <details
                      className="details-item group rounded-lg border border-neutral-200/60 bg-white p-4 transition-all duration-300 ease-in-out hover:border-neutral-200 hover:bg-white/40"
                      key={`${question}-${index}`}
                      style={{
                        animationDelay: `${index * 150}ms`,
                      }}
                    >
                      <summary className="flex cursor-pointer list-none items-center justify-between font-bold text-foreground text-sm transition-all duration-200 hover:text-primary">
                        <span className="pr-4">{question}</span>
                        <span className="font-light text-2xl text-primary transition-all duration-300 ease-out group-open:rotate-45 group-open:scale-110 group-hover:scale-105">
                          +
                        </span>
                      </summary>
                      <div className="details-content mt-3 overflow-hidden">
                        <div className="text-muted-foreground text-sm leading-relaxed">
                          <ContentWithCitations
                            citations={citations}
                            text={answer}
                          />
                        </div>
                      </div>
                    </details>
                  ))}
                </div>
              </section>
            )}

            {/* Sources Section */}
            {source.length > 0 && (
              <section>
                <SectionHeader
                  icon={FileText}
                  title={t("result.sources.title")}
                />
                <div className="flex flex-col gap-2">
                  {source.map((sourceItem: any, index: number) => {
                    const sourceDomain =
                      sourceItem.domain || new URL(sourceItem.url).hostname;
                    const sourceTitle = sourceItem.title || sourceDomain;

                    const cleanedDomain = sourceDomain.replace(
                      /https?:\/\/(?:www\.)?/,
                      ""
                    );

                    return (
                      <a
                        className="source-item group relative ms-2 flex items-center rounded-md bg-white px-2 py-2 ps-5 outline outline-neutral-200/60 transition-all duration-300 ease-in-out hover:scale-[1.1] hover:bg-[var(--color-foreground)] hover:shadow-sm active:scale-[0.99]"
                        href={sourceItem.url}
                        key={sourceItem.id}
                        rel="noopener noreferrer"
                        style={{
                          animationDelay: `${index * 100}ms`,
                        }}
                        target="_blank"
                      >
                        <div className="absolute left-[-.6rem] flex shrink-1 items-center justify-center">
                          <div className="inline-flex h-5 w-5 items-center justify-center rounded-lg bg-white font-semibold text-foreground text-sm outline-3 outline-[#f1f1f0] transition-all duration-300 ease-out group-hover:scale-110 group-hover:bg-white group-hover:text-foreground group-hover:shadow-md group-hover:outline-neutral-200/60">
                            {index + 1}
                          </div>
                        </div>

                        <div className="flex w-full items-center gap-3 truncate text-ellipsis">
                          <FaviconImage
                            alt=""
                            domain={sourceDomain}
                            src={sourceItem.favicon}
                          />
                          <div className="flex w-full flex-col truncate">
                            <div className="overflow-hidden text-ellipsis font-semibold text-foreground text-sm transition-all duration-200 group-hover:text-white">
                              {sourceTitle}
                            </div>
                            <small className="text-neutral-500 text-xs group-hover:text-white/70">
                              {cleanedDomain}
                            </small>
                          </div>
                        </div>
                      </a>
                    );
                  })}
                </div>
              </section>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
