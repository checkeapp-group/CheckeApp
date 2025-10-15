'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import AuthModal from '@/components/Auth/auth-modal';
import GlobalLoader from '@/components/GlobalLoader';
import UserMenu from '@/components/UserMenu';
import { LanguageSelector } from '@/components/ui/lenguage-selector';
import { useAuth } from '@/hooks/use-auth';
import { useI18n } from '@/hooks/use-i18n';
import { useLoading } from '@/providers/LoadingProvider';
import FactCheckerLogo from '@/public/FactCheckerLogo.webp';
import { Button } from '../ui/button';

type LayoutProps = {
  children: React.ReactNode;
};

export default function RootLayout({ children }: LayoutProps) {
  const { t } = useI18n();
  const { isAuthenticated } = useAuth();
  const { isLoading } = useLoading();

  const [showAuthModal, setShowAuthModal] = useState(false);
  const openAuthModal = () => setShowAuthModal(true);
  const closeAuthModal = () => setShowAuthModal(false);

  const pathname = usePathname();
  const searchParams = useSearchParams();
  useEffect(() => {
    if (searchParams.get('login') === 'true') {
      openAuthModal();
    }
  }, [pathname, searchParams]);

  const childrenWithProps = React.Children.map(children, (child) => {
    if (React.isValidElement(child)) {
      return React.cloneElement(child, { openAuthModal } as { openAuthModal: () => void });
    }
    return child;
  });

  return (
    <>
      {isLoading && <GlobalLoader />}
      <AuthModal isOpen={showAuthModal} onClose={closeAuthModal} />

      <div className="flex min-h-screen flex-col">
        <header className="sticky top-0 z-50 w-full border-border border-b bg-card/95 backdrop-blur-sm">
          <div className="container mx-auto flex h-16 items-center justify-between">
            <Link className="flex items-center gap-2" href="/">
              <Image
                alt="FactChecker Logo"
                className="h-8 w-auto"
                height={32}
                priority
                src={FactCheckerLogo}
                width={104}
              />
            </Link>

            <div className="flex items-center gap-4">
              <nav className="hidden items-center gap-6 md:flex">
                <Link href="/">{t('nav.verify')}</Link>
                {isAuthenticated && (
                  <>
                    <Link href="/verifications">{t('verifications.title')}</Link>
                    <Link href="/user-verifications">{t('user_verifications.title')}</Link>
                  </>
                )}
              </nav>

              <div className="flex items-center gap-2">
                {isAuthenticated ? (
                  <UserMenu />
                ) : (
                  <div className="hidden items-center gap-2 sm:flex">
                    <Button onClick={openAuthModal} variant="ghost">
                      {t('auth.signIn')}
                    </Button>
                    <Button onClick={openAuthModal}>{t('auth.getStarted')}</Button>
                  </div>
                )}
                <LanguageSelector />
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1">{childrenWithProps}</main>

        <footer className="border-border border-t bg-card">
          <div className="container mx-auto flex flex-col items-center justify-between gap-4 py-8 sm:flex-row">
            <div className="flex flex-col items-center gap-2 sm:items-start">
              <Link className="flex items-center gap-2" href="/">
                <Image
                  alt="FactChecker Logo"
                  className="h-6 w-auto"
                  height={24}
                  src={FactCheckerLogo}
                  width={78}
                />
              </Link>
              <p className="text-muted-foreground text-sm">{t('app.tagline')}</p>
            </div>
            <div className="flex items-center gap-4 text-muted-foreground text-sm">
              <Link className="transition-colors hover:text-foreground" href="/about">
                {t('nav.about')}
              </Link>
              <Link className="transition-colors hover:text-foreground" href="/help">
                {t('nav.help')}
              </Link>
            </div>
          </div>
          <div className="container mx-auto border-border border-t py-4 text-center text-muted-foreground text-xs">
            <p>{t('footer.copyright', { year: new Date().getFullYear() })}</p>
          </div>
        </footer>
      </div>
    </>
  );
}
