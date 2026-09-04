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

/** GA của NỀN TẢNG. Thiếu env thì phần này là no-op (brand vẫn có thể có GA riêng). */
export function isGaEnabled(): boolean {
  return GA_MEASUREMENT_ID.length > 0;
}

/**
 * Có bất kỳ property GA nào đang cấu hình trên trang này không — của nền tảng
 * HOẶC của brand (thẻ brand tự chèn `config` lúc parse HTML, xem
 * `BrandGoogleAnalytics`).
 *
 * Cần thiết vì trang công khai của brand có thể chỉ có GA của brand: khi đó
 * banner consent và bộ bắn page_view vẫn phải hoạt động, dù env nền tảng rỗng.
 */
export function hasAnyGaConfig(): boolean {
  if (isGaEnabled()) return true;
  if (typeof window === 'undefined') return false;
  // Entry trong dataLayer là đối tượng `arguments`, KHÔNG phải Array — dùng
  // Array.isArray ở đây thì luôn ra false và trang chỉ-có-GA-của-brand sẽ mất
  // cả banner consent lẫn page_view.
  return (window.dataLayer ?? []).some(entry => {
    if (entry === null || typeof entry !== 'object') return false;
    return (entry as { 0?: unknown })[0] === 'config';
  });
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
  // PHẢI đẩy đối tượng `arguments`, KHÔNG phải mảng thường. gtag.js duyệt
  // dataLayer và chỉ nhận diện lệnh ở dạng arguments; một Array bị bỏ qua
  // lặng lẽ — không lỗi, không cảnh báo, chỉ là không có gì xảy ra. Bản đầu
  // đẩy mảng nên `consent update` và `page_view` không bao giờ tới GA: trang
  // trông như đã gắn đủ (container đăng ký, dataLayer có entry) mà property
  // không nhận được hit nào và cookie `_ga` không hề được đặt.
  // Ưu tiên `window.gtag` do bootstrap trong <head> tạo ra, vốn đã đúng hình
  // dạng chuẩn `function gtag(){dataLayer.push(arguments)}`.
  const call = window.gtag as ((...a: unknown[]) => void) | undefined;
  if (typeof call === 'function') {
    call(...args);
    return;
  }
  // Bootstrap chưa chạy (vd môi trường test dựng DOM trần): tự tạo đúng hình
  // dạng đó thay vì đẩy mảng.
  const dl = (window.dataLayer = window.dataLayer ?? []);
  function queue() {
    // eslint-disable-next-line prefer-rest-params
    dl.push(arguments);
  }
  (queue as (...a: unknown[]) => void)(...args);
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
  if (!hasAnyGaConfig()) return;
  gtag('event', 'page_view', {
    page_path: path,
    page_location: typeof window !== 'undefined' ? window.location.href : path,
    page_title: typeof document !== 'undefined' ? document.title : undefined,
  });
}

/** Bắn event tuỳ ý (vd `gaEvent('sign_up', { method: 'google' })`). */
export function gaEvent(name: string, params?: Record<string, unknown>): void {
  if (!hasAnyGaConfig()) return;
  gtag('event', name, params);
}
