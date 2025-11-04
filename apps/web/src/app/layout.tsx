import '@/../index.css';
import Providers from '@/components/providers';
import { I18nProvider } from '@/providers/I18nProvider';
import Script from "next/script";

type RootLayoutProps = {
  children: React.ReactNode;
};

export default function Layout({ children }: RootLayoutProps) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body>
      <Script
          src={`https://www.googletagmanager.com/gtag/js?id=G-1MKPE3Q8TV`}
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-1MKPE3Q8TV');
          `}
        </Script>

        <I18nProvider>
          <Providers>{children}</Providers>
        </I18nProvider>
      </body>
    </html>
  );
}