'use client';

import { Calendar, User } from 'lucide-react';
import Link from 'next/link';
import { useI18n } from '@/hooks/use-i18n';
import { cn } from '@/lib/utils';

type VerificationData = {
  id: string;
  createdAt: Date;
  originalText: string;
  userName: string | null;
  claim: string | null;
  label: string | null;
};

type VerificationCardProps = {
  verification: VerificationData;
};

const getLabelStyles = (label: string | null) => {
  switch (label?.toLowerCase()) {
    case 'true':
    case 'verificado':
      return 'bg-green-100 text-green-800';
    case 'fake':
    case 'false':
    case 'bulo':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-orange-100 text-orange-800';
  }
};

export default function VerificationCard({ verification }: VerificationCardProps) {
  const { t } = useI18n();

  const getLabelText = (label: string | null) => {
    switch (label?.toLowerCase()) {
      case 'true':
      case 'verificado':
        return t('verifications.label.verified');
      case 'fake':
      case 'false':
      case 'bulo':
        return t('verifications.label.fake');
      default:
        return t('verifications.label.undetermined');
    }
  };

  return (
    <Link className="block" href={`/verify/${verification.id}/finalResult`}>
      <div className="h-full transform rounded-2xl bg-card/70 p-5 shadow-md transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:ring-2 hover:ring-primary/50">
        <div className="flex h-full flex-col justify-between gap-4">
          {/* Encabezado de la tarjeta */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between text-muted-foreground text-xs">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>{new Date(verification.createdAt).toLocaleDateString()}</span>
              </div>
              {verification.label && (
                <span
                  className={cn(
                    'rounded-md px-2 py-0.5 font-semibold text-xs uppercase',
                    getLabelStyles(verification.label)
                  )}
                >
                  {getLabelText(verification.label)}
                </span>
              )}
            </div>

            {/* Contenido principal */}
            <div className="space-y-2">
              <h2 className="line-clamp-2 font-bold text-foreground text-lg leading-tight">
                {verification.originalText}
              </h2>
              <div className="h-0.5 w-16 bg-muted-foreground/30" />
              <p className="line-clamp-3 text-muted-foreground text-sm">
                {verification.claim || t('verifications.no_claim')}
              </p>
            </div>
          </div>

          {/* Pie de la tarjeta */}
          <div className="flex items-center gap-2 text-muted-foreground text-sm">
            <User className="h-4 w-4" />
            <span>{verification.userName || t('result.anonymous')}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
