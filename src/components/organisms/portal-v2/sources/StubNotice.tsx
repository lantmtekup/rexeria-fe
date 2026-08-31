'use client';

import { useTranslations } from 'next-intl';

import { Button } from '@/components/molecules/portal-v2/Button';
import { Modal } from '@/components/molecules/portal-v2/Modal';
import type { AuditSource } from '@/lib/portal-v2/journey-audit/types';

/**
 * Segment env của từng provider OAuth trên BE (viper dot→underscore,
 * `internal/config/config.go` SourcesConfig): FE id → REXER_APP_SOURCES_<KEY>.
 * Provider credential-based (woocommerce/retail_feed/amazon) KHÔNG có entry —
 * BE luôn xử lý thật, màn này chỉ hiện khi BE cũ chưa ship connector.
 */
const OAUTH_ENV_KEYS: Record<string, string> = {
  ga4: 'GA4',
  shopify: 'SHOPIFY',
  meta: 'META',
  tiktokads: 'TIKTOK_ADS',
  tiktokshop: 'TIKTOK_SHOP',
  klaviyo: 'KLAVIYO',
};

type StubNoticeProps = {
  source: AuditSource;
  open: boolean;
  onClose: () => void;
  /** User chủ động xem demo — wizard tiếp tục các bước mô phỏng như cũ. */
  onViewDemo: () => void;
};

/**
 * Màn "provider chưa được cấu hình trên server" — hiện khi BE trả authorize
 * stub. KHÔNG tự chạy demo (UAT: người test tưởng lỗi); demo chỉ chạy khi
 * user bấm nút "Xem demo flow".
 */
export const StubNotice = ({
  source,
  open,
  onClose,
  onViewDemo,
}: StubNoticeProps) => {
  const t = useTranslations('portalV2.sources');
  const envKey = OAUTH_ENV_KEYS[source.provider];

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={t('wizardTitle', { name: source.name })}
      subtitle={`${source.auth} · ${t('wizardReadOnly')} · ${source.category}`}
      footer={
        <>
          <Button variant='ghost' className='mr-auto' onClick={onClose}>
            {t('wizardClose')}
          </Button>
          <Button variant='primary' onClick={onViewDemo}>
            {t('wizardStubDemoCta')}
          </Button>
        </>
      }
    >
      <div className='mb-3.5 rounded-[var(--pv2-r-sm)] border border-[color-mix(in_srgb,var(--pv2-warning)_40%,var(--pv2-hair))] bg-[color-mix(in_srgb,var(--pv2-warning)_8%,var(--pv2-paper))] px-3 py-2.5 text-xs leading-relaxed font-semibold text-[color-mix(in_srgb,var(--pv2-warning)_75%,var(--pv2-ink))]'>
        ⚠️ {t('wizardStubTitle', { name: source.name })}
      </div>
      <p className='mb-3.5 text-[13px] leading-relaxed text-[var(--pv2-mut)]'>
        {envKey
          ? t('wizardStubOAuthDesc', { name: source.name })
          : t('wizardStubCredentialDesc', { name: source.name })}
      </p>
      {envKey ? (
        <div className='mb-3.5 rounded-[var(--pv2-r-sm)] border border-[var(--pv2-hair)] bg-[var(--pv2-canvas)] px-3 py-2.5 font-mono text-xs leading-relaxed text-[var(--pv2-ink)]'>
          <div>{`REXER_APP_SOURCES_${envKey}_CLIENT_ID`}</div>
          <div>{`REXER_APP_SOURCES_${envKey}_CLIENT_SECRET`}</div>
        </div>
      ) : null}
      <p className='text-2xs leading-relaxed text-[var(--pv2-faint)]'>
        {t('wizardStubDemoNote')}
      </p>
    </Modal>
  );
};
