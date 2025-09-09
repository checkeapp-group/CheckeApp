'use client';

import Image from 'next/image';
import Link from 'next/link';
import QuestionsPreviewPage from '@/app/verify/[id]/preview/page';
import Providers from '@/components/providers';
import UserMenu from '@/components/UserMenu';
import { LanguageSelector } from '@/components/ui/lenguage-selector';
import { useAuth } from '@/hooks/use-auth';
import { useI18n } from '@/hooks/use-i18n';
import FactCheckerLogo from '@/public/FactCheckerLogo.webp';
import TextInputForm from '../TextInputForm';

type LayoutProps = {
  children: React.ReactNode;
  showHeader?: boolean;
};

export default function RootLayout({ showHeader = true }: LayoutProps) {
  const { t } = useI18n();
  const { isAuthenticated } = useAuth();

  return (
    <Providers>
      <div className="flex min-h-screen flex-col bg-background">
        {/* Header */}
        {showHeader && (
          <header className="border-border border-b bg-card shadow-sm">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="flex h-16 items-center justify-between">
                {/* Logo/Brand */}
                <div className="flex items-center">
                  <Image
                    alt="FactChecker Logo"
                    className="h-auto w-32 md:w-40 lg:w-48"
                    height={128}
                    priority
                    src={FactCheckerLogo}
                    width={128}
                  />
                  <span className="sr-only">FactChecker - fact verification platform</span>
                </div>

                {/* Navigation */}
                <div className="flex items-center space-x-6">
                  {/* Main Navigation */}
                  <nav className="hidden space-x-8 md:flex">
                    <Link
                      className="font-medium text-muted-foreground text-sm hover:text-foreground"
                      href="/verify"
                    >
                      {t('nav.verify')}
                    </Link>
                  </nav>

                  {/* Auth Section */}
                  <div className="flex items-center space-x-4">
                    {isAuthenticated ? (
                      <UserMenu />
                    ) : (
                      <div className="flex items-center space-x-3">
                        <Link
                          className="font-medium text-muted-foreground text-sm transition-colors hover:text-foreground"
                          href="/login"
                        >
                          {t('auth.signIn')}
                        </Link>
                        <Link
                          className="rounded-md bg-primary px-4 py-2 font-medium text-primary-foreground text-sm transition-colors hover:bg-success"
                          href="/verify"
                        >
                          {t('auth.getStarted')}
                        </Link>
                      </div>
                    )}

                    {/* Language Selector */}
                    <LanguageSelector />
                  </div>
                </div>
              </div>
            </div>
          </header>
        )}

        {/* Main Content */}
        <main className="flex-1">
          <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
            <TextInputForm isAuthenticated={isAuthenticated} />
          </div>
          <div>
            <QuestionsPreviewPage />
          </div>
        </main>
        {/* Footer */}
        <footer className="border-border border-t bg-card py-6">
          <div className="mx-auto max-w-7xl px-4 text-center">
            <p className="text-muted-foreground text-sm">
              {t('footer.copyright', { year: new Date().getFullYear() })}
            </p>
          </div>
        </footer>
      </div>
    </Providers>
  );
}
