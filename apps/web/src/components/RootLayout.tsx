'use client';
import { useI18n } from '@/hooks/use-i18n';
import { LanguageSelector } from '@/components/ui/lenguage-selector';
import TextInputForm from './TextInputForm';
import { useAuth } from '@/hooks/use-auth';

type LayoutProps = {
  children: React.ReactNode;
  showHeader?: boolean;
};

export default function BaseLayout({ showHeader = true }: LayoutProps) {
  const { t } = useI18n();
  const { isAuthenticated, isLoading } = useAuth();

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      {/* Header */}
      {showHeader && (
        <header className="border-gray-200 border-b bg-white shadow-sm">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex h-16 items-center justify-between">
              {/* Logo/Brand */}
              <div className="flex items-center space-x-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600" />
                <div>
                  <h1 className="font-bold text-gray-900 text-xl">{t('app.title')}</h1>
                  <p className="-mt-1 text-gray-500 text-xs">{t('app.tagline')}</p>
                </div>
              </div>

              {/* Navigation */}
              <nav className="hidden space-x-8 md:flex">
                <button
                  className="font-medium text-gray-600 text-sm transition-colors hover:text-gray-900"
                  type="button"
                >
                  {t('nav.verify')}
                </button>
                <button
                  className="font-medium text-gray-600 text-sm transition-colors hover:text-gray-900"
                  type="button"
                >
                  {t('nav.about')}
                </button>
                <button
                  className="font-medium text-gray-600 text-sm transition-colors hover:text-gray-900"
                  type="button"
                >
                  {t('nav.help')}
                </button>
              </nav>
              {/* Select with the corresponding language options */}
              <div className="p-6">
                <LanguageSelector />
              </div>
            </div>
          </div>
        </header>
      )}

      {/* Main Content */}
      <main className="flex-1">
        {isLoading ? (
          <div className="flex min-h-[300px] items-center justify-center">
            <p className="text-gray-500 text-sm">
              {t('auth.checking')}
            </p>
          </div>
        // biome-ignore lint/style/noNestedTernary: <explanation>
        ) : isAuthenticated ? (
          <TextInputForm />
        ) : (
          <div className="flex min-h-[300px] items-center justify-center">
            <p className="text-gray-600 text-sm">
              {t('auth.loginRequired')}
            </p>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-gray-200 border-t bg-white py-6">
        <div className="mx-auto max-w-7xl px-4 text-center">
          <p className="text-gray-500 text-sm">
            {t('footer.copyright', { year: new Date().getFullYear() })}
          </p>
        </div>
      </footer>
    </div>
  );
}
