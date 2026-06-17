'use client';

/**
 * View Sales (spec §5) — nửa dưới phễu: ưu tiên & chốt lead. Bảng sort score
 * desc (danh sách ưu tiên), đổi status tại chỗ qua PATCH /v1/leads/{id} và
 * chốt deal qua POST /v1/leads/{id}/deal. SQL/Doanh thu lấy số tổng từ funnel
 * (authoritative); bảng chỉ tải top-200 lead theo score.
 */

import {
  BadgeCheck,
  DollarSign,
  type LucideIcon,
  Percent,
  Users,
} from 'lucide-react';
import { toast } from 'sonner';

import { Badge } from '@/components/atoms/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/atoms/table';
import { cn } from '@/lib/cn';
import { rexerApi } from '@/services/rexer/endpoints';
import { RxApiError } from '@/services/rexer/client';
import type { Lead, LeadStatus, LeadTier } from '@/services/rexer/types';

import { Card } from './dashboard-bits';
import { useLeads } from './funnel-data';
import type { DateRange, FunnelCounts } from './funnel-types';

const STATUS_LABEL: Record<LeadStatus, string> = {
  new: 'Mới',
  contacted: 'Đã liên hệ',
  negotiating: 'Đàm phán',
  won: 'Chốt',
  lost: 'Mất',
};
const STATUS_ORDER: LeadStatus[] = [
  'new',
  'contacted',
  'negotiating',
  'won',
  'lost',
];
const TIER_CLASS: Record<LeadTier, string> = {
  hot: 'bg-red-100 text-red-700',
  warm: 'bg-amber-100 text-amber-700',
  cold: 'bg-sky-100 text-sky-700',
};
const TIER_LABEL: Record<LeadTier, string> = {
  hot: 'Hot',
  warm: 'Warm',
  cold: 'Cold',
};
const METHOD_LABEL: Record<Lead['method'], string> = {
  form: 'Form',
  wallet: 'Ví',
  whitelist: 'Whitelist',
};

// Form ngoài là schemaless (mỗi landing tự định nghĩa field), nên bảng render
// động theo `form_data`. `name` lên tiêu đề; email/phone ưu tiên; còn lại giữ
// nguyên thứ tự. Nhãn quen thuộc có map tiếng Việt, field lạ fallback chính key.
const FIELD_LABEL: Record<string, string> = {
  email: 'Email',
  phone: 'SĐT',
  message: 'Lời nhắn',
  company: 'Công ty',
  budget: 'Ngân sách',
  note: 'Ghi chú',
};
const fieldRank = (k: string) => ({ email: 0, phone: 1 })[k.toLowerCase()] ?? 2;
const fieldLabel = (k: string) =>
  FIELD_LABEL[k.toLowerCase()] ?? k.replace(/[_-]+/g, ' ');
const fieldValue = (v: unknown) =>
  typeof v === 'string' ? v : v == null ? '' : String(v);

/** Tên hiển thị: ưu tiên form_data.name, rồi cột name derived, cuối là rỗng. */
function leadName(lead: Lead): string {
  const fromForm = lead.form_data?.name;
  if (typeof fromForm === 'string' && fromForm.trim()) return fromForm.trim();
  return lead.name?.trim() || '(chưa có tên)';
}

/**
 * Render các field động dưới tên lead. Lead qua form ngoài có `form_data` →
 * liệt kê mọi field (trừ `name` đã làm tiêu đề). Lead cũ (GA-style) không có
 * form_data → fallback hiển thị `contact` như trước để không vỡ dữ liệu cũ.
 */
function LeadFields({ lead }: { lead: Lead }) {
  const fd = lead.form_data;
  const entries = fd
    ? Object.entries(fd).filter(
        ([k, v]) => k.toLowerCase() !== 'name' && fieldValue(v).trim() !== ''
      )
    : [];

  if (entries.length === 0) {
    return <p className='text-content-muted text-xs'>{lead.contact}</p>;
  }

  entries.sort(([a], [b]) => fieldRank(a) - fieldRank(b));
  return (
    <div className='mt-0.5 space-y-0.5'>
      {entries.map(([k, v]) => (
        <p key={k} className='text-content-muted line-clamp-2 text-xs'>
          <span className='text-2xs mr-1 font-semibold tracking-wider uppercase opacity-60'>
            {fieldLabel(k)}
          </span>
          {fieldValue(v)}
        </p>
      ))}
    </div>
  );
}

const fmt = (n: number) => n.toLocaleString('vi-VN');
const usd = (n: number) => `$${n.toLocaleString('en-US')}`;

/** Accent màu cho từng KPI card (icon-chip + thanh accent trên). */
type Accent = 'indigo' | 'violet' | 'emerald' | 'amber';
const ACCENT: Record<Accent, { chip: string; icon: string; bar: string }> = {
  indigo: {
    chip: 'bg-indigo-50',
    icon: 'text-indigo-600',
    bar: 'bg-indigo-500',
  },
  violet: {
    chip: 'bg-violet-50',
    icon: 'text-violet-600',
    bar: 'bg-violet-500',
  },
  emerald: {
    chip: 'bg-emerald-50',
    icon: 'text-emerald-600',
    bar: 'bg-emerald-500',
  },
  amber: { chip: 'bg-amber-50', icon: 'text-amber-600', bar: 'bg-amber-500' },
};

/** Chấm màu theo pipeline status. */
const STATUS_DOT: Record<LeadStatus, string> = {
  new: 'bg-blue-500',
  contacted: 'bg-indigo-500',
  negotiating: 'bg-amber-500',
  won: 'bg-emerald-500',
  lost: 'bg-rose-400',
};

export function SalesView({
  pageId,
  range,
  funnel,
  sqlThreshold,
}: {
  pageId: string;
  range: DateRange;
  funnel: FunnelCounts;
  sqlThreshold: number;
}) {
  const { leads, loading, error, setLeads } = useLeads(pageId, range);

  // Doanh thu chốt tính trên tập đã tải (top-200); deals tổng lấy từ funnel.
  const won = leads.filter(l => l.status === 'won');
  const open = leads.filter(l => l.status !== 'won' && l.status !== 'lost');
  const revenue = won.reduce((s, l) => s + (l.deal?.value ?? 0), 0);
  const byStatus = STATUS_ORDER.map(s => ({
    status: s,
    count: leads.filter(l => l.status === s).length,
  }));

  // Cập nhật lạc quan: sửa state ngay, rollback nếu API lỗi.
  const handleStatusChange = async (id: string, status: LeadStatus) => {
    const prev = leads;
    setLeads(ls => ls.map(l => (l.id === id ? { ...l, status } : l)));
    try {
      const updated = await rexerApi.leads.updateStatus(id, status);
      setLeads(ls => ls.map(l => (l.id === id ? updated : l)));
    } catch (e) {
      setLeads(prev);
      toast.error(
        e instanceof RxApiError ? e.message : 'Không cập nhật được trạng thái'
      );
    }
  };

  const handleCreateDeal = async (id: string, value: number) => {
    try {
      const updated = await rexerApi.leads.createDeal(id, { value });
      setLeads(ls => ls.map(l => (l.id === id ? updated : l)));
      toast.success('Đã ghi nhận deal chốt');
    } catch (e) {
      toast.error(e instanceof RxApiError ? e.message : 'Không tạo được deal');
    }
  };

  const closeRate =
    funnel.leads > 0
      ? `${((funnel.deals / funnel.leads) * 100).toFixed(1)}%`
      : '—';

  return (
    <div className='flex flex-col gap-6'>
      <div className='grid grid-cols-2 gap-3 xl:grid-cols-4'>
        <SalesKpiCard
          icon={Users}
          accent='indigo'
          label='Lead cần xử lý'
          value={fmt(open.length)}
          hint='status ≠ chốt/mất'
        />
        <SalesKpiCard
          icon={BadgeCheck}
          accent='violet'
          label='SQL (đạt chuẩn)'
          value={fmt(funnel.sql)}
          hint={`score ≥ ${sqlThreshold}`}
        />
        <SalesKpiCard
          icon={Percent}
          accent='amber'
          label='Tỷ lệ chốt'
          value={closeRate}
          hint='deals / leads'
        />
        <SalesKpiCard
          icon={DollarSign}
          accent='emerald'
          label='Doanh thu chốt'
          value={usd(revenue)}
          hint='Σ deal đã chốt'
          positive={revenue > 0}
        />
      </div>

      <div className='flex flex-wrap items-center gap-2'>
        <span className='text-content-muted text-2xs font-semibold tracking-wider uppercase'>
          Pipeline
        </span>
        {byStatus.map(({ status, count }) => (
          <span
            key={status}
            className='border-border bg-card inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium shadow-sm'
          >
            <span className={cn('size-2 rounded-full', STATUS_DOT[status])} />
            <span className='text-foreground'>{STATUS_LABEL[status]}</span>
            <span
              className={cn(
                'text-2xs rounded-full px-1.5 font-bold tabular-nums',
                count > 0 ? 'bg-muted text-foreground' : 'text-muted-foreground'
              )}
            >
              {count}
            </span>
          </span>
        ))}
      </div>

      {error ? (
        <Card title='Danh sách ưu tiên'>
          <p className='text-content-muted text-sm'>{error}</p>
        </Card>
      ) : (
        <LeadTable
          leads={leads}
          loading={loading}
          sqlThreshold={sqlThreshold}
          onStatusChange={handleStatusChange}
          onCreateDeal={handleCreateDeal}
        />
      )}
    </div>
  );
}

/** KPI card premium: icon-chip màu, số to, thanh accent trên, hover lift. */
function SalesKpiCard({
  icon: Icon,
  accent,
  label,
  value,
  hint,
  positive,
}: {
  icon: LucideIcon;
  accent: Accent;
  label: string;
  value: string;
  hint?: string;
  positive?: boolean;
}) {
  const a = ACCENT[accent];
  return (
    <div className='group border-border bg-card relative overflow-hidden rounded-2xl border p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md'>
      <span className={cn('absolute inset-x-0 top-0 h-1', a.bar)} />
      <div className='flex items-center gap-2.5'>
        <span
          className={cn(
            'flex size-9 items-center justify-center rounded-xl',
            a.chip
          )}
        >
          <Icon className={cn('size-4', a.icon)} />
        </span>
        <span className='text-content-muted text-sm font-medium'>{label}</span>
      </div>
      <p
        className={cn(
          'mt-3 text-4xl font-bold tracking-[-0.02em]',
          positive ? 'text-emerald-600' : 'text-foreground'
        )}
      >
        {value}
      </p>
      {hint && (
        <p className='text-muted-foreground mt-1.5 font-mono text-xs'>{hint}</p>
      )}
    </div>
  );
}

function LeadTable({
  leads,
  loading,
  sqlThreshold,
  onStatusChange,
  onCreateDeal,
}: {
  leads: Lead[];
  loading: boolean;
  sqlThreshold: number;
  onStatusChange: (id: string, status: LeadStatus) => void;
  onCreateDeal: (id: string, value: number) => void;
}) {
  return (
    <Card title='Danh sách ưu tiên' tag='sort score giảm dần'>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Lead</TableHead>
            <TableHead>Kênh vào</TableHead>
            <TableHead className='text-right'>Score</TableHead>
            <TableHead>Tier</TableHead>
            <TableHead>Trạng thái</TableHead>
            <TableHead className='text-right'>Deal</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading && leads.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={6}
                className='text-content-muted py-8 text-center'
              >
                Đang tải lead…
              </TableCell>
            </TableRow>
          ) : leads.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={6}
                className='text-content-muted py-8 text-center'
              >
                Chưa có lead nào trong khoảng thời gian này.
              </TableCell>
            </TableRow>
          ) : (
            leads.map(lead => (
              <LeadRow
                key={lead.id}
                lead={lead}
                sqlThreshold={sqlThreshold}
                onStatusChange={onStatusChange}
                onCreateDeal={onCreateDeal}
              />
            ))
          )}
        </TableBody>
      </Table>
    </Card>
  );
}

function LeadRow({
  lead,
  sqlThreshold,
  onStatusChange,
  onCreateDeal,
}: {
  lead: Lead;
  sqlThreshold: number;
  onStatusChange: (id: string, status: LeadStatus) => void;
  onCreateDeal: (id: string, value: number) => void;
}) {
  const handleDeal = () => {
    const raw = window.prompt('Giá trị deal (USD):');
    if (raw == null) return;
    const value = Number(raw);
    if (!Number.isFinite(value) || value <= 0) {
      toast.error('Giá trị deal phải là số > 0');
      return;
    }
    onCreateDeal(lead.id, value);
  };

  return (
    <TableRow>
      <TableCell>
        <p className='text-foreground font-medium'>{leadName(lead)}</p>
        <LeadFields lead={lead} />
      </TableCell>
      <TableCell>
        <p className='text-sm'>{METHOD_LABEL[lead.method]}</p>
        <p className='text-content-muted text-xs'>
          {lead.utm_source ?? 'direct'}
        </p>
      </TableCell>
      <TableCell
        className={cn(
          'text-right font-semibold tabular-nums',
          lead.score >= sqlThreshold ? 'text-foreground' : 'text-content-muted'
        )}
      >
        {lead.score}
      </TableCell>
      <TableCell>
        <Badge variant='secondary' className={TIER_CLASS[lead.tier]}>
          {TIER_LABEL[lead.tier]}
        </Badge>
      </TableCell>
      <TableCell>
        <select
          value={lead.status}
          onChange={e => onStatusChange(lead.id, e.target.value as LeadStatus)}
          className='border-border bg-background text-foreground rounded-md border px-2 py-1 text-xs'
        >
          {STATUS_ORDER.map(s => (
            <option key={s} value={s}>
              {STATUS_LABEL[s]}
            </option>
          ))}
        </select>
      </TableCell>
      <TableCell className='text-right text-sm tabular-nums'>
        {lead.deal ? (
          usd(lead.deal.value)
        ) : (
          <button
            type='button'
            onClick={handleDeal}
            className='text-content-muted hover:text-foreground text-xs underline-offset-2 hover:underline'
          >
            + Ghi deal
          </button>
        )}
      </TableCell>
    </TableRow>
  );
}
