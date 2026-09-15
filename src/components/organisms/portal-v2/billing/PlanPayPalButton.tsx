'use client';

import { Loader2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useEffect, useRef, useState } from 'react';

import { cn } from '@/lib/cn';
import { loadPayPalSdk } from '@/lib/portal-v2/billing/paypal';
import type { RxBillingPlan } from '@/services/rexer-v2/types/billing';

type PlanPayPalButtonProps = {
  plan: RxBillingPlan;
  clientId: string;
  /** Gọi với id subscription PayPal trả về sau khi người dùng duyệt. */
  onApproved: (paypalSubscriptionID: string, plan: RxBillingPlan) => void;
};

/**
 * Nút PayPal cho một bậc giá.
 *
 * Nút do PayPal tự render vào một <div> rỗng — KHÔNG phải nút của mình gọi API
 * PayPal. Đó là điểm mấu chốt về bảo mật: toàn bộ việc nhập thẻ diễn ra trong
 * iframe/cửa sổ của PayPal, nên số thẻ Mastercard không bao giờ chạm vào code
 * này. Muốn đổi sang form thẻ của riêng mình là một quyết định khác hẳn, kéo
 * theo nghĩa vụ PCI.
 *
 * Component này CỐ Ý không tự gọi BE. Nó chỉ báo "PayPal đã duyệt, đây là id";
 * việc xác nhận với BE do màn cha làm, vì chỉ màn cha mới biết phải cập nhật
 * phần nào của giao diện sau đó.
 */
export const PlanPayPalButton = ({
  plan,
  clientId,
  onApproved,
}: PlanPayPalButtonProps) => {
  const t = useTranslations('portalV2.billing');
  const hostRef = useRef<HTMLDivElement>(null);
  const [state, setState] = useState<'loading' | 'ready' | 'failed'>('loading');

  /*
   * `onApproved` đi qua ref chứ không nằm trong deps của effect.
   *
   * SDK PayPal chụp lại callback ở thời điểm render nút. Nếu để callback vào
   * deps, mỗi lần màn cha render lại (ví dụ vừa đổi state "đang xác nhận") sẽ
   * huỷ và dựng lại nút PayPal — ngay giữa lúc người dùng đang thao tác trong
   * cửa sổ thanh toán.
   */
  const onApprovedRef = useRef(onApproved);
  onApprovedRef.current = onApproved;

  useEffect(() => {
    let cancelled = false;
    let buttons: { close: () => void } | null = null;

    setState('loading');

    loadPayPalSdk(clientId, plan.currency)
      .then(paypal => {
        if (cancelled || !hostRef.current) return;
        hostRef.current.replaceChildren();

        const instance = paypal.Buttons({
          style: {
            layout: 'vertical',
            color: 'blue',
            shape: 'pill',
            label: 'subscribe',
            height: 40,
          },
          createSubscription: (_data, actions) =>
            actions.subscription.create({ plan_id: plan.paypal_plan_id }),
          onApprove: data => {
            if (data.subscriptionID) {
              onApprovedRef.current(data.subscriptionID, plan);
            }
          },
          onError: () => {
            if (!cancelled) setState('failed');
          },
        });
        buttons = instance;
        return instance.render(hostRef.current).then(() => {
          if (!cancelled) setState('ready');
        });
      })
      .catch(() => {
        if (!cancelled) setState('failed');
      });

    return () => {
      cancelled = true;
      // Đóng nút cũ trước khi rời đi; bỏ qua lỗi vì PayPal ném khi nút đã bị
      // gỡ khỏi DOM trước đó — không có gì để xử lý.
      try {
        buttons?.close();
      } catch {
        /* nút đã biến mất cùng DOM */
      }
    };
  }, [clientId, plan]);

  return (
    <div className='mt-4'>
      <div ref={hostRef} aria-busy={state === 'loading'} />

      {state === 'loading' ? (
        <div className='flex items-center gap-2 py-2 text-[12.5px] text-[var(--pv2-mut)]'>
          <Loader2 className='size-3.5 animate-spin' aria-hidden />
          {t('loadingPaypal')}
        </div>
      ) : null}

      {state === 'failed' ? (
        <p
          className={cn(
            'rounded-[var(--pv2-r-sm)] border border-[var(--pv2-hair)] px-3 py-2',
            'text-[12.5px] text-[var(--pv2-error)]'
          )}
        >
          {t('paypalFailed')}
        </p>
      ) : null}
    </div>
  );
};
