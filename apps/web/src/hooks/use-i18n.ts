import { useIntl } from 'react-intl';

export const useI18n = () => {
  const { formatMessage } = useIntl();

  const t = (id: string, values?: Record<string, string | number>) => {
    return formatMessage({ id }, values);
  };

  return { t };
};
