'use client';

/**
 * Panel "Phễu & Lead" cho trang analytics của 1 landing
 * (`/portal/landing-pages/[id]/analytics`) — spec
 * docs/plan-analytics-v2-leads-funnel-2026-06-12.md, style mockup 2026-06-12.
 *
 * Phễu render chung cho cả 2 tab; quyền sở hữu thể hiện bằng màu bar
 * (indigo = Marketing, cam = bàn giao, mint = Sales) + tag góc phải.
 * Demo data seeded theo (pageId, range) — GĐ3-wire thay bằng /v1/analytics/*.
 */

import { useMemo, useState } from 'react';

import { Badge } from '@/components/atoms/badge';
import { Button } from '@/components/atoms/button';
import { cn } from '@/lib/cn';

import { Card } from './dashboard-bits';
import { FunnelSteps } from './FunnelSteps';
import { MarketingView } from './MarketingView';
import { SalesView } from './SalesView';
import { buildDemoAnalytics, type DateRange } from './funnel-demo';

type ViewTab = 'marketing' | 'sales';

const RANGES: { value: DateRange; label: string }[] = [
  { value: '7d', label: '7 ngày' },
  { value: '30d', label: '30 ngày' },
  { value: '90d', label: '90 ngày' },
];

export function FunnelOverview({ pageId }: { pageId: string }) {
  const [range, setRange] = useState<DateRange>('30d');
  const [tab, setTab] = useState<ViewTab>('marketing');
  const data = useMemo(
    () => buildDemoAnalytics(pageId, range),
    [pageId, range]
  );

  return (
    <div className='flex flex-col gap-4'>
      <div className='flex flex-wrap items-center justify-between gap-3'>
        <div className='flex items-center gap-2'>
          <PillGroup
            options={[
              { value: 'marketing', label: 'Marketing' },
              { value: 'sales', label: 'Sales' },
            ]}
            value={tab}
            onChange={v => setTab(v as ViewTab)}
          />
          <Badge variant='outline' className='text-2xs'>
            demo data
          </Badge>
        </div>
        <PillGroup
          options={RANGES.map(r => ({ value: r.value, label: r.label }))}
          value={range}
          onChange={v => setRange(v as DateRange)}
        />
      </div>

      {tab === 'marketing' ? (
        <MarketingView data={data} range={range} />
      ) : (
        <SalesView data={data} />
      )}

      <Card
        title='Phễu chung — điểm bàn giao Marketing → Sales'
        tag={
          tab === 'marketing' ? 'bạn sở hữu nửa trên' : 'bạn sở hữu nửa dưới'
        }
      >
        <FunnelSteps counts={data.funnel} />
      </Card>
    </div>
  );
}

/** Nhóm nút pill (range / tab). */
function PillGroup({
  options,
  value,
  onChange,
}: {
  options: { value: string; label: string }[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className='border-border bg-muted flex rounded-lg border p-0.5'>
      {options.map(o => (
        <Button
          key={o.value}
          variant='ghost'
          size='sm'
          onClick={() => onChange(o.value)}
          className={cn(
            'h-7 rounded-md px-2.5 text-xs',
            value === o.value && 'bg-background text-foreground shadow-sm'
          )}
        >
          {o.label}
        </Button>
      ))}
    </div>
  );
}
