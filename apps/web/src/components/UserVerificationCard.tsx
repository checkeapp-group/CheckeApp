'use client';

import { AlertTriangle, Calendar, CheckCircle, Clock, Edit, User } from 'lucide-react';
import Link from 'next/link';
import { useI18n } from '@/hooks/use-i18n';
import { cn } from '@/lib/utils';

// Tipo extendido para incluir el status
type VerificationData = {
  id: string;
  createdAt: Date;
  originalText: string;
  status:
    | 'draft'
    | 'processing_questions'
    | 'sources_ready'
    | 'generating_summary'
    | 'completed'
    | 'error';
  userName: string | null;
  claim: string | null;
  label: string | null;
};

type UserVerificationCardProps = {
  verification: VerificationData;
};

// Helper para obtener el estilo y el icono del estado
const getStatusAppearance = (status: VerificationData['status']) => {
  switch (status) {
    case 'completed':
      return {
        icon: CheckCircle,
        color: 'text-green-600',
        bgColor: 'bg-green-100',
      };
    case 'error':
      return {
        icon: AlertTriangle,
        color: 'text-red-600',
        bgColor: 'bg-red-100',
      };
    default:
      return {
        icon: Clock,
        color: 'text-yellow-600',
        bgColor: 'bg-yellow-100',
      };
  }
};

export default function UserVerificationCard({ verification }: UserVerificationCardProps) {
  const { t } = useI18n();

  // Lógica de redirección condicional
  const getHref = () => {
    if (verification.status === 'completed' || verification.status === 'error') {
      return `/verify/${verification.id}/finalResult`;
    }
    // Para cualquier otro estado, redirige a la página de edición
    return `/verify/${verification.id}/edit`;
  };

  const {
    icon: StatusIcon,
    color: statusColor,
    bgColor: statusBgColor,
  } = getStatusAppearance(verification.status);

  return (
    <Link className="block" href={getHref()}>
      <div className="h-full transform rounded-2xl bg-card/70 p-5 shadow-md transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:ring-2 hover:ring-primary/50">
        <div className="flex h-full flex-col justify-between gap-4">
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between text-muted-foreground text-xs">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>{new Date(verification.createdAt).toLocaleDateString()}</span>
              </div>
              <div
                className={cn(
                  'flex items-center gap-1.5 rounded-full px-2 py-0.5 font-semibold text-xs',
                  statusBgColor,
                  statusColor
                )}
              >
                <StatusIcon className="h-3 w-3" />
                <span>{t(`verifications.status.${verification.status}`)}</span>
              </div>
            </div>

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

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-muted-foreground text-sm">
              <User className="h-4 w-4" />
              <span>{verification.userName || t('result.anonymous')}</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
