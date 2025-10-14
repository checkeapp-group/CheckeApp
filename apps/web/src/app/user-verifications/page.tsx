'use client';

import AuthGuard from '@/components/Auth/auth-guard';
import UserVerificationsList from '@/components/UserVerificationsList';
import { useI18n } from '@/hooks/use-i18n';

function UserVerificationsPageContent() {
  const { t } = useI18n();

  return (
    <div className="container mx-auto py-8">
      <h1 className="m-3 mb-6 font-bold text-3xl">{t('user_verifications.title')}</h1>
      <UserVerificationsList />
    </div>
  );
}

export default function UserVerificationsPage() {
  return (
    <AuthGuard>
      <UserVerificationsPageContent />
    </AuthGuard>
  );
}
