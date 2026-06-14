'use client';

/**
 * View Sales (spec §5) — nửa dưới phễu: ưu tiên & chốt lead. Bảng sort score
 * desc (danh sách ưu tiên), đổi status tại chỗ qua PATCH /v1/leads/{id} và
 * chốt deal qua POST /v1/leads/{id}/deal. SQL/Doanh thu lấy số tổng từ funnel
 * (authoritative); bảng chỉ tải top-200 lead theo score.
 */

import { BadgeCheck, DollarSign, Percent, Users } from 'lucide-react';
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

import { Card, MetricTile } from './dashboard-bits';
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

const fmt = (n: number) => n.toLocaleString('vi-VN');
const usd = (n: number) => `$${n.toLocaleString('en-US')}`;

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

  return (
    <div className='flex flex-col gap-6'>
      <div className='grid grid-cols-2 gap-4 xl:grid-cols-4'>
        <MetricTile
          icon={Users}
          label='Lead cần xử lý'
          value={fmt(open.length)}
          hint='status ≠ chốt/mất'
        />
        <MetricTile
          icon={BadgeCheck}
          label='SQL (đạt chuẩn)'
          value={fmt(funnel.sql)}
          hint={`score ≥ ${sqlThreshold}`}
        />
        <MetricTile
          icon={Percent}
          label='Tỷ lệ chốt'
          value={
            funnel.leads > 0
              ? `${((funnel.deals / funnel.leads) * 100).toFixed(1)}%`
              : '—'
          }
          hint='deals / leads'
        />
        <MetricTile
          icon={DollarSign}
          label='Doanh thu chốt'
          value={usd(revenue)}
          hint='sum(deal_won.value)'
          hintTone='positive'
        />
      </div>

      <div className='flex flex-wrap gap-2'>
        {byStatus.map(({ status, count }) => (
          <span
            key={status}
            className='border-border bg-card text-foreground inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs'
          >
            {STATUS_LABEL[status]}
            <span className='text-content-muted font-semibold tabular-nums'>
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
        <p className='text-foreground font-medium'>
          {lead.name ?? '(chưa có tên)'}
        </p>
        <p className='text-content-muted text-xs'>{lead.contact}</p>
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
