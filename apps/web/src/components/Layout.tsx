import { useState } from 'react';
import { FormattedMessage } from 'react-intl';
import I18nProvider from '@/components/ui/I18nProvider';

const AVAILABLE_LOCALES = ['es', 'eu', 'ca', 'gl'] as const;
type Locale = (typeof AVAILABLE_LOCALES)[number];

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const [locale, setLocale] = useState<Locale>('es');

  return (
    <html lang={locale}>
      <body>
        <I18nProvider locale={locale}>
          <header style={{ padding: '1rem', borderBottom: '1px solid #ccc' }}>
            <h1>
              <FormattedMessage defaultMessage="Hello!" id="hello" />
            </h1>
            <select onChange={(e) => setLocale(e.target.value as Locale)} value={locale}>
              {AVAILABLE_LOCALES.map((l) => (
                <option key={l} value={l}>
                  {l.toUpperCase()}
                </option>
              ))}
            </select>
          </header>

          <main>{children}</main>
        </I18nProvider>
      </body>
    </html>
  );
}
