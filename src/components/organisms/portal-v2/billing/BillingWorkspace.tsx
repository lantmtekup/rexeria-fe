'use client';

import { AlertTriangle, Check, CreditCard, Loader2 } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { useCallback, useMemo, useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/molecules/portal-v2/Button';
import { PlanPayPalButton } from '@/components/organisms/portal-v2/billing/PlanPayPalButton';
import { cn } from '@/lib/cn';
import {
  formatPlanPrice,
  planIsPurchasable,
} from '@/lib/portal-v2/billing/paypal';
import { RxApiError } from '@/services/rexer/client';
import { rexerV2Api } from '@/services/rexer-v2/endpoints';
import type {
  RxBillingPlan,
  RxBillingPlansResponse,
  RxBrandSubscription,
  RxSubscriptionStatus,
} from '@/services/rexer-v2/types/billing';

type BillingWorkspaceProps = {
  plans: RxBillingPlansResponse;
  initialSubscription: RxBrandSubscription | null;
  /** Lỗi khi nạp ở server — hiện thay cho bảng giá. */
  loadError?: string | null;
};

const STATUS_KEY: Record<RxSubscriptionStatus, string> = {
  approval_pending: 'statusApprovalPending',
  active: 'statusActive',
  past_due: 'statusPastDue',
  suspended: 'statusSuspended',
  cancelled: 'statusCancelled',
  expired: 'statusExpired',
};

/** Trạng thái cần người dùng để mắt tới — tô cảnh báo thay vì màu bình thường. */
const NEEDS_ATTENTION: RxSubscriptionStatus[] = [
  'past_due',
  'suspended',
  'expired',
];

export const BillingWorkspace = ({
  plans,
  initialSubscription,
  loadError = null,
}: BillingWorkspaceProps) => {
  const t = useTranslations('portalV2.billing');
  const locale = useLocale();

  const [subscription, setSubscription] = useState(initialSubscription);
  const [busy, setBusy] = useState<'activating' | 'cancelling' | null>(null);

  const billingEnabled = Boolean(plans.paypal_client_id);
  const isSandbox = plans.paypal_env === 'sandbox';

  const currentPlanCode = useMemo(() => {
    // Gói đã huỷ/hết hạn KHÔNG còn là "gói hiện tại" — nếu vẫn đánh dấu, người
    // dùng sẽ thấy bậc cũ được tô sáng và tưởng mình vẫn đang trả tiền cho nó.
    if (!subscription) return null;
    if (
      subscription.status === 'cancelled' ||
      subscription.status === 'expired'
    )
      return null;
    return subscription.plan_code;
  }, [subscription]);

  const handleApproved = useCallback(
    async (paypalSubscriptionID: string, plan: RxBillingPlan) => {
      setBusy('activating');
      try {
        const res = await rexerV2Api.billing.activate({
          paypal_subscription_id: paypalSubscriptionID,
          plan_code: plan.code,
        });
        setSubscription(res.subscription);
        toast.success(t('activated', { plan: plan.name }));
      } catch (err) {
        const msg =
          err instanceof RxApiError
            ? err.message
            : err instanceof Error
              ? err.message
              : t('activateFailed');
        toast.error(msg);
      } finally {
        setBusy(null);
      }
    },
    [t]
  );

  const handleCancel = useCallback(async () => {
    if (!window.confirm(t('cancelConfirm'))) return;
    setBusy('cancelling');
    try {
      const res = await rexerV2Api.billing.cancel();
      setSubscription(res.subscription);
      toast.success(t('cancelled'));
    } catch (err) {
      const msg =
        err instanceof RxApiError
          ? err.message
          : err instanceof Error
            ? err.message
            : t('cancelFailed');
      toast.error(msg);
    } finally {
      setBusy(null);
    }
  }, [t]);

  const formatDate = useCallback(
    (iso: string | null) => {
      if (!iso) return null;
      const d = new Date(iso);
      if (Number.isNaN(d.getTime())) return null;
      return new Intl.DateTimeFormat(locale, { dateStyle: 'long' }).format(d);
    },
    [locale]
  );

  return (
    <div className='flex min-h-0 flex-col'>
      <div className='pv2-page-header'>
        <div className='mx-auto flex w-full flex-wrap items-end justify-between gap-4 px-5 pt-6 pb-4 md:px-8'>
          <div className='min-w-0'>
            <h1 className='font-[family-name:var(--pv2-disp)] text-[1.625rem] font-bold tracking-[-0.03em] text-[var(--pv2-ink)] md:text-[1.75rem]'>
              {t('title')}
            </h1>
            <p className='mt-1 max-w-[70ch] text-[13.5px] leading-relaxed text-[var(--pv2-mut)]'>
              {t('subtitle')}
            </p>
          </div>
        </div>
      </div>

      <div className='mx-auto w-full px-5 py-6 md:px-8'>
        {loadError ? (
          <div
            className={cn(
              'rounded-[var(--pv2-r-lg)] border border-dashed border-[var(--pv2-hair)]',
              'bg-[var(--pv2-paper)] px-6 py-14 text-center'
            )}
          >
            <p className='text-[15px] font-semibold text-[var(--pv2-ink)]'>
              {t('loadError')}
            </p>
            <p className='mt-2 text-[13px] text-[var(--pv2-mut)]'>
              {loadError}
            </p>
          </div>
        ) : (
          <>
            {/* Nhãn sandbox phải NỔI BẬT: người thử nghiệm cần biết ngay là
                không có tiền thật nào bị trừ, trước khi họ nhập thẻ. */}
            {billingEnabled && isSandbox ? (
              <div
                className={cn(
                  'mb-4 flex items-center gap-2 rounded-[var(--pv2-r)] border px-4 py-2.5',
                  'border-[var(--pv2-warn,#d98324)]/30 bg-[var(--pv2-warn,#d98324)]/8',
                  'text-[12.5px] font-semibold text-[var(--pv2-ink)]'
                )}
              >
                <AlertTriangle className='size-4 shrink-0' aria-hidden />
                {t('sandboxWarning')}
              </div>
            ) : null}

            {!billingEnabled ? (
              <div
                className={cn(
                  'mb-4 rounded-[var(--pv2-r)] border border-[var(--pv2-hair)]',
                  'bg-[var(--pv2-paper)] px-4 py-3 text-[12.5px] text-[var(--pv2-mut)]'
                )}
              >
                {t('notConfigured')}
              </div>
            ) : null}

            {subscription ? (
              <CurrentPlanPanel
                subscription={subscription}
                statusLabel={t(
                  STATUS_KEY[subscription.status] ?? 'statusApprovalPending'
                )}
                needsAttention={NEEDS_ATTENTION.includes(subscription.status)}
                periodLabel={(() => {
                  const date = formatDate(subscription.current_period_end);
                  if (!date) return null;
                  return subscription.cancel_at_period_end
                    ? t('endsOn', { date })
                    : t('renewsOn', { date });
                })()}
                cancelPendingLabel={
                  subscription.cancel_at_period_end ? t('cancelPending') : null
                }
                canCancel={
                  subscription.status !== 'cancelled' &&
                  subscription.status !== 'expired' &&
                  !subscription.cancel_at_period_end
                }
                cancelling={busy === 'cancelling'}
                onCancel={handleCancel}
                labels={{
                  heading: t('yourPlan'),
                  status: t('statusLabel'),
                  cancel: t('cancel'),
                  cancelling: t('cancelling'),
                }}
                locale={locale}
              />
            ) : (
              <p className='mb-5 text-[13px] text-[var(--pv2-mut)]'>
                {t('noSubscription')}
              </p>
            )}

            <div className='grid grid-cols-[repeat(auto-fit,minmax(272px,1fr))] gap-4'>
              {plans.plans.map(plan => {
                const isCurrent = plan.code === currentPlanCode;
                const purchasable = planIsPurchasable(plan) && billingEnabled;
                return (
                  <article
                    key={plan.code}
                    className={cn(
                      'flex flex-col rounded-[var(--pv2-r-lg)] border bg-[var(--pv2-paper)] p-5',
                      plan.highlight
                        ? 'border-[var(--pv2-electric)] shadow-[0_8px_28px_rgba(56,98,255,0.12)]'
                        : 'border-[var(--pv2-hair)]',
                      isCurrent && 'ring-2 ring-[var(--pv2-electric)]/30'
                    )}
                  >
                    <div className='flex items-center justify-between gap-2'>
                      <h2 className='text-[15px] font-bold text-[var(--pv2-ink)]'>
                        {plan.name}
                      </h2>
                      {isCurrent ? (
                        <span className='rounded-full bg-[var(--pv2-electric-soft)] px-2.5 py-1 text-[11px] font-bold text-[var(--pv2-electric)]'>
                          {t('currentPlan')}
                        </span>
                      ) : plan.highlight ? (
                        <span className='rounded-full bg-[var(--pv2-canvas)] px-2.5 py-1 text-[11px] font-bold text-[var(--pv2-mut)]'>
                          {t('popular')}
                        </span>
                      ) : null}
                    </div>

                    <p className='mt-3 flex items-baseline gap-1'>
                      <span className='font-[family-name:var(--pv2-disp)] text-[2rem] font-bold tracking-[-0.03em] text-[var(--pv2-ink)]'>
                        {formatPlanPrice(
                          plan.amount_cents,
                          plan.currency,
                          locale
                        )}
                      </span>
                      <span className='text-[13px] text-[var(--pv2-mut)]'>
                        {t('perMonth')}
                      </span>
                    </p>

                    <ul className='mt-4 flex flex-1 flex-col gap-2'>
                      {plan.features.map(feature => (
                        <li
                          key={feature}
                          className='flex items-start gap-2 text-[13px] text-[var(--pv2-slate-500)]'
                        >
                          <Check
                            className='mt-[3px] size-3.5 shrink-0 text-[var(--pv2-electric)]'
                            strokeWidth={2.5}
                            aria-hidden
                          />
                          {feature}
                        </li>
                      ))}
                    </ul>

                    {isCurrent ? null : purchasable ? (
                      <PlanPayPalButton
                        plan={plan}
                        clientId={plans.paypal_client_id}
                        onApproved={handleApproved}
                      />
                    ) : (
                      <div className='mt-4'>
                        <Button variant='ghost' disabled className='w-full'>
                          {t('choosePlan')}
                        </Button>
                        <p className='mt-2 text-[11.5px] text-[var(--pv2-faint)]'>
                          {billingEnabled
                            ? t('planUnavailable')
                            : t('notConfigured')}
                        </p>
                      </div>
                    )}
                  </article>
                );
              })}
            </div>

            {/* Câu này quan trọng hơn vẻ ngoài của nó: rất nhiều người ở VN
                không có tài khoản PayPal và sẽ bỏ đi khi thấy nút PayPal, dù
                thẻ Mastercard của họ dùng được ngay trong chính luồng đó. */}
            {billingEnabled ? (
              <p className='mt-5 flex items-start gap-2 text-[12.5px] leading-relaxed text-[var(--pv2-mut)]'>
                <CreditCard
                  className='mt-[2px] size-4 shrink-0'
                  strokeWidth={1.75}
                  aria-hidden
                />
                {t('cardHint')}
              </p>
            ) : null}
          </>
        )}

        {busy === 'activating' ? (
          <div className='pointer-events-none fixed inset-0 z-[calc(var(--pv2-z-top)+5)] grid place-items-center bg-black/10'>
            <div className='flex items-center gap-2 rounded-[var(--pv2-r)] bg-[var(--pv2-paper)] px-4 py-3 shadow-[var(--pv2-sh-soft)]'>
              <Loader2 className='size-4 animate-spin text-[var(--pv2-electric)]' />
              <span className='text-[13px] font-semibold text-[var(--pv2-ink)]'>
                {t('activating')}
              </span>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};

type CurrentPlanPanelProps = {
  subscription: RxBrandSubscription;
  statusLabel: string;
  needsAttention: boolean;
  periodLabel: string | null;
  cancelPendingLabel: string | null;
  canCancel: boolean;
  cancelling: boolean;
  onCancel: () => void;
  labels: {
    heading: string;
    status: string;
    cancel: string;
    cancelling: string;
  };
  locale: string;
};

const CurrentPlanPanel = ({
  subscription,
  statusLabel,
  needsAttention,
  periodLabel,
  cancelPendingLabel,
  canCancel,
  cancelling,
  onCancel,
  labels,
  locale,
}: CurrentPlanPanelProps) => (
  <section
    className={cn(
      'mb-5 flex flex-wrap items-center gap-x-6 gap-y-3 rounded-[var(--pv2-r-lg)]',
      'border border-[var(--pv2-hair)] bg-[var(--pv2-paper)] px-5 py-4'
    )}
  >
    <div className='min-w-[180px]'>
      <p className='text-[11px] font-bold tracking-[0.05em] text-[var(--pv2-faint)] uppercase'>
        {labels.heading}
      </p>
      <p className='mt-1 text-[15px] font-semibold text-[var(--pv2-ink)]'>
        {formatPlanPrice(
          subscription.amount_cents,
          subscription.currency,
          locale
        )}{' '}
        · {subscription.plan_code}
      </p>
    </div>

    <div className='min-w-[140px]'>
      <p className='text-[11px] font-bold tracking-[0.05em] text-[var(--pv2-faint)] uppercase'>
        {labels.status}
      </p>
      <p
        className={cn(
          'mt-1 text-[13.5px] font-semibold',
          needsAttention ? 'text-[var(--pv2-error)]' : 'text-[var(--pv2-ink)]'
        )}
      >
        {statusLabel}
      </p>
    </div>

    {periodLabel ? (
      <p className='text-[13px] text-[var(--pv2-mut)]'>{periodLabel}</p>
    ) : null}

    {cancelPendingLabel ? (
      <span className='rounded-full border border-[var(--pv2-hair)] px-2.5 py-1 text-[11.5px] font-semibold text-[var(--pv2-mut)]'>
        {cancelPendingLabel}
      </span>
    ) : null}

    {canCancel ? (
      <div className='ml-auto'>
        <Button variant='danger' onClick={onCancel} disabled={cancelling}>
          {cancelling ? labels.cancelling : labels.cancel}
        </Button>
      </div>
    ) : null}
  </section>
);
