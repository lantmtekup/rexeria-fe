import { useLocale as useNextIntlLocale } from 'next-intl';
import { Locale } from '@/settings/enums';

/**
 * A custom hook that wraps next-intl's useLocale and returns the locale cast to Locale type.
 * @returns {Locale} The current locale as a Locale type ('vi' | 'en')
 */
export const useLocale = (): Locale => {
  const locale = useNextIntlLocale();
  return locale as Locale;
};
