'use client';

import { CheckCircle2, Copy, Loader2, Plus, RefreshCw, X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/molecules/portal-v2/Button';
import {
  DEPLOY_DNS_CNAME_TARGET,
  DEPLOY_DOMAIN_STATUS,
} from '@/lib/portal-v2/deploy/constants';
import { findDomain, isValidDomain } from '@/lib/portal-v2/deploy/helpers';
import type {
  DeployBrandDomain,
  DeployDomainStatus,
} from '@/lib/portal-v2/deploy/types';
import { cn } from '@/lib/cn';

type DomainStatusPillProps = {
  status: DeployDomainStatus;
  className?: string;
};

/**
 * Whether the hostname in front of the experience actually resolves — a
 * different question from `HealthPill`, which asks whether the experience
 * itself is serving.
 */
export const DomainStatusPill = ({
  status,
  className,
}: DomainStatusPillProps) => {
  const t = useTranslations('portalV2.deploy');
  const style = DEPLOY_DOMAIN_STATUS[status];

  return (
    <span
      title={t(style.hintKey)}
      className={cn(
        'inline-flex shrink-0 items-center gap-1.5 rounded-full px-2 py-0.5 text-[11.5px] font-semibold',
        className
      )}
      style={{ background: style.bg, color: style.fg }}
    >
      {status === 'verifying' ? (
        <Loader2 className='size-3 animate-spin' aria-hidden />
      ) : (
        <span
          className='size-1.5 rounded-full'
          style={{ background: style.dot }}
          aria-hidden
        />
      )}
      {t(style.labelKey)}
    </span>
  );
};

/* ── the 3-step DNS → TLS → Live timeline ─────────────────────────────── */

const TimelineStep = ({
  active,
  loading,
  failed,
  final,
  label,
}: {
  active: boolean;
  loading?: boolean;
  failed?: boolean;
  final?: boolean;
  label: string;
}) => (
  <span className='flex items-center gap-1.5'>
    <span
      className={cn(
        'grid size-4 shrink-0 place-items-center rounded-full',
        failed
          ? 'bg-[var(--pv2-error)] text-white'
          : active
            ? final
              ? 'bg-[var(--pv2-success)] text-white'
              : 'bg-[var(--pv2-electric)] text-white'
            : 'border border-[var(--pv2-hair)] bg-[var(--pv2-paper)]'
      )}
    >
      {loading ? (
        <Loader2 className='size-2.5 animate-spin' aria-hidden />
      ) : active || failed ? (
        <CheckCircle2 className='size-2.5' aria-hidden />
      ) : null}
    </span>
    <span
      className={cn(
        'text-[10.5px] font-bold tracking-[0.06em] uppercase',
        failed
          ? 'text-[var(--pv2-error)]'
          : active
            ? 'text-[var(--pv2-ink)]'
            : 'text-[var(--pv2-faint)]'
      )}
    >
      {label}
    </span>
  </span>
);

const TimelineConnector = ({ active }: { active: boolean }) => (
  <span
    className={cn(
      'h-px w-5 shrink-0',
      active ? 'bg-[var(--pv2-electric)]' : 'bg-[var(--pv2-hair)]'
    )}
    aria-hidden
  />
);

/** `pending → verifying → connected`, or a failed DNS step on `error`. */
export const DomainTimeline = ({ status }: { status: DeployDomainStatus }) => {
  const t = useTranslations('portalV2.deploy');
  const dnsDone = status === 'connected';
  const dnsFailed = status === 'error';
  const laterDone = status === 'connected';

  return (
    <span className='flex items-center'>
      <TimelineStep
        active={dnsDone}
        failed={dnsFailed}
        loading={status === 'verifying'}
        label={t('domainStepDns')}
      />
      <TimelineConnector active={laterDone} />
      <TimelineStep active={laterDone} label={t('domainStepTls')} />
      <TimelineConnector active={laterDone} />
      <TimelineStep active={laterDone} final label={t('domainStepLive')} />
    </span>
  );
};

/* ── the DNS records a person adds at their provider ──────────────────── */

const DnsRecordRow = ({
  kind,
  name,
  value,
}: {
  // Chấp nhận string vì `dns_records` từ BE có thể là type khác CNAME/TXT.
  kind: string;
  name: string;
  value: string;
}) => {
  const t = useTranslations('portalV2.deploy');
  const [copied, setCopied] = useState(false);

  const copy = () => {
    navigator.clipboard.writeText(`${kind}\t${name}\t${value}`).then(
      () => {
        setCopied(true);
        toast.success(t('dnsCopiedToast', { kind }));
        window.setTimeout(() => setCopied(false), 1500);
      },
      () => toast.error(t('dnsCopyFailToast'))
    );
  };

  return (
    <div className='relative overflow-hidden rounded-[8px] border border-[var(--pv2-hair)] bg-[var(--pv2-ink)]'>
      <span className='absolute top-0 left-0 rounded-br-[6px] bg-[color-mix(in_srgb,var(--pv2-ink)_60%,black)] px-1.5 py-0.5 font-mono text-[9.5px] font-bold tracking-wider text-[var(--pv2-slate-300)]'>
        {kind}
      </span>
      <button
        type='button'
        onClick={copy}
        title={t('dnsCopyTitle')}
        className='absolute top-1 right-1 grid size-6 place-items-center rounded-[6px] text-[var(--pv2-slate-300)] transition-colors hover:bg-white/10 hover:text-white'
      >
        {copied ? (
          <CheckCircle2
            className='size-3.5 text-[var(--pv2-success)]'
            aria-hidden
          />
        ) : (
          <Copy className='size-3.5' aria-hidden />
        )}
      </button>
      <div className='space-y-0.5 px-2.5 pt-6 pb-2.5 font-mono text-[11px] leading-relaxed'>
        <div className='flex flex-wrap items-baseline gap-x-2'>
          <span className='text-[var(--pv2-blue-500)]'>
            {t('dnsFieldName')}
          </span>
          <span className='text-[var(--pv2-paper)]'>{name}</span>
        </div>
        <div className='flex flex-wrap items-baseline gap-x-2'>
          <span className='text-[var(--pv2-blue-500)]'>
            {t('dnsFieldValue')}
          </span>
          <span className='break-all text-[var(--pv2-success)]'>{value}</span>
        </div>
      </div>
    </div>
  );
};

export const DnsRecordsPanel = ({ domain }: { domain: DeployBrandDomain }) => {
  const t = useTranslations('portalV2.deploy');
  const host = domain.domain.split('.').slice(0, -2).join('.') || '@';

  return (
    <div className='mt-3 rounded-[10px] border border-[var(--pv2-hair)] bg-[var(--pv2-canvas)] p-3'>
      <p className='mb-2 text-[10.5px] font-bold tracking-[0.06em] text-[var(--pv2-faint)] uppercase'>
        {t('dnsRecordsTitle')}
      </p>
      <div className='grid gap-2 sm:grid-cols-2'>
        {domain.dnsRecords?.length ? (
          // DNS records THẬT từ BE (create response).
          domain.dnsRecords.map(r => (
            <DnsRecordRow
              key={`${r.type}-${r.name}`}
              kind={r.type}
              name={r.name}
              value={r.value}
            />
          ))
        ) : (
          // Fallback: list endpoint không trả records → FE tự dựng.
          <>
            <DnsRecordRow
              kind='CNAME'
              name={host}
              value={DEPLOY_DNS_CNAME_TARGET}
            />
            <DnsRecordRow
              kind='TXT'
              // Name tương đối `_rexer-verify` (khớp BE + create-path). Ghi
              // FQDN `_rexer-verify.<domain>` dễ bị nhà cung cấp DNS nối thêm
              // zone → `_rexer-verify.<domain>.<domain>`.
              name='_rexer-verify'
              // Value = ĐÚNG token, KHÔNG tiền tố. BE verify so
              // `strings.TrimSpace(TXT) == verification_token`; thêm
              // `rexer-verify=` sẽ làm verify FAIL vĩnh viễn.
              value={domain.verificationToken}
            />
          </>
        )}
      </div>
      <p className='mt-2 text-[11px] leading-relaxed text-[var(--pv2-mut)]'>
        {t('dnsHint')}
      </p>
      {domain.status === 'error' && domain.failureReason ? (
        <p className='mt-2 text-[11px] leading-relaxed text-[var(--pv2-error)]'>
          {domain.failureReason}
        </p>
      ) : null}
    </div>
  );
};

/* ── the field itself ───────────────────────────────────────────────────── */

const selectClass = cn(
  'h-8 min-w-0 flex-1 rounded-[8px] border border-[var(--pv2-hair)] bg-[var(--pv2-paper)]',
  'px-2.5 text-[12.5px] text-[var(--pv2-ink)] outline-none transition-shadow',
  'focus:border-[var(--pv2-electric)] focus:ring-2 focus:ring-[var(--pv2-electric)]/15'
);

type DomainFieldProps = {
  /** The brand's whole domain list — a domain can be picked on more than one row. */
  domains: DeployBrandDomain[];
  /** True while the initial `rexerApi.brands.domains.list` call is in flight. */
  loading: boolean;
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  onCreate: (value: string) => void;
  creating: boolean;
  onVerify: (id: string) => void;
  verifyingId: string | null;
};

/**
 * Pick one of the brand's domains for `ch1`, or add a new one. Selecting
 * alone never produces a `connected` pill — that only happens once `onVerify`
 * resolves against the real BE, so the status shown is always something an
 * actual check stood behind, not a guess made off the string's shape.
 */
export const DomainField = ({
  domains,
  loading,
  selectedId,
  onSelect,
  onCreate,
  creating,
  onVerify,
  verifyingId,
}: DomainFieldProps) => {
  const t = useTranslations('portalV2.deploy');
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState('');
  const [draftTouched, setDraftTouched] = useState(false);
  const empty = !loading && domains.length === 0;

  /* A selection landing (picked, or just created) is the signal to close the
     add form — the same event either way, so one effect covers both. */
  useEffect(() => {
    if (selectedId) setAdding(false);
  }, [selectedId]);

  const selected = selectedId ? findDomain(domains, selectedId) : null;
  const verifying = selected ? verifyingId === selected.id : false;
  const connected = selected?.status === 'connected';
  const draftOk = draftTouched && isValidDomain(draft);

  const submitDraft = () => {
    setDraftTouched(true);
    if (!isValidDomain(draft)) return;
    onCreate(draft);
  };

  if (adding) {
    return (
      <div className='min-w-0 flex-1'>
        <div className='flex flex-wrap items-center gap-2'>
          <input
            autoFocus
            value={draft}
            onChange={e => {
              setDraft(e.target.value);
              setDraftTouched(true);
            }}
            onKeyDown={e => {
              if (e.key === 'Enter') {
                e.preventDefault();
                submitDraft();
              }
            }}
            disabled={creating}
            placeholder={t('domainPlaceholder')}
            aria-label={t('domainLabel')}
            aria-invalid={draftTouched && !draftOk}
            className={cn(
              selectClass,
              'flex-1',
              'disabled:cursor-not-allowed disabled:bg-[var(--pv2-canvas)]',
              'placeholder:text-[var(--pv2-faint)]',
              draftTouched &&
                !draftOk &&
                'border-[var(--pv2-error)] focus:border-[var(--pv2-error)] focus:ring-[var(--pv2-error)]/15'
            )}
          />
          <Button
            variant='primary'
            size='sm'
            disabled={creating || (draftTouched && !draftOk)}
            onClick={submitDraft}
          >
            {creating ? (
              <Loader2 className='size-3.5 animate-spin' aria-hidden />
            ) : null}
            {creating ? t('domainCreating') : t('domainAddButton')}
          </Button>
          {domains.length > 0 ? (
            <Button
              variant='ghost'
              size='sm'
              disabled={creating}
              onClick={() => {
                setAdding(false);
                setDraft('');
                setDraftTouched(false);
              }}
            >
              <X className='size-3.5' aria-hidden />
              {t('domainCancel')}
            </Button>
          ) : null}
        </div>
        {draftTouched && !draftOk ? (
          <p className='mt-1.5 text-[11px] font-medium text-[var(--pv2-error)]'>
            {t('domainErrFormat')}
          </p>
        ) : null}
      </div>
    );
  }

  return (
    <div className='min-w-0 flex-1'>
      <div className='flex flex-wrap items-center gap-2'>
        {empty ? (
          <span className='text-[11.5px] text-[var(--pv2-faint)]'>
            {t('domainNoneYet')}
          </span>
        ) : (
          <select
            value={selectedId ?? ''}
            disabled={loading}
            onChange={e => onSelect(e.target.value || null)}
            aria-label={t('domainLabel')}
            className={cn(selectClass, 'disabled:cursor-not-allowed')}
          >
            <option value=''>
              {loading ? t('domainLoading') : t('domainSelectPlaceholder')}
            </option>
            {domains.map(d => (
              <option key={d.id} value={d.id}>
                {d.domain} — {t(DEPLOY_DOMAIN_STATUS[d.status].labelKey)}
              </option>
            ))}
          </select>
        )}

        <Button variant='ghost' size='sm' onClick={() => setAdding(true)}>
          <Plus className='size-3.5' aria-hidden />
          {t('domainAddNew')}
        </Button>

        {selected ? (
          <>
            <Button
              variant={connected ? 'ghost' : 'primary'}
              size='sm'
              disabled={verifying}
              onClick={() => onVerify(selected.id)}
            >
              {verifying ? (
                <Loader2 className='size-3.5 animate-spin' aria-hidden />
              ) : (
                <RefreshCw className='size-3.5' strokeWidth={2.2} aria-hidden />
              )}
              {verifying
                ? t('domainVerifying')
                : connected
                  ? t('domainReverify')
                  : t('domainVerifyNow')}
            </Button>
            <DomainStatusPill
              status={verifying ? 'verifying' : selected.status}
            />
          </>
        ) : empty ? null : (
          <span className='text-[11px] text-[var(--pv2-faint)]'>
            {t('domainRequiredHint')}
          </span>
        )}
      </div>

      {selected ? (
        <div className='mt-2.5'>
          <DomainTimeline status={verifying ? 'verifying' : selected.status} />
          {!connected ? <DnsRecordsPanel domain={selected} /> : null}
        </div>
      ) : null}
    </div>
  );
};
