'use client';

import * as React from 'react';

/**
 * Trang public nói cho các block biết lead gửi về ĐÂU.
 *
 * Block không tự biết mình đang nằm trên trang nào: nó nhận `content` và vẽ.
 * Trước đây hai block tự đoán bằng `window.location.pathname` rồi gửi
 * `page_slug: '/p/abc'` — BE nhận `page_id` là uuid HOẶC slug, nên chuỗi có
 * dấu `/` đó không khớp trang nào cả.
 *
 * `pageId` để rỗng nghĩa là KHÔNG gửi được (canvas của trình dựng, `/dev/blocks`,
 * story): hook sẽ báo `enabled: false` để form hiện đúng "bản xem trước" thay vì
 * giả vờ gửi thành công.
 */
export type LeadCaptureValue = {
  /** UUID của `Page` — khoá mà `GET /v1/leads?page_id=` dùng để đọc lại. */
  pageId: string | null;
  /** Slug public, dự phòng khi vì lý do nào đó không có `pageId`. */
  pageSlug: string | null;
};

const LeadCaptureContext = React.createContext<LeadCaptureValue>({
  pageId: null,
  pageSlug: null,
});

export function LeadCaptureProvider({
  pageId,
  pageSlug,
  children,
}: LeadCaptureValue & { children: React.ReactNode }) {
  const value = React.useMemo(
    () => ({ pageId: pageId ?? null, pageSlug: pageSlug ?? null }),
    [pageId, pageSlug]
  );
  return (
    <LeadCaptureContext.Provider value={value}>
      {children}
    </LeadCaptureContext.Provider>
  );
}

export const useLeadCapture = (): LeadCaptureValue =>
  React.useContext(LeadCaptureContext);
