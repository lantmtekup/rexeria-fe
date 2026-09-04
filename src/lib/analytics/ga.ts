/**
 * Google Analytics 4 — helper dùng chung cho portal, landing và trang công khai
 * `/p/[id]` (kể cả khi trang đó chạy trên custom domain của brand).
 *
 * Quan hệ với tracker nội bộ (`src/lib/analytics/tracker.ts`): hai hệ ĐỘC LẬP.
 * Tracker nội bộ vẫn là nguồn số liệu của Analytics trong Portal (BE ingest);
 * GA4 là lớp đo bổ sung cho marketing. Không cái nào thay cái nào.
 *
 * Consent Mode v2: mặc định TỪ CHỐI mọi storage cho tới khi người dùng đồng ý
 * (xem `ConsentBanner`). Script `gtag.js` vẫn nạp, nhưng ở trạng thái denied nó
 * chỉ gửi ping không cookie — đúng mô hình Google khuyến nghị cho EU/UK.
 */

export const GA_MEASUREMENT_ID =
  process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID ?? '';

/** Chỉ bật khi có measurement id — thiếu env thì mọi thứ ở đây là no-op. */
export function isGaEnabled(): boolean {
  return GA_MEASUREMENT_ID.length > 0;
}

/** Key lưu lựa chọn consent. Đổi hậu tố khi danh mục consent thay đổi để hỏi lại. */
export const CONSENT_STORAGE_KEY = 'rexer.consent.v1';

export type ConsentChoice = 'granted' | 'denied';

type GtagArgs =
  | ['js', Date]
  | ['config', string, Record<string, unknown>?]
  | ['event', string, Record<string, unknown>?]
  | ['consent', 'default' | 'update', Record<string, string | number>];

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: GtagArgs) => void;
  }
}

function gtag(...args: GtagArgs): void {
  if (typeof window === 'undefined') return;
  // Đẩy thẳng vào dataLayer thay vì gọi window.gtag: inline script trong
  // <head> đã tạo dataLayer trước khi gtag.js kịp nạp, nên hàng đợi luôn tồn
  // tại kể cả lúc script ngoài còn đang tải (hoặc bị adblock chặn hẳn).
  (window.dataLayer = window.dataLayer ?? []).push(args);
}

/** Đọc lựa chọn đã lưu. `null` = chưa hỏi ⇒ cần hiện banner. */
export function readConsent(): ConsentChoice | null {
  if (typeof window === 'undefined') return null;
  try {
    const v = window.localStorage.getItem(CONSENT_STORAGE_KEY);
    return v === 'granted' || v === 'denied' ? v : null;
  } catch {
    // Safari private mode / storage bị chặn: coi như chưa hỏi, và việc ghi
    // bên dưới cũng sẽ nuốt lỗi — banner hiện lại mỗi phiên, chấp nhận được.
    return null;
  }
}

/** Phát `consent update` cho GA. Tách riêng để dùng lại khi replay lựa chọn cũ. */
function pushConsent(choice: ConsentChoice): void {
  gtag('consent', 'update', {
    ad_storage: choice,
    ad_user_data: choice,
    ad_personalization: choice,
    analytics_storage: choice,
  });
}

/**
 * Ghi lựa chọn và báo cho GA. Gọi cả khi từ chối — Consent Mode cần biết
 * trạng thái denied một cách tường minh.
 */
export function writeConsent(choice: ConsentChoice): void {
  try {
    window.localStorage.setItem(CONSENT_STORAGE_KEY, choice);
  } catch {
    // Không lưu được thì thôi, vẫn cập nhật consent cho phiên hiện tại.
  }
  pushConsent(choice);
}

/**
 * Phát lại lựa chọn đã lưu ở MỖI lần tải trang.
 *
 * Mặc định trong `<head>` luôn là `denied`, và `consent update` chỉ xảy ra lúc
 * người dùng bấm banner. Không có bước replay này thì người đã đồng ý từ trước
 * vẫn bị coi là từ chối ở mọi lần vào sau — GA chạy cookieless vĩnh viễn.
 * Không có lựa chọn nào đã lưu ⇒ giữ nguyên denied và để banner hỏi.
 */
export function syncStoredConsent(): void {
  const stored = readConsent();
  if (stored) pushConsent(stored);
}

/**
 * Bắn `page_view` thủ công. `config` được đặt `send_page_view: false` vì App
 * Router điều hướng phía client — gtag.js chỉ tự bắn cho lần tải đầu, mọi lần
 * chuyển route sau đó sẽ mất nếu không gọi tay.
 */
export function gaPageview(path: string): void {
  if (!isGaEnabled()) return;
  gtag('event', 'page_view', {
    page_path: path,
    page_location: typeof window !== 'undefined' ? window.location.href : path,
    page_title: typeof document !== 'undefined' ? document.title : undefined,
  });
}

/** Bắn event tuỳ ý (vd `gaEvent('sign_up', { method: 'google' })`). */
export function gaEvent(name: string, params?: Record<string, unknown>): void {
  if (!isGaEnabled()) return;
  gtag('event', name, params);
}
