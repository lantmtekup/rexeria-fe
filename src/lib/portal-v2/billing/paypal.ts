import type { RxBillingPlan } from '@/services/rexer-v2/types/billing';

/**
 * Nạp SDK PayPal MỘT LẦN cho cả trang.
 *
 * SDK của PayPal gắn `window.paypal` và KHÔNG chịu được việc nạp hai lần với
 * hai bộ tham số khác nhau — lần sau lặng lẽ ghi đè lần trước, và các nút đã
 * render từ lần đầu ngừng phản hồi. Trang giá có ba thẻ, mỗi thẻ một nút, nên
 * đây đúng là tình huống đó nếu mỗi thẻ tự nạp lấy.
 *
 * Promise được nhớ theo `src`: mọi người gọi cùng chờ chung một thẻ <script>.
 */

declare global {
  interface Window {
    paypal?: PayPalNamespace;
  }
}

/** Phần API của SDK mà màn này dùng tới. */
export type PayPalNamespace = {
  Buttons: (options: PayPalButtonsOptions) => {
    render: (container: HTMLElement) => Promise<void>;
    close: () => void;
  };
};

export type PayPalButtonsOptions = {
  style?: {
    layout?: 'vertical' | 'horizontal';
    color?: 'gold' | 'blue' | 'silver' | 'white' | 'black';
    shape?: 'rect' | 'pill';
    label?: 'paypal' | 'subscribe' | 'pay';
    height?: number;
  };
  createSubscription: (
    data: unknown,
    actions: {
      subscription: {
        create: (args: { plan_id: string }) => Promise<string>;
      };
    }
  ) => Promise<string>;
  onApprove: (data: { subscriptionID?: string | null }) => void | Promise<void>;
  onError?: (err: unknown) => void;
  onCancel?: () => void;
};

const loaders = new Map<string, Promise<PayPalNamespace>>();

/**
 * `vault=true&intent=subscription` là bộ tham số BẮT BUỘC cho luồng thuê bao —
 * thiếu nó thì `actions.subscription.create` không tồn tại và nút chỉ báo lỗi
 * mơ hồ trong console.
 *
 * `components=buttons` giữ payload nhỏ; `enable-funding=card` bảo đảm lựa chọn
 * "Debit or Credit Card" luôn hiện ra — đó chính là đường đi của thẻ Mastercard
 * cho người không có tài khoản PayPal.
 */
export const paypalSdkUrl = (clientId: string, currency: string): string => {
  const params = new URLSearchParams({
    'client-id': clientId,
    vault: 'true',
    intent: 'subscription',
    currency: currency || 'USD',
    components: 'buttons',
    'enable-funding': 'card',
  });
  return `https://www.paypal.com/sdk/js?${params.toString()}`;
};

export const loadPayPalSdk = (
  clientId: string,
  currency: string
): Promise<PayPalNamespace> => {
  const src = paypalSdkUrl(clientId, currency);

  const cached = loaders.get(src);
  if (cached) return cached;

  const promise = new Promise<PayPalNamespace>((resolve, reject) => {
    if (typeof window === 'undefined') {
      reject(new Error('PayPal SDK cannot load on the server'));
      return;
    }
    if (window.paypal) {
      resolve(window.paypal);
      return;
    }
    const script = document.createElement('script');
    script.src = src;
    script.async = true;
    script.onload = () => {
      if (window.paypal) resolve(window.paypal);
      else reject(new Error('PayPal SDK loaded but window.paypal is missing'));
    };
    script.onerror = () => {
      // Bỏ khỏi cache để lần thử sau còn nạp lại được. Giữ lại một promise đã
      // reject nghĩa là mất mạng một giây rồi hỏng vĩnh viễn tới khi tải lại trang.
      loaders.delete(src);
      reject(new Error('PayPal SDK failed to load'));
    };
    document.head.appendChild(script);
  });

  loaders.set(src, promise);
  return promise;
};

/** Gói có bán được không — thiếu `paypal_plan_id` là chưa cấu hình xong. */
export const planIsPurchasable = (plan: RxBillingPlan): boolean =>
  Boolean(plan.paypal_plan_id);

/**
 * `2900` → `"$29"`, `7999` → `"$79.99"`.
 *
 * Bỏ `.00` cho gọn nhưng GIỮ phần lẻ khi khác 0 — cắt cụt "79.99" thành "79"
 * là nói sai giá.
 */
export const formatPlanPrice = (
  amountCents: number,
  currency: string,
  locale: string
): string => {
  const hasFraction = amountCents % 100 !== 0;
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency || 'USD',
    minimumFractionDigits: hasFraction ? 2 : 0,
    maximumFractionDigits: hasFraction ? 2 : 0,
  }).format(amountCents / 100);
};
