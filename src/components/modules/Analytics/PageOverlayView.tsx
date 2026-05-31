'use client';

/**
 * Render trang đầy đủ (block hoặc code template) trong admin analytics
 * context + wrap với `StatsAnnotationOverlay` cho admin/brand xem stats
 * floating trên blocks/sections. Tab này show ở
 * `/admin/landing-pages/[id]/analytics` cạnh Cards view.
 *
 * Render branch:
 *  - Code template (`getCodeTemplate(template.code)` match) → import
 *    component từ registry, render `mode='preview'`. Sections đã có
 *    `data-rexer-section` attrs → overlay scanner pickup.
 *  - Block template → loop HEAD version's blocks, render từng block
 *    qua `RenderBlock` với `<div data-block-id={id} data-block-type=
 *    {type}>` wrapper → overlay scanner pickup giống legacy
 *    `/p/[id]/[token]` route.
 *
 * Khác legacy route: render trong admin shell (không full-screen, có
 * gutter cho cards). Width constraint giữ ở 1280 max như public.
 */

import * as React from 'react';
import { AlertCircle, Loader2 } from 'lucide-react';

import { RenderBlock } from '@/components/modules/CanvasTemplate/block-editor/blocks/renderBlock';
import {
  MotionBlockRoot,
  MotionProvider,
} from '@/components/modules/CanvasTemplate/block-editor/motion/runtime';
import type { BlockMotion } from '@/components/modules/CanvasTemplate/block-editor/motion/types';
import { parseCanvas } from '@/components/modules/CanvasTemplate/block-editor/serialize';
import { RxApiError } from '@/services/rexer/client';
import { rexerApi } from '@/services/rexer/endpoints';
import type { Page, Template, TemplateVersion } from '@/services/rexer/types';
import { getCodeTemplate } from '@/templates/registry';

import { StatsAnnotationOverlay } from './StatsAnnotationOverlay';

interface Props {
  /** Page ID (UUID) — resolve template + version để render. */
  pageId: string;
}

/**
 * BE canvas_blueprint stores `schema_version: "1.0"`; parseCanvas chỉ
 * accept "2.0". Coerce wrapper.
 */
function adaptCanvasBlueprint(
  raw: Record<string, unknown> | undefined
): Record<string, unknown> | undefined {
  if (!raw || typeof raw !== 'object') return undefined;
  const blocks = Array.isArray((raw as { blocks?: unknown }).blocks)
    ? ((raw as { blocks: unknown[] }).blocks as unknown[])
    : [];
  return { schema_version: '2.0', blocks };
}

export function PageOverlayView({ pageId }: Props) {
  const [page, setPage] = React.useState<Page | null>(null);
  const [template, setTemplate] = React.useState<Template | null>(null);
  const [version, setVersion] = React.useState<TemplateVersion | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    (async () => {
      try {
        const p = await rexerApi.pages.get(pageId);
        if (cancelled) return;
        setPage(p);
        // Find template owning page.template_version_id. Fan-out per §13
        // (template.current_version_id thường stale).
        const tplList = await rexerApi.templates.list({ limit: 500 });
        const items = tplList.items ?? [];
        let foundTpl: Template | null = null;
        for (const t of items) {
          if (t.current_version_id === p.template_version_id) {
            foundTpl = t;
            break;
          }
        }
        if (!foundTpl) {
          // Slow path — iterate versions.
          const matches = await Promise.all(
            items.map(async t => {
              try {
                const vl = await rexerApi.templates.versions(t.id);
                return (vl.items ?? []).some(
                  v => v.id === p.template_version_id
                )
                  ? t
                  : null;
              } catch {
                return null;
              }
            })
          );
          foundTpl = matches.find(Boolean) ?? null;
        }
        if (cancelled) return;
        if (!foundTpl) throw new Error('Không tìm thấy template');
        setTemplate(foundTpl);

        // For BLOCK templates: load HEAD version's canvas_blueprint.
        // Code template không cần version (render từ registry).
        if (!getCodeTemplate(foundTpl.code)) {
          const versList = await rexerApi.templates.versions(foundTpl.id);
          const head = (versList.items ?? []).reduce<TemplateVersion | null>(
            (max, v) =>
              !max || (v.version_no ?? 0) > (max.version_no ?? 0) ? v : max,
            null
          );
          const targetVerId = head?.id ?? p.template_version_id;
          const v = await rexerApi.templates.version(foundTpl.id, targetVerId);
          if (!cancelled) setVersion(v);
        }
      } catch (err) {
        if (!cancelled)
          setError(
            err instanceof RxApiError ? err.code || err.message : 'LOAD_FAILED'
          );
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [pageId]);

  if (loading) {
    return (
      <div className='flex h-64 items-center justify-center text-sm text-zinc-500'>
        <Loader2 className='mr-2 size-4 animate-spin' /> Đang load…
      </div>
    );
  }
  if (error || !page || !template) {
    return (
      <div className='mx-auto max-w-md p-6'>
        <div className='rounded-2xl border border-rose-200 bg-rose-50 p-6 text-center'>
          <AlertCircle className='mx-auto size-8 text-rose-600' />
          <p className='mt-3 text-[14px] font-semibold text-rose-900'>
            Không load được trang
          </p>
          <p className='mt-1 font-mono text-[11px] text-rose-700'>
            {error ?? 'Missing page/template'}
          </p>
        </div>
      </div>
    );
  }

  // Wrap toàn bộ render bằng overlay — admin/brand toggle ON ở
  // top-right để thấy stats cards. Public users (chưa login) sẽ không
  // thấy overlay (component tự gate isLoggedIn).
  // pageId truyền vào overlay (key cho fetch + offset localStorage).
  return (
    <StatsAnnotationOverlay templateId={pageId}>
      <div className='relative min-h-[60vh] bg-zinc-50'>
        <PageContent page={page} template={template} version={version} />
      </div>
    </StatsAnnotationOverlay>
  );
}

function PageContent({
  page,
  template,
  version,
}: {
  page: Page;
  template: Template;
  version: TemplateVersion | null;
}) {
  // Hooks first — rules of hooks.
  const codeTpl = getCodeTemplate(template.code);
  const sections = React.useMemo(
    () => codeTpl?.meta.tracking?.sections ?? [],
    [codeTpl]
  );

  // Inject data-rexer-label cho overlay label lookup. Run sau mỗi
  // render để bắt section mới render. No-op khi không có code template.
  React.useEffect(() => {
    if (!codeTpl) return;
    // Schedule sau template paint — section DOM nodes có thể mount
    // async (dynamic import). Retry vài lần để bắt đủ.
    let tries = 0;
    const tick = () => {
      const els = document.querySelectorAll<HTMLElement>(
        '[data-rexer-section]'
      );
      els.forEach(el => {
        const id = el.dataset.rexerSection;
        const meta = sections.find(s => s.id === id);
        if (meta && !el.dataset.rexerLabel) {
          el.dataset.rexerLabel = meta.label;
        }
      });
      if (els.length === 0 && tries < 10) {
        tries += 1;
        setTimeout(tick, 200);
      }
    };
    tick();
  }, [codeTpl, sections]);

  if (codeTpl) {
    const Comp = codeTpl.Component;
    const content = (page.type_metadata ?? {}) as Record<string, unknown>;
    return <Comp page={page} content={content} mode='preview' />;
  }

  // Block template — render HEAD canvas blocks FE-side.
  if (!version) {
    return (
      <div className='flex h-64 items-center justify-center text-sm text-zinc-500'>
        Block template thiếu version data.
      </div>
    );
  }
  const parsed = parseCanvas(adaptCanvasBlueprint(version.canvas_blueprint));
  const visible = parsed?.blocks.filter(b => b.isVisible) ?? [];

  if (visible.length === 0) {
    return (
      <div className='flex h-64 items-center justify-center text-sm text-zinc-500'>
        Trang chưa có block hiển thị.
      </div>
    );
  }

  return (
    <main className='@container mx-auto flex w-full max-w-[1280px] flex-col gap-3 px-4 py-6 md:gap-4 md:py-10'>
      {visible.map(block => {
        const content = block.contentVi.desktop;
        const styles = block.elementStyles?.desktop;
        const background = block.background?.desktop;
        const order = block.elementOrder?.desktop;
        const motion = block.motion?.desktop as BlockMotion | undefined;
        return (
          <MotionProvider key={block.id} mode='production' motion={motion}>
            <div data-block-id={block.id} data-block-type={block.blockType}>
              <MotionBlockRoot className='overflow-hidden rounded-md bg-white shadow-sm ring-1 ring-black/5'>
                <RenderBlock
                  block={block}
                  content={content}
                  styles={styles}
                  background={background}
                  order={order}
                />
              </MotionBlockRoot>
            </div>
          </MotionProvider>
        );
      })}
    </main>
  );
}
