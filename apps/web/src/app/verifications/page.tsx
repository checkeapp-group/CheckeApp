'use client';

import AuthGuard from '@/components/Auth/auth-guard';
import VerificationsList from '@/components/VerificationsList';
import { useI18n } from '@/hooks/use-i18n';

function VerificationsPageContent() {
  const { t } = useI18n();

  return (
    <div className="container mx-auto py-8">
      <h1 className="m-3 mb-6 font-bold text-3xl">{t('verifications.title')}</h1>
      <VerificationsList />
    </div>
  );
}

export default function VerificationsPage() {
  return (
    <AuthGuard>
      <VerificationsPageContent />
    </AuthGuard>
  );
}
