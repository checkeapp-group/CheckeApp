import '@/../index.css';
import Providers from '@/components/providers';
import { I18nProvider } from '@/providers/I18nProvider';

type RootLayoutProps = {
  children: React.ReactNode;
};

export default function Layout({ children }: RootLayoutProps) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body>
        <I18nProvider>
          <Providers>{children}</Providers>
        </I18nProvider>
      </body>
    </html>
  );
}