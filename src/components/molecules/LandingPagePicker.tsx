'use client';

/**
 * Bộ chọn landing page để gắn vào campaign qua `landing_page_id`
 * (be-fe-handoff Q3 2026-06-03). BE validate page tồn tại, scope
 * `/campaigns/:id/metrics` + dựng `tracked_url` theo landing này — link bằng
 * `notes` (cách cũ) mất 2 thứ đó.
 *
 * Brand-scoped fan-out (be-fe-handoff follow-up #3): `GET /v1/pages` (listAll)
 * mount ở internal group → brand user 403. Đúng cách: lấy workspaces của brand
 * (`brands.workspaces.list`) rồi list landing mỗi workspace
 * (`pages.list(wsId, {type:'landing'})` — brand-scoped qua authorizer), gộp lại.
 * Chạy cho cả admin (mọi brand) lẫn brand user (brand của họ).
 * Degrade êm: lỗi quyền → picker rỗng, campaign vẫn tạo/sửa được.
 */

import * as React from 'react';

import { rexerApi } from '@/services/rexer/endpoints';
import type { Page } from '@/services/rexer/types';

interface Props {
  /** Brand sở hữu campaign — landing list scope theo brand này. */
  brandId: string | null | undefined;
  /** `landing_page_id` hiện tại (page UUID) hoặc null/undefined. */
  value: string | null | undefined;
  onChange: (pageId: string | undefined) => void;
  disabled?: boolean;
  className?: string;
}

const SELECT_CLASS =
  'border-input bg-background h-10 rounded-md border px-3 text-sm outline-none disabled:opacity-60';

export function LandingPagePicker({
  brandId,
  value,
  onChange,
  disabled,
  className,
}: Props) {
  const [pages, setPages] = React.useState<Page[]>([]);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    if (!brandId) {
      setPages([]);
      return;
    }
    let alive = true;
    setLoading(true);
    (async () => {
      try {
        const wsRes = await rexerApi.brands.workspaces.list(brandId);
        const workspaces = wsRes.items ?? [];
        const lists = await Promise.all(
          workspaces.map(ws =>
            rexerApi.pages
              .list(ws.id, { type: 'landing', limit: 100 })
              .catch(() => null)
          )
        );
        if (!alive) return;
        setPages(lists.flatMap(r => r?.items ?? []));
      } catch {
        // Không đủ quyền / lỗi mạng — không chặn flow tạo campaign.
        if (alive) setPages([]);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [brandId]);

  // Nếu campaign đã gắn 1 landing không nằm trong list (archived / quá limit /
  // thiếu quyền), vẫn show 1 option để value không bị mất khi save.
  const hasValueOption = !!value && pages.some(p => p.id === value);

  return (
    <select
      value={value ?? ''}
      onChange={e => onChange(e.target.value || undefined)}
      disabled={disabled || loading || !brandId}
      className={`${SELECT_CLASS} ${className ?? ''}`}
    >
      <option value=''>
        {loading ? 'Đang tải landing…' : '— Không gắn landing —'}
      </option>
      {!hasValueOption && value && (
        <option value={value}>Landing hiện tại ({value.slice(0, 8)}…)</option>
      )}
      {pages.map(p => (
        <option key={p.id} value={p.id}>
          {p.name}
          {p.status && p.status !== 'published' ? ` (${p.status})` : ''}
        </option>
      ))}
    </select>
  );
}
