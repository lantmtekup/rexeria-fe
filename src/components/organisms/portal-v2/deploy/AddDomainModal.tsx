'use client';

import { CheckCircle2, Info, Loader2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';

import { Button } from '@/components/molecules/portal-v2/Button';
import { Modal } from '@/components/molecules/portal-v2/Modal';
import { DnsRecordsPanel } from '@/components/organisms/portal-v2/deploy/DomainField';
import { DomainPagePicker } from '@/components/organisms/portal-v2/deploy/DomainPagePicker';
import { isValidDomain } from '@/lib/portal-v2/deploy/helpers';
import type { DeployBrandDomain } from '@/lib/portal-v2/deploy/types';
import type { Page } from '@/services/rexer/types';
import { cn } from '@/lib/cn';

type AddDomainModalProps = {
  open: boolean;
  onClose: () => void;
  pages: Page[];
  pagesLoading: boolean;
  /** Resolves to the created domain (with real BE `dns_records`) or `null` on
   *  failure — the caller toasts, this modal just advances to the DNS step. */
  onCreate: (
    domain: string,
    pageId: string | null
  ) => Promise<DeployBrandDomain | null>;
  creating: boolean;
};

/**
 * Add a custom domain, bound to one landing page. Two steps: enter + bind, then
 * the DNS records to add (one CNAME under Cloudflare for SaaS, plus the
 * ownership TXT). Advancing to the DNS step only ever shows records the BE
 * actually returned — never a client guess.
 */
export const AddDomainModal = ({
  open,
  onClose,
  pages,
  pagesLoading,
  onCreate,
  creating,
}: AddDomainModalProps) => {
  const t = useTranslations('portalV2.deploy');
  const [draft, setDraft] = useState('');
  const [touched, setTouched] = useState(false);
  const [pageId, setPageId] = useState<string | null>(null);
  const [created, setCreated] = useState<DeployBrandDomain | null>(null);

  // Reset every time the modal is (re)opened — a stale draft/step from a prior
  // add must never leak into the next.
  useEffect(() => {
    if (open) {
      setDraft('');
      setTouched(false);
      setPageId(null);
      setCreated(null);
    }
  }, [open]);

  const domain = draft.trim().toLowerCase();
  const domainOk = isValidDomain(domain);
  const canSubmit = domainOk && !!pageId && !creating;

  const submit = async () => {
    setTouched(true);
    if (!domainOk || !pageId) return;
    const res = await onCreate(domain, pageId);
    if (res) setCreated(res);
  };

  const footer = created ? (
    <div className='flex justify-end'>
      <Button variant='primary' size='sm' onClick={onClose}>
        {t('domainAddDone')}
      </Button>
    </div>
  ) : (
    <div className='flex items-center justify-end gap-2'>
      <Button variant='ghost' size='sm' onClick={onClose} disabled={creating}>
        {t('domainCancel')}
      </Button>
      <Button
        variant='primary'
        size='sm'
        onClick={submit}
        disabled={!canSubmit}
      >
        {creating ? (
          <Loader2 className='size-3.5 animate-spin' aria-hidden />
        ) : null}
        {creating ? t('domainCreating') : t('domainAddSubmit')}
      </Button>
    </div>
  );

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={created ? t('domainAddedTitle') : t('domainAddTitle')}
      subtitle={created ? undefined : t('domainAddSubtitle')}
      footer={footer}
    >
      {created ? (
        <div>
          <div className='mb-4 flex items-start gap-2.5 rounded-[9px] bg-[var(--pv2-electric-soft)] px-3 py-2.5 text-[12.5px] font-medium text-[var(--pv2-electric)]'>
            <CheckCircle2 className='mt-px size-4 shrink-0' aria-hidden />
            <span>{t('domainAddedHint')}</span>
          </div>
          <DnsRecordsPanel domain={created} />
          <p className='mt-3 flex items-start gap-2 text-[11.5px] leading-relaxed text-[var(--pv2-mut)]'>
            <Info
              className='mt-px size-3.5 shrink-0 text-[var(--pv2-faint)]'
              aria-hidden
            />
            {t('domainDnsPropagateHint')}
          </p>
        </div>
      ) : (
        <div className='space-y-4'>
          <div>
            <label className='mb-1.5 block text-[12px] font-semibold text-[var(--pv2-ink)]'>
              {t('domainFieldLabel')}
            </label>
            <input
              autoFocus
              value={draft}
              onChange={e => {
                setDraft(e.target.value);
                setTouched(true);
              }}
              placeholder={t('domainPlaceholder')}
              className={cn(
                'w-full rounded-[9px] border bg-[var(--pv2-paper)] px-3 py-2.5 font-mono text-[13px]',
                'text-[var(--pv2-ink)] transition-shadow outline-none placeholder:text-[var(--pv2-faint)]',
                touched && !domainOk
                  ? 'border-[var(--pv2-error)] focus:ring-2 focus:ring-[var(--pv2-error)]/15'
                  : 'border-[var(--pv2-hair)] focus:border-[var(--pv2-electric)] focus:ring-2 focus:ring-[var(--pv2-electric)]/15'
              )}
            />
            {touched && !domainOk && draft ? (
              <p className='mt-1.5 text-[11.5px] font-medium text-[var(--pv2-error)]'>
                {t('domainErrFormat')}
              </p>
            ) : (
              <p className='mt-1.5 text-[11.5px] text-[var(--pv2-faint)]'>
                {t('domainMultiHint')}
              </p>
            )}
          </div>

          <div>
            <label className='mb-1.5 block text-[12px] font-semibold text-[var(--pv2-ink)]'>
              {t('domainBindLabel')}
            </label>
            <DomainPagePicker
              pages={pages}
              loading={pagesLoading}
              value={pageId}
              onChange={setPageId}
            />
            <p className='mt-1.5 text-[11.5px] text-[var(--pv2-faint)]'>
              {t('domainBindHint')}
            </p>
          </div>
        </div>
      )}
    </Modal>
  );
};
