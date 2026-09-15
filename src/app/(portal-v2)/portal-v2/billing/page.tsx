import { BillingWorkspace } from '@/components/organisms/portal-v2/billing/BillingWorkspace';
import { RxApiError } from '@/services/rexer/client';
import { rexerV2Api } from '@/services/rexer-v2/endpoints';
import type { RxBillingPlansResponse } from '@/services/rexer-v2/types/billing';

const EMPTY_PLANS: RxBillingPlansResponse = {
  plans: [],
  paypal_client_id: '',
  paypal_env: '',
};

export default async function PortalV2BillingPage() {
  /*
   * Hai nguồn, hai mức quan trọng khác nhau — nên KHÔNG dùng `Promise.all`.
   *
   * Bảng giá là thứ cả trang xoay quanh: hỏng thì không có gì để hiện. Còn gói
   * hiện tại chỉ là một tấm thẻ ở trên cùng: một brand chưa từng mua, hoặc một
   * lượt hỏi lỗi, không phải lý do để nuốt trọn trang giá.
   */
  const [plansResult, subResult] = await Promise.allSettled([
    rexerV2Api.billing.plans(),
    rexerV2Api.billing.current(),
  ]);

  if (plansResult.status === 'rejected') {
    const err = plansResult.reason;
    const loadError =
      err instanceof RxApiError
        ? err.message
        : err instanceof Error
          ? err.message
          : 'Failed to load plans';
    return (
      <BillingWorkspace
        plans={EMPTY_PLANS}
        initialSubscription={null}
        loadError={loadError}
      />
    );
  }

  return (
    <BillingWorkspace
      plans={plansResult.value}
      initialSubscription={
        subResult.status === 'fulfilled'
          ? subResult.value.subscription
          : // Hỏng thì coi như chưa có gói: trang vẫn bán được, và người dùng
            // đang có gói sẽ thấy lại nó ở lần tải sau. Thà thiếu một tấm thẻ
            // còn hơn chặn cả trang vì một lượt hỏi phụ.
            null
      }
    />
  );
}
