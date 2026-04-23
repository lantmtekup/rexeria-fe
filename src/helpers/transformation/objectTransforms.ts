import { Locale } from '@/settings/enums';
import type {
  ClientApiResponse,
  LocalizedText,
  ResolveLocalizedText,
} from '@/types/common';

export function getValueSettled<T>(result: PromiseSettledResult<T>): T | null {
  return result.status === 'fulfilled' ? result.value : null;
}

export function successResponse<T>(
  data: T,
  message = 'Success'
): ClientApiResponse<T> {
  return { success: true, data, message, errors: [] };
}

export function errorResponse<T = unknown>(
  message = 'Failed',
  errors: string[] = []
): ClientApiResponse<T> {
  return { success: false, data: null, message, errors };
}

export const resolveLocalizedPath = (
  href: LocalizedText | string,
  locale: Locale
): string => {
  if (typeof href === 'string') return href;
  return href[locale] ?? href['vi'] ?? href['en'] ?? '/';
};

export function convertLang<T, L = ResolveLocalizedText<T>>(
  data: T,
  lang: keyof LocalizedText
): L {
  // Case 1: If data is an array → map each item recursively
  if (Array.isArray(data)) {
    return data.map(item => convertLang<unknown, unknown>(item, lang)) as L;
  }

  // Case 2: If data is an object → iterate through its keys
  if (data && typeof data === 'object') {
    const result: Record<string, unknown> = {};

    for (const key of Object.keys(data as object)) {
      const value = (data as Record<string, unknown>)[key];

      // Detect if value is a multilingual object (contains language keys)
      if (value && typeof value === 'object' && !Array.isArray(value)) {
        const langKeys = Object.keys(value);
        if (langKeys.includes(lang)) {
          // Extract the language-specific value
          result[key] = (value as Record<string, unknown>)[lang];
          continue;
        } else if (langKeys.length === 0) {
          result[key] = '';
          continue;
        }
      }

      // Recursively convert nested objects/arrays or keep primitives
      result[key] = convertLang<unknown, unknown>(value, lang);
    }

    return result as L;
  }

  // Case 3: If data is primitive → return as is
  return data as unknown as L;
}
