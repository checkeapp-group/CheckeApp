'use client';

import { createContext, type ReactNode, useContext, useEffect, useState } from 'react';
import { IntlProvider } from 'react-intl';
import ca from '@/locales/ca.json' with { type: 'json' };
import es from '@/locales/es.json' with { type: 'json' };
import eu from '@/locales/eu.json' with { type: 'json' };
import gl from '@/locales/gl.json' with { type: 'json' };

export const AVAILABLE_LOCALES = ['es', 'eu', 'ca', 'gl'] as const;
export type Locale = (typeof AVAILABLE_LOCALES)[number];

const messagesMap = { es, eu, ca, gl };

const I18nContext = createContext<{
  locale: Locale;
  setLocale: (lng: Locale) => void;
}>({
  locale: 'es',
  setLocale: () => {},
});

export const useI18nContext = () => useContext(I18nContext);

export const I18nProvider = ({ children }: { children: ReactNode }) => {
  const [locale, setLocale] = useState<Locale>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('locale') as Locale;
      if (saved && AVAILABLE_LOCALES.includes(saved)) {
        return saved;
      }
    }
  });

  useEffect(() => {
    localStorage.setItem('locale', locale);
  }, [locale]);

  return (
    <I18nContext.Provider value={{ locale, setLocale }}>
      <IntlProvider locale={locale} messages={messagesMap[locale]}>
        {children}
      </IntlProvider>
    </I18nContext.Provider>
  );
};
