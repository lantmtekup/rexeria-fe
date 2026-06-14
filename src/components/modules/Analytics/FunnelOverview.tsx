'use client';

/**
 * Panel "Phễu & Lead" cho trang analytics của 1 landing
 * (`/portal/landing-pages/[id]/analytics`) — spec
 * docs/plan-analytics-v2-leads-funnel-2026-06-12.md, style mockup 2026-06-12.
 *
 * Phễu render chung cho cả 2 tab; quyền sở hữu thể hiện bằng màu bar
 * (indigo = Marketing, cam = bàn giao, mint = Sales) + tag góc phải.
 * Số thật từ /v1/analytics/* + /v1/leads (be-spec-analytics-funnel-leads).
 */

import { useState } from 'react';

import { Button } from '@/components/atoms/button';
import { cn } from '@/lib/cn';

import { Card } from './dashboard-bits';
import { FunnelSteps } from './FunnelSteps';
import { MarketingView } from './MarketingView';
import { SalesView } from './SalesView';
import { useFunnelAnalytics } from './funnel-data';
import type { DateRange } from './funnel-types';

type ViewTab = 'marketing' | 'sales';

const RANGES: { value: DateRange; label: string }[] = [
  { value: '7d', label: '7 ngày' },
  { value: '30d', label: '30 ngày' },
  { value: '90d', label: '90 ngày' },
];

export function FunnelOverview({ pageId }: { pageId: string }) {
  const [range, setRange] = useState<DateRange>('30d');
  const [tab, setTab] = useState<ViewTab>('marketing');
  // useFunnelAnalytics degrade từng call (funnel lỗi → số 0), nên không có
  // trạng thái "màn lỗi" — thiếu data chỉ render layout với số 0, đồng nhất
  // graceful-empty với BlockAnalyticsGrid + tab Tổng quan.
  const { data, loading } = useFunnelAnalytics(pageId, range);

  return (
    <div className='flex flex-col gap-4'>
      <div className='flex flex-wrap items-center justify-between gap-3'>
        <PillGroup
          options={[
            { value: 'marketing', label: 'Marketing' },
            { value: 'sales', label: 'Sales' },
          ]}
          value={tab}
          onChange={v => setTab(v as ViewTab)}
        />
        <PillGroup
          options={RANGES.map(r => ({ value: r.value, label: r.label }))}
          value={range}
          onChange={v => setRange(v as DateRange)}
        />
      </div>

      {loading || !data ? (
        <FunnelSkeleton />
      ) : (
        <>
          {tab === 'marketing' ? (
            <MarketingView data={data} range={range} />
          ) : (
            <SalesView
              pageId={pageId}
              range={range}
              funnel={data.funnel}
              sqlThreshold={data.sqlThreshold}
            />
          )}

          <Card
            title='Phễu chung — điểm bàn giao Marketing → Sales'
            tag={
              tab === 'marketing'
                ? 'bạn sở hữu nửa trên'
                : 'bạn sở hữu nửa dưới'
            }
          >
            <FunnelSteps counts={data.funnel} />
          </Card>
        </>
      )}
    </div>
  );
}

/** Khung chờ trong lúc fetch — giữ layout khỏi nhảy. */
function FunnelSkeleton() {
  return (
    <div className='flex flex-col gap-4'>
      <div className='grid grid-cols-2 gap-4 xl:grid-cols-4'>
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className='bg-muted h-24 animate-pulse rounded-xl' />
        ))}
      </div>
      <div className='bg-muted h-64 animate-pulse rounded-xl' />
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
