'use client';

import { useState, useEffect } from 'react';
import { usePathname, useParams } from 'next/navigation';

export function useRoutePattern() {
  const pathname = usePathname();
  const params = useParams();
  const [pattern, setPattern] = useState<string>();

  useEffect(() => {
    let pattern = pathname;
    Object?.entries(params)?.forEach(([key, value]) => {
      pattern = pattern?.replace(value as string, `[${key}]`);
    });

    setPattern(pattern);
  }, [params, pathname]);

  return pattern;
}
