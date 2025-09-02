import { IntlProvider } from 'react-intl';
import { z } from 'zod';
import ca from '@/locales/ca.json' with { type: 'json' };
import es from '@/locales/es.json' with { type: 'json' };
import eu from '@/locales/eu.json' with { type: 'json' };
import gl from '@/locales/gl.json' with { type: 'json' };

const translationSchema = z.record(z.string(), z.string());

const createMessages = () => {
  return {
    es: translationSchema.parse(es),
    eu: translationSchema.parse(eu),
    ca: translationSchema.parse(ca),
    gl: translationSchema.parse(gl),
  };
};

const messages = createMessages();

type Props = {
  locale: 'es' | 'eu' | 'ca' | 'gl';
  children: React.ReactNode;
};

export default function I18nProvider({ locale, children }: Props) {
  return (
    <IntlProvider locale={locale} messages={messages[locale]}>
      {children}
    </IntlProvider>
  );
}
