import RootLayout from '@/components/RootLayout';
import I18nProvider from '@/providers/I18nProvider';

type RootLayoutProps = {
  children: React.ReactNode;
};

export default function Layout({ children }: RootLayoutProps) {
  return (
    <html lang="es">
      <body>
        <I18nProvider>
          <RootLayout>{children}</RootLayout>
        </I18nProvider>
      </body>
    </html>
  );
}