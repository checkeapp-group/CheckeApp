import Link from 'next/link';
import { useI18n } from '@/hooks/use-i18n';
import { authClient } from '@/lib/auth-client';

// Application header showing user session info and login link
export default function Header() {
  const { data: session } = authClient.useSession();
  const { t } = useI18n();

  return (
    <header>
      {session ? (
        <div>
          <p>
            {t('header.welcome')}, {session.user.email}
          </p>
        </div>
      ) : (
        <Link href="/login">{t('auth.signIn')}</Link>
      )}
    </header>
  );
}
