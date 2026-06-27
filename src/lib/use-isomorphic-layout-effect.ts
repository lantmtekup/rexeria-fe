import { useEffect, useLayoutEffect } from 'react';

/**
 * `useLayoutEffect` trên client, `useEffect` khi SSR.
 *
 * Dùng cho effect cần đo/ghi DOM TRƯỚC paint (vd fit font-size) mà không bắn
 * warning "useLayoutEffect does nothing on the server" — Next App Router SSR
 * mọi `'use client'` component nên `React.useLayoutEffect` trực tiếp sẽ warn.
 */
export const useIsomorphicLayoutEffect =
  typeof window !== 'undefined' ? useLayoutEffect : useEffect;
