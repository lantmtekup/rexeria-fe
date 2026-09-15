/**
 * Thuê bao tháng qua PayPal — hợp đồng với BE (migration 000107).
 *
 * ĐỒNG TIỀN: PayPal KHÔNG hỗ trợ VND, nên `currency` thực tế luôn là 'USD'.
 * Muốn hiện giá VND thì đó là QUY ĐỔI HIỂN THỊ ở FE, không phải số tiền thực
 * thu — đừng gửi VND xuống BE.
 *
 * THẺ MASTERCARD: người dùng bấm nút PayPal rồi chọn "Debit or Credit Card"
 * ngay trong luồng của PayPal. Không có số thẻ nào đi qua FE, nên không có
 * trường thẻ nào trong các kiểu dưới đây — và đừng thêm vào.
 */

/** Một bậc giá. Danh mục do BE đọc từ config, không phải từ DB. */
export type RxBillingPlan = {
  /** Mã nội bộ: starter | growth | scale. */
  code: string;
  name: string;
  /**
   * Id plan bên PayPal. RỖNG = bậc này chưa cấu hình được và KHÔNG bán được —
   * UI phải chặn nút mua thay vì dựng một nút PayPal không bao giờ mở.
   */
  paypal_plan_id: string;
  amount_cents: number;
  currency: string;
  features: string[];
  highlight: boolean;
};

export type RxBillingPlansResponse = {
  plans: RxBillingPlan[];
  /** Client id công khai để nạp SDK PayPal. Rỗng = BE chưa bật thanh toán. */
  paypal_client_id: string;
  /** 'sandbox' | 'live' — hiện nhãn cảnh báo khi đang ở sandbox. */
  paypal_env: string;
};

export type RxSubscriptionStatus =
  | 'approval_pending'
  | 'active'
  | 'past_due'
  | 'suspended'
  | 'cancelled'
  | 'expired';

export type RxBrandSubscription = {
  id: string;
  brand_id: string;
  plan_code: string;
  provider: string;
  provider_subscription_id: string;
  provider_plan_id: string | null;
  status: RxSubscriptionStatus;
  currency: string;
  amount_cents: number;
  /** Mốc hết chu kỳ hiện tại (ISO). null khi chưa kích hoạt xong. */
  current_period_end: string | null;
  /** Đã bấm huỷ nhưng còn dùng hết chu kỳ đã trả tiền. */
  cancel_at_period_end: boolean;
  last_event_at: string | null;
  created_at: string;
  updated_at: string;
};

/** `subscription` null = brand chưa từng mua gói nào. */
export type RxSubscriptionResponse = {
  subscription: RxBrandSubscription | null;
  plan: RxBillingPlan | null;
};

/**
 * Thân của lượt kích hoạt. CHỈ hai id — BE đọc lại mọi con số từ PayPal chứ
 * không tin body này. Thêm `amount` hay `currency` vào đây là mở đường cho
 * người dùng tự khai giá.
 */
export type RxActivateSubscriptionRequest = {
  paypal_subscription_id: string;
  plan_code: string;
};
