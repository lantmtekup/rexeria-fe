'use client';

/**
 * View Sales (spec §5) — nửa dưới phễu: ưu tiên & chốt lead. Bảng sort
 * score desc (danh sách ưu tiên), đổi status tại chỗ (demo: state cục bộ;
 * GĐ3-wire sẽ PATCH /v1/leads/{id} + bắn lead_status_change).
 */

import { BadgeCheck, DollarSign, Percent, Users } from 'lucide-react';
import { useMemo, useState } from 'react';

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

import { Card, MetricTile } from './dashboard-bits';

import type { DemoAnalytics, DemoLead, LeadStatus } from './funnel-demo';
import { SQL_THRESHOLD } from './funnel-demo';

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
const TIER_CLASS = {
  hot: 'bg-red-100 text-red-700',
  warm: 'bg-amber-100 text-amber-700',
  cold: 'bg-sky-100 text-sky-700',
} as const;
const TIER_LABEL = { hot: 'Hot', warm: 'Warm', cold: 'Cold' } as const;
const METHOD_LABEL = {
  form: 'Form',
  wallet: 'Ví',
  whitelist: 'Whitelist',
} as const;

const fmt = (n: number) => n.toLocaleString('vi-VN');
const usd = (n: number) => `$${n.toLocaleString('en-US')}`;

export function SalesView({ data }: { data: DemoAnalytics }) {
  // Demo: status đổi tại chỗ, giữ trong state để thấy pipeline nhảy theo.
  const [overrides, setOverrides] = useState<Record<string, LeadStatus>>({});
  const leads = useMemo(
    () =>
      data.leads
        .map(l => ({ ...l, status: overrides[l.id] ?? l.status }))
        .sort((a, b) => b.score - a.score),
    [data.leads, overrides]
  );

  const open = leads.filter(l => l.status !== 'won' && l.status !== 'lost');
  const sqlCount = leads.filter(l => l.score >= SQL_THRESHOLD).length;
  const won = leads.filter(l => l.status === 'won');
  const byStatus = STATUS_ORDER.map(s => ({
    status: s,
    count: leads.filter(l => l.status === s).length,
  }));

  const handleStatusChange = (id: string, status: LeadStatus) =>
    setOverrides(prev => ({ ...prev, [id]: status }));

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
          value={fmt(sqlCount)}
          hint={`score ≥ ${SQL_THRESHOLD}`}
        />
        <MetricTile
          icon={Percent}
          label='Tỷ lệ chốt'
          value={
            leads.length > 0
              ? `${((won.length / leads.length) * 100).toFixed(1)}%`
              : '—'
          }
          hint='deals / leads'
        />
        <MetricTile
          icon={DollarSign}
          label='Doanh thu chốt'
          value={usd(won.reduce((s, l) => s + (l.dealValue ?? 0), 0))}
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

      <LeadTable leads={leads} onStatusChange={handleStatusChange} />
    </div>
  );
}

function LeadTable({
  leads,
  onStatusChange,
}: {
  leads: DemoLead[];
  onStatusChange: (id: string, status: LeadStatus) => void;
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
          {leads.map(lead => (
            <TableRow key={lead.id}>
              <TableCell>
                <p className='text-foreground font-medium'>{lead.name}</p>
                <p className='text-content-muted text-xs'>{lead.contact}</p>
              </TableCell>
              <TableCell>
                <p className='text-sm'>{METHOD_LABEL[lead.method]}</p>
                <p className='text-content-muted text-xs'>{lead.source}</p>
              </TableCell>
              <TableCell
                className={cn(
                  'text-right font-semibold tabular-nums',
                  lead.score >= SQL_THRESHOLD
                    ? 'text-foreground'
                    : 'text-content-muted'
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
                  onChange={e =>
                    onStatusChange(lead.id, e.target.value as LeadStatus)
                  }
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
                {lead.dealValue != null ? usd(lead.dealValue) : '—'}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  );
}
