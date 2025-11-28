import "@/../index.css";
import type { Metadata } from "next";
import Script from "next/script";
import Providers from "@/components/providers";
import { I18nProvider } from "@/providers/I18nProvider";

type RootLayoutProps = {
  children: React.ReactNode;
};

export const metadata: Metadata = {
  title: {
    template: "%s | CheckeApp",
    default: "CheckeApp - Verifica tu información",
  },
  description:
    "Verifica hechos usando fuentes en tiempo real con IA multilingüe. CheckeApp es una plataforma de verificación de información transparente y ética.",
  keywords: [
    "verificación",
    "fact-checking",
    "IA",
    "inteligencia artificial",
    "fuentes",
    "noticias",
    "desinformación",
  ],
  authors: [{ name: "CheckeApp Team" }],
  creator: "CheckeApp",
  publisher: "CheckeApp",
  openGraph: {
    type: "website",
    locale: "es_ES",
    alternateLocale: ["eu_ES", "ca_ES", "gl_ES"],
    url: "https://checkeapp.com",
    siteName: "CheckeApp",
    title: "CheckeApp - Verifica tu información",
    description:
      "Verifica hechos usando fuentes en tiempo real con IA multilingüe",
    images: [
      {
        url: "/og-image-default.png",
        width: 1200,
        height: 630,
        alt: "CheckeApp - Verificación de información",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "CheckeApp - Verifica tu información",
    description:
      "Verifica hechos usando fuentes en tiempo real con IA multilingüe",
    images: ["/og-image-default.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: "G-1MKPE3Q8TV",
  },
};

export default function Layout({ children }: RootLayoutProps) {
  // Note: The lang attribute is static here but will be updated by the client-side I18nProvider
  return (
    <html lang="es" suppressHydrationWarning>
      <body>
        <Script
          src={"https://www.googletagmanager.com/gtag/js?id=G-1MKPE3Q8TV"}
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
