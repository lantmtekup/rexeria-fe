'use client';

import { ExternalLink, Loader2, Phone } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import * as React from 'react';

import { Button } from '@/components/molecules/portal-v2/Button';
import { cn } from '@/lib/cn';
import type { ExperienceView } from '@/lib/portal-v2/experiences/types';
import {
  LEADS_PAGE_PARAM,
  LEADS_RANGE_PARAM,
  LEADS_STATUS_PARAM,
  LEADS_TIER_PARAM,
  type LeadsFilters,
} from '@/lib/portal-v2/leads/params';
import { extraFormFields } from '@/services/portal-v2/leads';
import { rexerApi } from '@/services/rexer/endpoints';
import type { Lead, LeadStatus } from '@/services/rexer/types';

/**
 * Bảng "khách để lại thông tin" của một trang.
 *
 * Đây là mặt SALES, không phải mặt analytics: mỗi dòng là một người có thật
 * đang chờ được gọi lại. Nên thứ tự cột đi theo việc gọi — liên hệ trước, độ
 * nóng ngay cạnh, nguồn để biết mở lời thế nào, rồi mới tới thời gian.
 *
 * Ba chỗ cố ý:
 *  1. Số điện thoại/email là LINK `tel:`/`mailto:` — người trực bấm gọi ngay
 *     trên máy, không phải bôi đen rồi chép.
 *  2. Đổi trạng thái ghi thẳng xuống BE (`PATCH /v1/leads/{id}`, có ghi
 *     `lead_status_log`) và chỉ đổi trên màn hình SAU KHI server nhận. Đổi lạc
 *     quan ở đây là bày ra một bảng công việc sai cho cả đội.
 *  3. `form_data` in nguyên phần field lạ — đó là những gì form của block hỏi
 *     thêm (ghi chú, căn quan tâm, ngân sách). Bỏ đi thì mất đúng thông tin
 *     khiến cuộc gọi đầu tiên không phải hỏi lại từ đầu.
 */

type LeadsWorkspaceProps = {
  experiences: ExperienceView[];
  filters: LeadsFilters;
  initialLeads: Lead[];
  total: number;
  error: string | null;
  needsBrand: boolean;
};

const headClass =
  'bg-[var(--pv2-canvas)] px-3.5 py-2.5 text-left text-[10.5px] font-bold tracking-[0.05em] text-[var(--pv2-mut)] uppercase whitespace-nowrap';

const cellClass =
  'border-b border-[var(--pv2-hair)] px-3.5 py-3 text-[12.5px] align-top';

const STATUSES: LeadStatus[] = [
  'new',
  'contacted',
  'negotiating',
  'won',
  'lost',
];

/** Bậc nóng của BE (`core.lead_scoring`): hot ≥80 · warm 50–79 · cold <50. */
const TIER_CLASS = {
  hot: 'bg-[color-mix(in_srgb,var(--pv2-error)_14%,transparent)] text-[#b42318]',
  warm: 'bg-[color-mix(in_srgb,var(--pv2-warning)_18%,transparent)] text-[#b45309]',
  cold: 'bg-[var(--pv2-canvas)] text-[var(--pv2-faint)]',
} as const;

const STATUS_CLASS: Record<LeadStatus, string> = {
  new: 'bg-[var(--pv2-electric-soft)] text-[var(--pv2-electric)]',
  contacted:
    'bg-[color-mix(in_srgb,var(--pv2-warning)_18%,transparent)] text-[#b45309]',
  negotiating:
    'bg-[color-mix(in_srgb,var(--pv2-violet)_16%,transparent)] text-[#6d28d9]',
  won: 'bg-[color-mix(in_srgb,var(--pv2-success)_14%,transparent)] text-[#15803d]',
  lost: 'bg-[var(--pv2-canvas)] text-[var(--pv2-faint)]',
};

const isEmail = (contact: string) => contact.includes('@');

const contactHref = (contact: string) =>
  isEmail(contact)
    ? `mailto:${contact}`
    : `tel:${contact.replace(/[^\d+]/g, '')}`;

/** Giờ địa phương, tuyệt đối. "3 giờ trước" đọc sai ngay khi tab mở lâu. */
const formatWhen = (iso: string): string => {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export function LeadsWorkspace({
  experiences,
  filters,
  initialLeads,
  total,
  error,
  needsBrand,
}: LeadsWorkspaceProps) {
  const t = useTranslations('portalV2.leads');
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  const [leads, setLeads] = React.useState<Lead[]>(initialLeads);
  const [pendingId, setPendingId] = React.useState<string | null>(null);
  const [statusError, setStatusError] = React.useState<string | null>(null);

  const setParam = (key: string, value: string) => {
    const next = new URLSearchParams(params.toString());
    if (value) next.set(key, value);
    else next.delete(key);
    router.replace(`${pathname}?${next.toString()}`);
  };

  const changeStatus = async (lead: Lead, status: LeadStatus) => {
    if (status === lead.status) return;
    setPendingId(lead.id);
    setStatusError(null);
    try {
      const updated = await rexerApi.leads.updateStatus(lead.id, status);
      setLeads(rows => rows.map(r => (r.id === lead.id ? updated : r)));
    } catch (err) {
      // Nói rõ CÁI GÌ trượt, kèm tên người — bảng có nhiều dòng, một câu "lưu
      // không được" không cho biết dòng nào vẫn đang sai.
      setStatusError(
        `${lead.name || lead.contact}: ${
          err instanceof Error ? err.message : t('statusFailed')
        }`
      );
    } finally {
      setPendingId(null);
    }
  };

  const selected = experiences.find(e => e.id === filters.pageId) ?? null;

  return (
    <div className='flex min-h-0 flex-col gap-4 p-5'>
      <header className='flex flex-col gap-1'>
        <h1 className='text-[19px] font-bold text-[var(--pv2-ink)]'>
          {t('title')}
        </h1>
        <p className='text-[12.5px] text-[var(--pv2-mut)]'>{t('subtitle')}</p>
      </header>

      {needsBrand ? (
        <p className='rounded-[var(--pv2-r)] border border-[var(--pv2-hair)] bg-[var(--pv2-canvas)] px-4 py-3 text-[12.5px] text-[var(--pv2-mut)]'>
          {t('needsBrand')}
        </p>
      ) : null}

      <div className='flex flex-wrap items-end gap-3'>
        <label className='flex flex-col gap-1'>
          <span className='text-[10.5px] font-bold tracking-[0.05em] text-[var(--pv2-mut)] uppercase'>
            {t('pagePicker')}
          </span>
          <select
            value={filters.pageId ?? ''}
            onChange={e => setParam(LEADS_PAGE_PARAM, e.target.value)}
            className='h-9 min-w-64 rounded-[var(--pv2-r-sm)] border border-[var(--pv2-hair)] bg-[var(--pv2-paper)] px-2.5 text-[12.5px] text-[var(--pv2-ink)]'
          >
            <option value=''>{t('pagePickerEmpty')}</option>
            {experiences.map(exp => (
              <option key={exp.id} value={exp.id}>
                {exp.name}
              </option>
            ))}
          </select>
        </label>

        <FilterSelect
          label={t('filterRange')}
          value={filters.range}
          onChange={v => setParam(LEADS_RANGE_PARAM, v)}
          options={[
            { value: '7d', label: t('range7d') },
            { value: '30d', label: t('range30d') },
            { value: '90d', label: t('range90d') },
          ]}
        />
        <FilterSelect
          label={t('filterStatus')}
          value={filters.status ?? ''}
          onChange={v => setParam(LEADS_STATUS_PARAM, v)}
          options={[
            { value: '', label: t('any') },
            ...STATUSES.map(s => ({ value: s, label: t(`status_${s}`) })),
          ]}
        />
        <FilterSelect
          label={t('filterTier')}
          value={filters.tier ?? ''}
          onChange={v => setParam(LEADS_TIER_PARAM, v)}
          options={[
            { value: '', label: t('any') },
            { value: 'hot', label: t('tier_hot') },
            { value: 'warm', label: t('tier_warm') },
            { value: 'cold', label: t('tier_cold') },
          ]}
        />

        {selected?.slug ? (
          <Button variant='ghost' size='sm' asChild>
            <a
              href={`/p/${selected.slug}`}
              target='_blank'
              rel='noopener noreferrer'
            >
              <ExternalLink className='size-3.5' />
              {t('openPage')}
            </a>
          </Button>
        ) : null}
      </div>

      {error ? (
        <p className='rounded-[var(--pv2-r)] border border-[var(--pv2-hair)] bg-[var(--pv2-canvas)] px-4 py-3 text-[12.5px] text-[var(--pv2-error)]'>
          {error}
        </p>
      ) : null}
      {statusError ? (
        <p className='text-[12.5px] text-[var(--pv2-error)]'>{statusError}</p>
      ) : null}

      {!filters.pageId ? (
        <EmptyBox text={t('pickPageFirst')} />
      ) : leads.length === 0 ? (
        // Rỗng ở đây có HAI nghĩa rất khác nhau và người dùng cần biết là nghĩa
        // nào: trang chưa ai điền, hay trang chưa có form nào gửi được về.
        <EmptyBox text={t('noLeads')} hint={t('noLeadsHint')} />
      ) : (
        <div className='overflow-x-auto rounded-[var(--pv2-r)] border border-[var(--pv2-hair)]'>
          <table className='w-full border-collapse'>
            <thead>
              <tr>
                <th className={headClass}>{t('colContact')}</th>
                <th className={headClass}>{t('colTier')}</th>
                <th className={headClass}>{t('colSource')}</th>
                <th className={headClass}>{t('colDetails')}</th>
                <th className={headClass}>{t('colWhen')}</th>
                <th className={headClass}>{t('colStatus')}</th>
              </tr>
            </thead>
            <tbody>
              {leads.map(lead => {
                const extras = extraFormFields(lead);
                return (
                  <tr key={lead.id} className='hover:bg-[var(--pv2-canvas)]'>
                    <td className={cellClass}>
                      <div className='font-semibold text-[var(--pv2-ink)]'>
                        {lead.name || t('noName')}
                      </div>
                      <a
                        href={contactHref(lead.contact)}
                        className='inline-flex items-center gap-1 text-[var(--pv2-electric)] hover:underline'
                      >
                        {isEmail(lead.contact) ? null : (
                          <Phone className='size-3' />
                        )}
                        {lead.contact}
                      </a>
                    </td>
                    <td className={cellClass}>
                      <span
                        className={cn(
                          'inline-flex rounded-full px-2 py-0.5 text-[11px] font-semibold',
                          TIER_CLASS[lead.tier] ?? TIER_CLASS.cold
                        )}
                        title={t('scoreTitle', { score: lead.score })}
                      >
                        {t(`tier_${lead.tier}`)} · {lead.score}
                      </span>
                    </td>
                    <td className={cn(cellClass, 'text-[var(--pv2-mut)]')}>
                      {lead.utm_source || t('sourceDirect')}
                      {lead.utm_campaign ? (
                        <div className='text-[11px] text-[var(--pv2-faint)]'>
                          {lead.utm_campaign}
                        </div>
                      ) : null}
                    </td>
                    <td className={cn(cellClass, 'max-w-80')}>
                      {extras.length === 0 ? (
                        <span className='text-[var(--pv2-faint)]'>—</span>
                      ) : (
                        <dl className='flex flex-col gap-0.5'>
                          {extras.map(f => (
                            <div key={f.key} className='flex gap-1.5'>
                              <dt className='shrink-0 text-[11px] text-[var(--pv2-faint)]'>
                                {f.key}
                              </dt>
                              <dd className='min-w-0 break-words text-[var(--pv2-ink)]'>
                                {f.value}
                              </dd>
                            </div>
                          ))}
                        </dl>
                      )}
                    </td>
                    <td
                      className={cn(
                        cellClass,
                        'whitespace-nowrap text-[var(--pv2-mut)]'
                      )}
                    >
                      {formatWhen(lead.created_at)}
                    </td>
                    <td className={cellClass}>
                      <div className='flex items-center gap-1.5'>
                        <select
                          value={lead.status}
                          disabled={pendingId === lead.id}
                          onChange={e =>
                            changeStatus(lead, e.target.value as LeadStatus)
                          }
                          className={cn(
                            'h-7 rounded-full border-0 px-2 text-[11px] font-semibold',
                            STATUS_CLASS[lead.status]
                          )}
                        >
                          {STATUSES.map(s => (
                            <option key={s} value={s}>
                              {t(`status_${s}`)}
                            </option>
                          ))}
                        </select>
                        {pendingId === lead.id ? (
                          <Loader2 className='size-3.5 animate-spin text-[var(--pv2-mut)]' />
                        ) : null}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {filters.pageId && leads.length > 0 ? (
        <p className='text-[11px] text-[var(--pv2-faint)]'>
          {t('countLabel', { shown: leads.length, total })}
        </p>
      ) : null}
    </div>
  );
}

function FilterSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <label className='flex flex-col gap-1'>
      <span className='text-[10.5px] font-bold tracking-[0.05em] text-[var(--pv2-mut)] uppercase'>
        {label}
      </span>
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        className='h-9 rounded-[var(--pv2-r-sm)] border border-[var(--pv2-hair)] bg-[var(--pv2-paper)] px-2.5 text-[12.5px] text-[var(--pv2-ink)]'
      >
        {options.map(o => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function EmptyBox({ text, hint }: { text: string; hint?: string }) {
  return (
    <div className='flex flex-col items-center gap-1 rounded-[var(--pv2-r)] border border-dashed border-[var(--pv2-hair)] px-6 py-14 text-center'>
      <p className='text-[13px] font-semibold text-[var(--pv2-ink)]'>{text}</p>
      {hint ? (
        <p className='max-w-100 text-[12px] text-[var(--pv2-mut)]'>{hint}</p>
      ) : null}
    </div>
  );
}
