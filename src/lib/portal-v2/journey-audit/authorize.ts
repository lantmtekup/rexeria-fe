'use client';

import { rexerV2Api } from '@/services/rexer-v2/endpoints';

export type AuthorizeOutcome = 'stub' | 'opened';

/**
 * Bước authorize THẬT của wizard: `POST /v1/sources/:provider/connect`
 * (Shopify kèm `{shop}` — BE 400 nếu thiếu).
 *
 * BE phân biệt hai kiểu authorize_url (đã curl xác nhận):
 * - stub: URL trỏ về `/v1/sources/:provider/callback` của CHÍNH BE (provider
 *   chưa cấu hình OAuth) — đừng mở popup, callback chỉ trả 501; giữ demo mode.
 * - thật (GA4/Shopify đã cấu hình): URL của provider — mở popup cho người
 *   dùng ủy quyền; connection xuất hiện sau callback.
 */
export const authorizeSource = async (
  provider: string,
  shop?: string
): Promise<AuthorizeOutcome> => {
  const res = await rexerV2Api.sources.connect(provider, shop ? { shop } : {});
  if (res.authorize_url.includes(`/v1/sources/${provider}/callback`)) {
    return 'stub';
  }
  window.open(res.authorize_url, '_blank', 'width=680,height=760,noopener');
  return 'opened';
};
