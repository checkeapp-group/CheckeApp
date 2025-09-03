'use client';

import { useCallback } from 'react';
import { useIntl } from 'react-intl';
import { useI18nContext } from '@/providers/I18nProvider';

export const useI18n = () => {
  const { locale, setLocale } = useI18nContext();
  const { formatMessage } = useIntl();

  const t = useCallback(
    (id: string, values?: Record<string, string | number>) => formatMessage({ id }, values),
    [formatMessage]
  );

  return { t, locale, setLocale };
};
