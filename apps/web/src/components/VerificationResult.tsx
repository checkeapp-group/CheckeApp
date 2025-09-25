'use client';

import type { RouterClient } from '@orpc/server';
import { FileText, MessageSquareQuote, Search } from 'lucide-react';
import type { appRouter } from 'server/src/routers';
import { Card } from './ui/Card';

type VerificationResultData = RouterClient<
  typeof appRouter
>['getVerificationResultData']['_def']['_output'];

type VerificationResultProps = {
  data: VerificationResultData;
};

const SectionHeader = ({ icon: Icon, title }: { icon: React.ElementType; title: string }) => (
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
  const textRegex = /\[\d+\]/g;

  return text.split(/(\[\d+\])/g).map((part, index) => {
    if (textRegex.test(part)) {
      const key = part.replace(/[[\]]/g, '');
      const citation = citations[key];
      if (citation && citation.url) {
        return (
          <a
            className="reference-link"
            href={citation.url}
            key={index}
            rel="noopener noreferrer"
            target="_blank"
            title={citation.source || citation.url}
          >
            {part}
          </a>
        );
      }
    }
    return part;
  });
};

export default function VerificationResult({ data }: VerificationResultProps) {
  if (!data?.finalResult) {
    return <p>No result data available.</p>;
  }

  const { originalText, user, source = [], finalResult } = data;
  const { finalText, labelsJson, citationsJson, answersJson, createdAt, metadata } = finalResult;
  const labels: string[] =
    typeof labelsJson === 'string' ? JSON.parse(labelsJson) : labelsJson || [];
  const citations: Record<string, { url: string; source: string; favicon?: string }> =
    typeof citationsJson === 'string' ? JSON.parse(citationsJson) : citationsJson || {};
  const answers: Record<string, string> =
    typeof answersJson === 'string' ? JSON.parse(answersJson) : answersJson || {};
  const { label, main_claim } = metadata ?? {};
  console.log(source);

  return (
    <div className="mx-auto max-w-6xl bg-background p-4 font-sans text-foreground sm:p-6 lg:p-8">
      <div className="mb-6">
        <h1 className="mb-2 hyphens-auto break-words font-bold text-2xl text-foreground leading-tight sm:text-3xl lg:text-4xl">
          {originalText}
        </h1>
        <p
          className={`whitespace-pre-wrap rounded-md px-3 py-2 font-semibold text-lg leading-6 transition-colors duration-200 ${
            label === 'True' || label === 'true'
              ? 'border border-green-200 bg-green-100 text-green-800'
              : label === 'False' || label === 'false' || label === 'Fake'
                ? 'border border-red-200 bg-red-100 text-red-800'
                : 'border border-orange-200 bg-orange-100 text-orange-800'
          }
    `}
        >
          {main_claim}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Main Content Column */}
        <div className="space-y-8 lg:col-span-2">
          <img
            alt="Verification visual summary"
            className="h-auto w-full rounded-lg object-cover shadow-lg"
            src="https://placehold.co/800x400"
          />

          <section>
            <SectionHeader icon={MessageSquareQuote} title="Respuesta" />
            <div className="prose prose-lg max-w-none whitespace-pre-wrap text-muted-foreground leading-relaxed">
              <ContentWithCitations citations={citations} text={finalText} />
            </div>
            {labels.length > 0 && (
              <div className="mt-5 mb-5 flex flex-wrap gap-2">
                {labels.map((label, index) => (
                  <a
                    className="cursor-pointer rounded-full border border-principal bg-gray-100 px-3 py-1 font-medium text-gray-700 text-sm shadow-sm transition-all duration-150 ease-in-out hover:bg-gray-200 hover:text-gray-900 active:scale-95"
                    href={`/explore/${label
                      .toLowerCase()
                      .normalize('NFD')
                      .replace(/[\u0300-\u036f]/g, '')
                      .replace(/\s+/g, '-')}`}
                    key={index}
                  >
                    {label}
                  </a>
                ))}
              </div>
            )}
          </section>
        </div>

        {/* Sidebar Column */}
        <div className="space-y-8">
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                <span className="font-bold text-muted-foreground text-xl">
                  {user?.name?.charAt(0).toUpperCase() || 'A'}
                </span>
              </div>
              <div>
                <p className="font-semibold text-foreground">{user?.name || 'Anonymous'}</p>
                <p className="text-muted-foreground text-sm">
                  {new Date(createdAt).toLocaleDateString('es-ES', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
              </div>
            </div>
          </Card>

          {/* Sección de Fuentes */}
          <section>
            <SectionHeader icon={FileText} title="Fuentes" />
            <div className="flex flex-col gap-2">
              {source.map((source, index) => (
                <a
                  className="source-item group relative rounded-md py-3 pl-8 transition-all duration-300 ease-in-out hover:scale-[1.01] hover:bg-muted/40 hover:shadow-sm active:scale-[0.99]"
                  href={source.url}
                  key={source.id}
                  rel="noopener noreferrer"
                  style={{ animationDelay: `${index * 100}ms` }}
                  target="_blank"
                >
                  <div className="absolute top-2.5 left-0 flex items-center justify-center">
                    <div className="inline-flex h-5 w-5 items-center justify-center rounded-lg bg-muted font-bold text-foreground text-xs shadow-sm transition-all duration-300 ease-out group-hover:scale-110 group-hover:bg-primary group-hover:text-primary-foreground group-hover:shadow-md">
                      {index + 1}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <img
                      alt=""
                      className="h-4 w-4 flex-shrink-0 rounded-sm transition-all duration-300 ease-out group-hover:scale-110 group-hover:brightness-110"
                      onError={(e) => {
                        e.currentTarget.src = `https://icons.duckduckgo.com/ip3/${source.domain || new URL(source.url).hostname}.ico`;
                      }}
                      src={`https://www.google.com/s2/favicons?domain=${source.domain || new URL(source.url).hostname}&sz=16`}
                    />
                    <div className="truncate font-bold text-foreground text-sm transition-all duration-200 group-hover:text-primary">
                      {source.domain || new URL(source.url).hostname}
                    </div>
                  </div>
                </a>
              ))}
            </div>
          </section>

          <section>
            <SectionHeader icon={Search} title="Respuestas Detalladas" />
            <div className="space-y-3">
              {Object.entries(answers).map(([question, answer], index) => (
                <details
                  className="details-item group rounded-lg border border-transparent bg-muted/30 p-4 transition-all duration-300 ease-in-out hover:border-muted hover:bg-muted/50 hover:shadow-sm"
                  key={index}
                  style={{ animationDelay: `${index * 150}ms` }}
                >
                  <summary className="flex cursor-pointer list-none items-center justify-between font-bold text-foreground text-sm transition-all duration-200 hover:text-primary">
                    <span className="pr-4">{question}</span>
                    <span className="font-light text-2xl text-primary transition-all duration-300 ease-out group-open:rotate-45 group-open:scale-110 group-hover:scale-105">
                      +
                    </span>
                  </summary>
                  <div className="details-content mt-3 overflow-hidden">
                    <div className="whitespace-pre-wrap text-muted-foreground text-sm leading-relaxed">
                      <ContentWithCitations citations={citations} text={answer} />
                    </div>
                  </div>
                </details>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
