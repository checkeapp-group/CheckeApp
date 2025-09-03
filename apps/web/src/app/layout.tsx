import RootLayout from '@/components/RootLayout';
import '@/../index.css';
import { I18nProvider } from '@/providers/I18nProvider';


type RootLayoutProps = {
  children: React.ReactNode;
};

export default function Layout({ children }: RootLayoutProps) {
  return (
    <html lang="es">
      <body style={{ backgroundColor: '#f9fafb' }}>
        <I18nProvider>
          <RootLayout>{children}</RootLayout>
        </I18nProvider>
      </body>
    </html>
  );
}