'use client';

import * as React from 'react';

import { tracker } from '@/lib/analytics/tracker';

import { useLeadCapture } from './LeadCaptureContext';

/**
 * Gửi form của một block về `POST /api/forms` → BE `/v1/forms/submit`.
 *
 * Một hook dùng chung cho MỌI block có form, vì trước đây mỗi block tự xoay
 * một kiểu và cả ba kiểu đều sai:
 *
 *   - `CiteFlowContactForm` / `BookingForm` / `RolexContact`: `setStatus('submitted')`
 *     rồi thôi. Khách đọc "Đã gửi", không ai nhận được gì.
 *   - `MintVaultInvitation`: gọi `/api/forms` (route KHÔNG tồn tại → 404), nuốt
 *     lỗi trong `catch {}` rồi vẫn hiện "done". Đây là kiểu tệ nhất — mất lead
 *     mà không ai biết.
 *   - `MintV2Cta`: cũng gọi `/api/forms`, nhưng có kiểm `res.ok` nên khách nhìn
 *     thấy lỗi. Hỏng công khai, đỡ hơn hỏng thầm lặng.
 *
 * `visitor_id` / `session_id` lấy từ chính `tracker` đang chạy trên trang, nên
 * lead nối được với hành vi đã đo trước đó — đó là dữ liệu mà BE
 * `lead_scoring.go` dùng để chấm hot/warm/cold (cta_click +15, quay lại +15,
 * cuộn ≥75% +10). Gửi rỗng thì mọi lead rơi về điểm nền của nguồn.
 */

export type LeadSubmitState = 'idle' | 'loading' | 'success' | 'error';

export type LeadSubmitPayload = {
  /** Cặp field tự do — BE lưu nguyên vào `leads.form_data`. */
  fields: Record<string, string | undefined>;
  /** Khách đã tick ô đồng ý được liên hệ chưa. */
  consent?: boolean;
};

export type UseLeadSubmit = {
  state: LeadSubmitState;
  /** Lý do lần gửi vừa rồi trượt — hiện thẳng lên form, đừng nuốt. */
  error: string | null;
  /** false ⇒ đang ở canvas/preview: form chỉ để xem, không gửi đi đâu. */
  enabled: boolean;
  submit: (payload: LeadSubmitPayload) => Promise<boolean>;
  reset: () => void;
};

const utmFromUrl = (): Record<string, string> => {
  if (typeof window === 'undefined') return {};
  const sp = new URLSearchParams(window.location.search);
  const out: Record<string, string> = {};
  for (const k of ['utm_source', 'utm_medium', 'utm_campaign'] as const) {
    const v = sp.get(k);
    if (v) out[k] = v;
  }
  return out;
};

/**
 * @param isCanvas `useIsCanvasEdit(rootRef)` của chính block — canvas của trình
 *   dựng render form thật để người dùng sửa nhãn, bấm Gửi ở đó KHÔNG được tạo
 *   lead giả trong bảng của brand.
 */
export function useLeadSubmit(isCanvas = false): UseLeadSubmit {
  const { pageId, pageSlug } = useLeadCapture();
  const [state, setState] = React.useState<LeadSubmitState>('idle');
  const [error, setError] = React.useState<string | null>(null);

  const enabled = !isCanvas && Boolean(pageId ?? pageSlug);

  const reset = React.useCallback(() => {
    setState('idle');
    setError(null);
  }, []);

  const submit = React.useCallback(
    async ({ fields, consent }: LeadSubmitPayload): Promise<boolean> => {
      if (isCanvas) return false;
      // Không có trang đích thì nói thẳng, đừng hiện "đã gửi". Đây là trạng
      // thái của `/dev/blocks` và của trang chưa publish.
      if (!pageId && !pageSlug) {
        setState('error');
        setError('Form chưa gắn với trang nào nên chưa gửi được.');
        return false;
      }
      setState('loading');
      setError(null);

      const clean: Record<string, string> = {};
      for (const [k, v] of Object.entries(fields)) {
        const trimmed = v?.trim();
        if (trimmed) clean[k] = trimmed;
      }

      try {
        const res = await fetch('/api/forms', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            page_id: pageId ?? undefined,
            page_slug: pageSlug ?? undefined,
            fields: clean,
            consent: consent === true,
            session_id: tracker.session,
            visitor_id: tracker.visitor,
            ...utmFromUrl(),
          }),
        });
        const data = (await res.json().catch(() => null)) as {
          ok?: boolean;
          message?: string;
        } | null;
        if (!res.ok || data?.ok !== true) {
          setState('error');
          setError(data?.message ?? 'Gửi không thành công, thử lại giúp mình.');
          return false;
        }
        setState('success');
        return true;
      } catch {
        setState('error');
        setError('Mất kết nối, thử lại giúp mình.');
        return false;
      }
    },
    [isCanvas, pageId, pageSlug]
  );

  return { state, error, enabled, submit, reset };
}
