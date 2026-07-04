'use client';

/**
 * Danh sách ad-creative (Page.type === 'ad', type_metadata.format ===
 * 'interactive_widget') của workspace đang active. Khác `/portal/ads`
 * (campaign metadata + metrics nhập tay) — đây là trình dựng widget quảng
 * cáo tương tác thật (carousel + hotspot + CTA).
 *
 * REVIEW-ONLY (giống `/portal/landing-pages` Phase 1 managed) — brand chỉ
 * Preview/Sửa/Nhúng/Báo cáo, KHÔNG có nút Tạo ở đây. Lý do: `POST /templates`
 * (bước đầu để tạo 1 ad-creative mới) chỉ role admin/staff gọi được — brand
 * gọi bị 403. Tạo mới nằm ở `/admin/ad-creatives` (staff chọn brand +
 * workspace, xem AdminAdCreativesPage). Xem thêm
 * docs/be-spec-interactive-ad-creative-2026-07-02.md §0.1 — hiện tại việc
 * tạo mới CÒN CHẶN BỞI 1 giới hạn BE khác nữa (template không set được
 * target_page_type='ad'), không liên quan gì đến portal/admin.
 *
 * Edit cần `template_id` (Page chỉ lưu `template_version_id`) — BE chưa có
 * "get template theo version id" nên phải fan-out 1 lần trên toàn bộ
 * templates.list() để dựng map version→template, giống cách
 * `landing-pages/[id]/preview` đã làm cho preview.
 */

import { Loader2, Pencil, Radio } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';

import { rexerApi } from '@/services/rexer/endpoints';
import type { Page } from '@/services/rexer/types';

import { PortalShell } from '../_shell';
import { useActiveWorkspace } from '../_workspace';

export default function PortalAdCreativesPage() {
  const activeWs = useActiveWorkspace();
  const [pages, setPages] = useState<Page[]>([]);
  const [loading, setLoading] = useState(true);
  // version_id → template_id, dựng 1 lần cho cả list (xem docstring trên).
  const [versionToTemplate, setVersionToTemplate] = useState<
    Map<string, string>
  >(new Map());

  const load = () => {
    setLoading(true);
    Promise.all([
      rexerApi.pages.list(activeWs.id, { type: 'ad', limit: 100 }),
      rexerApi.templates
        .list({ limit: 500 })
        .catch(() => ({ items: [] }) as { items: [] }),
    ])
      .then(async ([pageRes, tplRes]) => {
        setPages(pageRes.items ?? []);
        const map = new Map<string, string>();
        for (const tpl of tplRes.items ?? []) {
          if (tpl.current_version_id) map.set(tpl.current_version_id, tpl.id);
        }
        setVersionToTemplate(map);
      })
      .finally(() => setLoading(false));
  };

  useEffect(load, [activeWs.id]);

  const adCreatives = useMemo(
    () =>
      pages.filter(p => {
        const meta = p.type_metadata as { format?: string } | undefined;
        return meta?.format === 'interactive_widget';
      }),
    [pages]
  );

  return (
    <PortalShell>
      <section className='flex flex-wrap items-end justify-between gap-4'>
        <div>
          <div className='text-2xs text-content-muted flex items-center gap-2 font-semibold tracking-wider uppercase'>
            <Radio className='size-3' /> Ad Creatives
          </div>
          <h1 className='mt-1 text-2xl font-bold tracking-tight'>
            Quảng cáo tương tác
          </h1>
          <p className='text-content-muted mt-1 text-sm'>
            Dựng widget nhiều slide có hotspot + CTA, nhúng iframe lên site đối
            tác, đo impression/click theo từng phần tử.
          </p>
        </div>
      </section>

      {loading ? (
        <div className='mt-10 flex justify-center'>
          <Loader2 className='text-content-muted size-6 animate-spin' />
        </div>
      ) : adCreatives.length === 0 ? (
        <div className='border-border text-content-muted bg-card mt-6 rounded-2xl border border-dashed p-10 text-center text-sm'>
          Chưa có ad creative nào. Liên hệ Rexer để được dựng ad creative đầu
          tiên.
        </div>
      ) : (
        <div className='mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3'>
          {adCreatives.map(p => (
            <AdCreativeCard
              key={p.id}
              page={p}
              templateId={versionToTemplate.get(p.template_version_id)}
            />
          ))}
        </div>
      )}
    </PortalShell>
  );
}

function AdCreativeCard({
  page,
  templateId,
}: {
  page: Page;
  templateId?: string;
}) {
  const statusChip: Record<Page['status'], string> = {
    draft: 'bg-amber-100 text-amber-700',
    published: 'bg-emerald-100 text-emerald-700',
    archived: 'bg-muted text-content-muted',
  };

  return (
    <div className='group border-border bg-card overflow-hidden rounded-2xl border shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md'>
      <div className='relative aspect-video bg-gradient-to-br from-violet-500 to-fuchsia-600'>
        {page.thumbnail_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={page.thumbnail_url}
            alt={page.name}
            className='absolute inset-0 size-full object-cover'
          />
        ) : null}
        <span
          className={`text-3xs absolute top-3 left-3 rounded-full px-2 py-0.5 font-bold backdrop-blur ${statusChip[page.status]}`}
        >
          {page.status}
        </span>
      </div>
      <div className='p-4'>
        <h3 className='line-clamp-1 text-sm font-bold tracking-tight'>
          {page.name}
        </h3>
        <p className='text-3xs text-muted-foreground mt-0.5'>
          Cập nhật {new Date(page.updated_at).toLocaleDateString('vi-VN')}
        </p>
        <div className='mt-4 grid grid-cols-2 gap-2'>
          <Link
            href={`/portal/ad-creatives/${page.id}/preview`}
            className='bg-foreground text-background hover:bg-foreground/85 inline-flex items-center justify-center rounded-lg px-2 py-1.5 text-xs font-medium transition-colors'
          >
            Preview
          </Link>
          {templateId ? (
            <Link
              href={`/canvas-templates/${templateId}`}
              className='border-border text-content-muted hover:bg-muted bg-background inline-flex items-center justify-center gap-1 rounded-lg border px-2 py-1.5 text-xs font-medium transition-colors'
            >
              <Pencil className='size-3' /> Sửa
            </Link>
          ) : (
            <span className='border-border text-muted-foreground bg-muted pointer-events-none inline-flex items-center justify-center rounded-lg border px-2 py-1.5 text-xs font-medium'>
              <Pencil className='size-3' />
            </span>
          )}
          <Link
            href={`/portal/ad-creatives/${page.id}/embed`}
            className='border-border text-content-muted hover:bg-muted bg-background inline-flex items-center justify-center rounded-lg border px-2 py-1.5 text-xs font-medium transition-colors'
          >
            Nhúng
          </Link>
          <Link
            href={`/portal/ad-creatives/${page.id}/analytics`}
            className='border-border text-content-muted hover:bg-muted bg-background inline-flex items-center justify-center rounded-lg border px-2 py-1.5 text-xs font-medium transition-colors'
          >
            Báo cáo
          </Link>
        </div>
      </div>
    </div>
  );
}
