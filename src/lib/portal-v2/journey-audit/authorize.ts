'use client';

import { rexerV2Api } from '@/services/rexer-v2/endpoints';
import type {
  RxConnectSourceRequest,
  RxSourceConnection,
} from '@/services/rexer-v2/types/sources';

/**
 * Vòng OAuth thật của wizard connect.
 *
 * `requestAuthorize` chỉ HỎI authorize_url — không tự mở popup: wizard mở để
 * còn giữ handle (phát hiện popup bị chặn, biết lúc nào nó đóng mà dừng poll).
 *
 * BE phân biệt hai kiểu authorize_url (đã curl xác nhận):
 * - stub: URL trỏ về `/v1/sources/:provider/callback` của CHÍNH BE (provider
 *   chưa cấu hình OAuth) — không mở popup, callback chỉ trả 501; giữ demo.
 * - thật (GA4/Shopify đã cấu hình): URL của provider — mở popup; connection
 *   xuất hiện trong `GET /v1/sources` sau khi callback hoàn tất.
 */

export type AuthorizeRequestResult =
  | { kind: 'stub' }
  | { kind: 'real'; url: string }
  /** Provider credential-based: connect xong ngay trong một request. */
  | { kind: 'connected'; connection: RxSourceConnection; syncJobId?: string };

export const requestAuthorize = async (
  provider: string,
  body: RxConnectSourceRequest = {}
): Promise<AuthorizeRequestResult> => {
  const res = await rexerV2Api.sources.connect(provider, body);
  if ('authorize_url' in res) {
    if (res.authorize_url.includes(`/v1/sources/${provider}/callback`)) {
      return { kind: 'stub' };
    }
    return { kind: 'real', url: res.authorize_url };
  }
  return {
    kind: 'connected',
    connection: res.connection,
    syncJobId: res.sync_job_id,
  };
};

export const openAuthorizePopup = (url: string): Window | null =>
  window.open(url, '_blank', 'width=680,height=760');

/**
 * Mở popup TRỐNG đồng bộ NGAY trong user gesture (chống popup-blocker), rồi
 * caller điều hướng nó tới authorize_url khi response về; BE trả stub thì
 * đóng lại. Đây là lý do popup phải mở TRƯỚC khi await bất cứ thứ gì.
 */
export const openBlankPopup = (): Window | null =>
  window.open('about:blank', '_blank', 'width=680,height=760');

const sleep = (ms: number): Promise<void> =>
  new Promise(resolve => setTimeout(resolve, ms));

export type WaitForConnectionOptions = {
  /** true khi popup đã đóng — poll thêm MỘT nhịp cuối rồi dừng. */
  popupClosed: () => boolean;
  /** true khi wizard đã đóng/unmount — dừng ngay, không đụng state. */
  cancelled: () => boolean;
  intervalMs?: number;
  maxMs?: number;
};

/**
 * Poll `GET /v1/sources` (~3s) trong lúc popup authorize đang mở; trả về
 * connection vừa chuyển sang `connected` cho provider (mới toanh hoặc
 * attention→connected khi Reconnect). Popup đóng → một nhịp poll cuối; quá
 * `maxMs` hoặc wizard đóng → null.
 */
export const waitForConnection = async (
  provider: string,
  options: WaitForConnectionOptions
): Promise<RxSourceConnection | null> => {
  const intervalMs = options.intervalMs ?? 3000;
  const maxMs = options.maxMs ?? 180000;

  // Baseline TRƯỚC khi user kịp ủy quyền: connection nào của provider đang
  // KHÔNG connected thì mọi lần thấy nó connected sau này đều là tin mới.
  const baseline: Record<string, string> = {};
  try {
    (await rexerV2Api.sources.list()).items?.forEach(item => {
      baseline[item.id] = item.status;
    });
  } catch {
    // Không đọc được baseline thì coi như rỗng — connection mới vẫn bắt được.
  }

  const startedAt = Date.now();
  let finalPassDone = false;
  while (!options.cancelled()) {
    await sleep(intervalMs);
    if (options.cancelled()) return null;
    try {
      const items = (await rexerV2Api.sources.list()).items ?? [];
      const hit = items.find(
        item =>
          item.provider === provider &&
          item.status === 'connected' &&
          baseline[item.id] !== 'connected'
      );
      if (hit) return hit;
    } catch {
      // Lỗi mạng lẻ tẻ — nhịp sau thử lại.
    }
    if (Date.now() - startedAt > maxMs) return null;
    if (options.popupClosed()) {
      if (finalPassDone) return null;
      finalPassDone = true;
    }
  }
  return null;
};
