/**
 * Code template registry. Mapping `template.code` (BE field) → React
 * component + meta. Discriminator giữa code template vs block template
 * (canvas_blueprint): nếu code có entry ở đây → code template.
 *
 * Đăng ký template mới:
 *  1. Tạo `src/templates/{code}/index.tsx` + `meta.ts`
 *  2. Import + add vào TEMPLATE_REGISTRY ở dưới
 *  3. Tạo template entity ở BE qua CreateTemplateDialog với code khớp
 *  4. Deploy
 *
 * Lookup runtime: `getCodeTemplate(code)` → null nếu block template.
 */

import dynamic from 'next/dynamic';
import type { ComponentType } from 'react';

import type { TemplateMeta, TemplateProps } from './types';
import { meta as heroClassicMeta } from './hero-classic/meta';
import { meta as mintCointMeta } from './mint-coint/meta';
import { meta as maisonNoirMeta } from './maison-noir/meta';
import { meta as maisonAtelierMeta } from './maison-atelier/meta';
import { meta as maisonClairMeta } from './maison-clair/meta';

interface CodeTemplateEntry {
  meta: TemplateMeta;
  /** React component. Dynamic-imported để tree-shake — chỉ load khi
   *  render (preview / public render route). */
  Component: ComponentType<TemplateProps>;
}

/** Map code → entry. Add new templates ở đây. */
export const TEMPLATE_REGISTRY: Record<string, CodeTemplateEntry> = {
  [heroClassicMeta.code]: {
    meta: heroClassicMeta,
    Component: dynamic(() => import('./hero-classic'), {
      ssr: true,
      loading: () => (
        <div className='flex min-h-screen items-center justify-center bg-zinc-50 text-sm text-zinc-500'>
          Đang load template…
        </div>
      ),
    }),
  },
  [mintCointMeta.code]: {
    meta: mintCointMeta,
    // ssr: true — template uses 'use client' directive nên client hooks
    // (Lenis, GSAP ScrollTrigger, Swiper) fire client-side sau hydration.
    // KHÔNG dùng ssr: false vì registry import từ server components
    // (`/p/[id]/page.tsx`) → Next.js error.
    Component: dynamic(() => import('./mint-coint'), {
      ssr: true,
      loading: () => (
        <div className='flex min-h-screen items-center justify-center bg-white text-sm text-zinc-500'>
          Đang load template…
        </div>
      ),
    }),
  },
  // ── Maison Éclat jewelry landings (GSAP + Lenis, 'use client') ──────────
  [maisonNoirMeta.code]: {
    meta: maisonNoirMeta,
    Component: dynamic(() => import('./maison-noir'), {
      ssr: true,
      loading: () => (
        <div className='flex min-h-screen items-center justify-center bg-[#0a0a0b] text-sm text-[#8f877a]'>
          Đang load template…
        </div>
      ),
    }),
  },
  [maisonAtelierMeta.code]: {
    meta: maisonAtelierMeta,
    Component: dynamic(() => import('./maison-atelier'), {
      ssr: true,
      loading: () => (
        <div className='flex min-h-screen items-center justify-center bg-[#F2ECE3] text-sm text-[#7C7065]'>
          Đang load template…
        </div>
      ),
    }),
  },
  [maisonClairMeta.code]: {
    meta: maisonClairMeta,
    Component: dynamic(() => import('./maison-clair'), {
      ssr: true,
      loading: () => (
        <div className='flex min-h-screen items-center justify-center bg-[#FBFBF9] text-sm text-[#7E827E]'>
          Đang load template…
        </div>
      ),
    }),
  },
};

export function getCodeTemplate(
  code: string | undefined
): CodeTemplateEntry | null {
  if (!code) return null;
  return TEMPLATE_REGISTRY[code] ?? null;
}

export function listCodeTemplates(): CodeTemplateEntry[] {
  return Object.values(TEMPLATE_REGISTRY);
}

export function isCodeTemplate(code: string | undefined): boolean {
  return !!getCodeTemplate(code);
}
