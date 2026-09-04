'use client';

import {
  ExternalLink,
  Loader2,
  Lock,
  RefreshCw,
  ShieldCheck,
  Trash2,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useMemo, useState } from 'react';

import { Button } from '@/components/molecules/portal-v2/Button';
import { Modal } from '@/components/molecules/portal-v2/Modal';
import {
  DnsRecordsPanel,
  DomainStatusPill,
  DomainTimeline,
} from '@/components/organisms/portal-v2/deploy/DomainField';
import { DomainPagePicker } from '@/components/organisms/portal-v2/deploy/DomainPagePicker';
import type { DeployBrandDomain } from '@/lib/portal-v2/deploy/types';
import type { Page } from '@/services/rexer/types';

type DomainDetailModalProps = {
  open: boolean;
  domain: DeployBrandDomain;
  pages: Page[];
  pagesLoading: boolean;
  onClose: () => void;
  onVerify: (id: string) => void;
  verifying: boolean;
  onRebind: (id: string, pageId: string) => void;
  rebinding: boolean;
  onRemove: (id: string) => void;
  removing: boolean;
};

const SectionLabel = ({ children }: { children: React.ReactNode }) => (
  <p className='mb-2.5 text-[10.5px] font-bold tracking-[0.06em] text-[var(--pv2-faint)] uppercase'>
    {children}
  </p>
);

/**
 * One domain's full state: verification progress, which page it serves (with
 * rebind), the DNS records to add, and TLS detail — plus verify + remove. The
 * bound-page rebind and the DNS panel both key off the real BE fields the list
 * now carries (`page_id`, `dns_records`), so nothing here is a guess.
 */
export const DomainDetailModal = ({
  open,
  domain,
  pages,
  pagesLoading,
  onClose,
  onVerify,
  verifying,
  onRebind,
  rebinding,
  onRemove,
  removing,
}: DomainDetailModalProps) => {
  const t = useTranslations('portalV2.deploy');
  const [editingPage, setEditingPage] = useState(false);

  const boundPage = useMemo(
    () => pages.find(p => p.id === domain.pageId) ?? null,
    [pages, domain.pageId]
  );
  const connected = domain.status === 'connected';
  const tlsActive = domain.tlsStatus === 'active';
  const url = `https://${domain.domain}`;

  const footer = (
    <div className='flex items-center gap-2'>
      <Button
        variant='danger'
        size='sm'
        onClick={() => onRemove(domain.id)}
        disabled={removing}
      >
        {removing ? (
          <Loader2 className='size-3.5 animate-spin' aria-hidden />
        ) : (
          <Trash2 className='size-3.5' aria-hidden />
        )}
        {t('domainRemove')}
      </Button>
      <span className='flex-1' />
      <Button
        variant={connected ? 'ghost' : 'primary'}
        size='sm'
        onClick={() => onVerify(domain.id)}
        disabled={verifying}
      >
        {verifying ? (
          <Loader2 className='size-3.5 animate-spin' aria-hidden />
        ) : (
          <RefreshCw className='size-3.5' strokeWidth={2.2} aria-hidden />
        )}
        {verifying
          ? t('domainVerifying')
          : connected
            ? t('domainRecheck')
            : t('domainVerifyNow')}
      </Button>
    </div>
  );

  return (
    <Modal open={open} onClose={onClose} title={domain.domain} footer={footer}>
      <div className='space-y-5'>
        <div className='flex flex-wrap items-center gap-2'>
          <DomainStatusPill status={verifying ? 'verifying' : domain.status} />
          <a
            href={url}
            target='_blank'
            rel='noreferrer'
            className='inline-flex items-center gap-1 font-mono text-[12px] text-[var(--pv2-electric)] hover:underline'
          >
            <ExternalLink className='size-3' aria-hidden />
            {domain.domain}
          </a>
        </div>

        {domain.status === 'error' && domain.failureReason ? (
          <div className='rounded-[9px] bg-[color-mix(in_srgb,var(--pv2-error)_9%,transparent)] px-3 py-2.5 text-[12px] text-[var(--pv2-error)]'>
            {domain.failureReason}
          </div>
        ) : null}

        <div>
          <SectionLabel>{t('domainProgress')}</SectionLabel>
          <DomainTimeline status={verifying ? 'verifying' : domain.status} />
        </div>

        <div>
          <SectionLabel>{t('domainBoundPage')}</SectionLabel>
          {editingPage ? (
            <div className='space-y-2'>
              <DomainPagePicker
                pages={pages}
                loading={pagesLoading}
                value={domain.pageId ?? null}
                onChange={pid => {
                  onRebind(domain.id, pid);
                  setEditingPage(false);
                }}
              />
              <button
                type='button'
                onClick={() => setEditingPage(false)}
                className='text-[11.5px] text-[var(--pv2-mut)] hover:text-[var(--pv2-ink)]'
              >
                {t('domainCancel')}
              </button>
            </div>
          ) : (
            <div className='flex items-center gap-3 rounded-[9px] border border-[var(--pv2-hair)] bg-[var(--pv2-canvas)] px-3 py-2.5'>
              {boundPage ? (
                <>
                  {boundPage.thumbnail_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={boundPage.thumbnail_url}
                      alt=''
                      className='size-9 shrink-0 rounded-[7px] border border-[var(--pv2-hair)] object-cover'
                    />
                  ) : (
                    <span className='grid size-9 shrink-0 place-items-center rounded-[7px] border border-[var(--pv2-hair)] bg-[var(--pv2-paper)] text-[13px] text-[var(--pv2-faint)]'>
                      ◈
                    </span>
                  )}
                  <span className='min-w-0 flex-1'>
                    <span className='block truncate text-[13px] font-semibold text-[var(--pv2-ink)]'>
                      {boundPage.name}
                    </span>
                    <span className='block truncate font-mono text-[11.5px] text-[var(--pv2-faint)]'>
                      /p/{boundPage.slug}
                    </span>
                  </span>
                </>
              ) : (
                <span className='min-w-0 flex-1'>
                  <span className='block text-[13px] font-semibold text-[var(--pv2-warning)]'>
                    {t('domainNoPageTitle')}
                  </span>
                  <span className='block text-[11.5px] text-[var(--pv2-mut)]'>
                    {t('domainNoPageBody')}
                  </span>
                </span>
              )}
              <Button
                variant={boundPage ? 'ghost' : 'primary'}
                size='sm'
                onClick={() => setEditingPage(true)}
                disabled={rebinding}
              >
                {rebinding ? (
                  <Loader2 className='size-3.5 animate-spin' aria-hidden />
                ) : null}
                {boundPage ? t('domainChangePage') : t('domainBindPage')}
              </Button>
            </div>
          )}
        </div>

        <div>
          <SectionLabel>{t('dnsRecordsTitle')}</SectionLabel>
          <DnsRecordsPanel domain={domain} />
        </div>

        {domain.verifiedAt || tlsActive ? (
          <div>
            <SectionLabel>{t('domainDetailLabel')}</SectionLabel>
            <div className='space-y-1.5 text-[12.5px]'>
              <div className='flex items-center justify-between'>
                <span className='text-[var(--pv2-mut)]'>
                  {t('domainTlsRow')}
                </span>
                <span className='inline-flex items-center gap-1.5 font-medium text-[var(--pv2-success)]'>
                  {tlsActive ? (
                    <Lock className='size-3.5' aria-hidden />
                  ) : (
                    <ShieldCheck className='size-3.5' aria-hidden />
                  )}
                  {tlsActive ? t('domainTlsActive') : t('domainTlsPending')}
                </span>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </Modal>
  );
};
