'use client';

import { useRouter as useNextRouter } from 'next/navigation';
import { useLocale } from './useLocale';
import { resolveLocalizedPath } from '@/helpers/transformation';
import { LocalizedText } from '@/types/common';

export function useRouter() {
  const router = useNextRouter();
  const locale = useLocale();

  return {
    ...router,
    push: (
      href: LocalizedText | string,
      options?: Parameters<typeof router.push>[1]
    ) => router.push(resolveLocalizedPath(href, locale), options),
    replace: (
      href: LocalizedText | string,
      options?: Parameters<typeof router.replace>[1]
    ) => router.replace(resolveLocalizedPath(href, locale), options),
    prefetch: (href: LocalizedText | string) =>
      router.prefetch(resolveLocalizedPath(href, locale)),
  };
}
