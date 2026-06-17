'use client';

import { CalendarDays } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/atoms/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/atoms/dialog';
import { Input } from '@/components/atoms/input';
import { Label } from '@/components/atoms/label';
import { cn } from '@/lib/cn';

export interface MetricValues {
  impressions: number;
  reach: number;
  clicks: number;
  spend: number;
  conversions: number;
}

export interface DailyMetric extends MetricValues {
  date: string; // YYYY-MM-DD
}

export interface MetricsUpdate {
  from: string;
  to: string;
  mode: 'range' | 'daily';
  total: MetricValues;
  daily: DailyMetric[];
}

const EMPTY: MetricValues = {
  impressions: 0,
  reach: 0,
  clicks: 0,
  spend: 0,
  conversions: 0,
};

const FIELDS: { key: keyof MetricValues; label: string; money?: boolean }[] = [
  { key: 'impressions', label: 'Impressions' },
  { key: 'reach', label: 'Reach' },
  { key: 'clicks', label: 'Clicks' },
  { key: 'spend', label: 'Spend (₫)', money: true },
  { key: 'conversions', label: 'Conversions' },
];

function daysBetween(from: string, to: string): string[] {
  if (!from || !to) return [];
  const out: string[] = [];
  const d = new Date(from);
  const end = new Date(to);
  if (isNaN(d.getTime()) || isNaN(end.getTime()) || d > end) return [];
  // cap 92 ngày để form không quá dài
  for (let i = 0; i < 92 && d <= end; i++) {
    out.push(d.toISOString().slice(0, 10));
    d.setDate(d.getDate() + 1);
  }
  return out;
}

export function UpdateMetricsDialog({
  open,
  campaignName,
  initial,
  onOpenChange,
  onSave,
}: {
  open: boolean;
  campaignName: string;
  initial?: { from?: string; to?: string };
  onOpenChange: (open: boolean) => void;
  onSave: (update: MetricsUpdate) => void;
}) {
  const [mode, setMode] = useState<'range' | 'daily'>('range');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [rangeTotal, setRangeTotal] = useState<MetricValues>(EMPTY);
  const [dailyMap, setDailyMap] = useState<Record<string, MetricValues>>({});

  useEffect(() => {
    if (!open) return;
    setMode('range');
    setFrom(initial?.from ?? '');
    setTo(initial?.to ?? '');
    setRangeTotal(EMPTY);
    setDailyMap({});
  }, [open, initial?.from, initial?.to]);

  const days = useMemo(() => daysBetween(from, to), [from, to]);

  const setRangeField = (k: keyof MetricValues, v: string) =>
    setRangeTotal(p => ({ ...p, [k]: Number(v.replace(/[^\d]/g, '')) || 0 }));

  const setDailyField = (date: string, k: keyof MetricValues, v: string) =>
    setDailyMap(p => ({
      ...p,
      [date]: {
        ...EMPTY,
        ...p[date],
        [k]: Number(v.replace(/[^\d]/g, '')) || 0,
      },
    }));

  const submit = () => {
    if (!from || !to) {
      toast.error('Chọn khoảng ngày');
      return;
    }
    if (days.length === 0) {
      toast.error('Khoảng ngày không hợp lệ (từ ≤ đến, tối đa 92 ngày)');
      return;
    }
    let total: MetricValues;
    let daily: DailyMetric[];

    if (mode === 'range') {
      total = rangeTotal;
      // chia đều theo ngày để vẽ trend (BE sẽ chia chuẩn hơn).
      const n = days.length;
      daily = days.map((date, i) => ({
        date,
        impressions: Math.round(total.impressions / n),
        reach: Math.round(total.reach / n),
        clicks: Math.round(total.clicks / n),
        spend: Math.round(total.spend / n),
        conversions:
          i === n - 1
            ? total.conversions - Math.round(total.conversions / n) * (n - 1)
            : Math.round(total.conversions / n),
      }));
    } else {
      daily = days.map(date => ({ date, ...EMPTY, ...dailyMap[date] }));
      total = daily.reduce(
        (a, d) => ({
          impressions: a.impressions + d.impressions,
          reach: a.reach + d.reach,
          clicks: a.clicks + d.clicks,
          spend: a.spend + d.spend,
          conversions: a.conversions + d.conversions,
        }),
        { ...EMPTY }
      );
    }

    onSave({ from, to, mode, total, daily });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-h-[88vh] overflow-hidden sm:max-w-lg'>
        <DialogHeader>
          <DialogTitle>Cập nhật số liệu: {campaignName}</DialogTitle>
          <p className='text-content-muted text-xs'>
            Nhân viên Rexer nhập tay (chưa đấu API quảng cáo).
          </p>
        </DialogHeader>

        {/* Mode toggle */}
        <div className='border-border bg-muted inline-flex rounded-lg border p-0.5 text-xs'>
          {(['range', 'daily'] as const).map(m => (
            <button
              key={m}
              type='button'
              onClick={() => setMode(m)}
              className={cn(
                'rounded-md px-3 py-1.5 font-medium transition-colors',
                mode === m
                  ? 'text-foreground bg-background shadow-sm'
                  : 'text-content-muted'
              )}
            >
              {m === 'range' ? 'Theo khoảng' : 'Theo từng ngày'}
            </button>
          ))}
        </div>

        {/* Date range */}
        <div className='grid grid-cols-2 gap-3'>
          <DateField label='Từ ngày' value={from} onChange={setFrom} />
          <DateField label='Đến ngày' value={to} min={from} onChange={setTo} />
        </div>

        {/* Body */}
        <div className='-mr-1 max-h-[40vh] overflow-y-auto pr-1'>
          {mode === 'range' ? (
            <div className='grid grid-cols-2 gap-3'>
              {FIELDS.map(f => (
                <div key={f.key}>
                  <Label className='text-2xs text-content-muted font-semibold tracking-wider uppercase'>
                    {f.label}
                  </Label>
                  <Input
                    inputMode='numeric'
                    value={rangeTotal[f.key] ? String(rangeTotal[f.key]) : ''}
                    onChange={e => setRangeField(f.key, e.target.value)}
                    placeholder='0'
                    className='mt-1 font-mono'
                  />
                </div>
              ))}
            </div>
          ) : days.length === 0 ? (
            <p className='text-content-muted py-6 text-center text-xs'>
              Chọn khoảng ngày hợp lệ để nhập chi tiết.
            </p>
          ) : (
            <table className='w-full text-xs'>
              <thead className='text-content-muted text-2xs bg-background sticky top-0'>
                <tr className='border-border border-b'>
                  <th className='py-1.5 text-left font-semibold'>Ngày</th>
                  <th className='py-1.5 text-right font-semibold'>Imp</th>
                  <th className='py-1.5 text-right font-semibold'>Clicks</th>
                  <th className='py-1.5 text-right font-semibold'>Spend</th>
                  <th className='py-1.5 text-right font-semibold'>Conv</th>
                </tr>
              </thead>
              <tbody>
                {days.map(date => (
                  <tr key={date} className='border-border/60 border-b'>
                    <td className='text-3xs py-1 font-mono'>{date.slice(5)}</td>
                    {(
                      ['impressions', 'clicks', 'spend', 'conversions'] as const
                    ).map(k => (
                      <td key={k} className='py-1 pl-1'>
                        <input
                          inputMode='numeric'
                          value={dailyMap[date]?.[k] || ''}
                          onChange={e => setDailyField(date, k, e.target.value)}
                          placeholder='0'
                          className='border-border focus:border-primary text-3xs bg-background w-full rounded border px-1.5 py-0.5 text-right font-mono outline-none'
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <DialogFooter>
          <Button
            variant='neutral'
            size='sm'
            onClick={() => onOpenChange(false)}
          >
            Huỷ
          </Button>
          <Button size='sm' onClick={submit}>
            Lưu số liệu
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function DateField({
  label,
  value,
  min,
  onChange,
}: {
  label: string;
  value: string;
  min?: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <Label className='text-2xs text-content-muted font-semibold tracking-wider uppercase'>
        {label}
      </Label>
      <div className='border-border focus-within:border-primary bg-background mt-1 flex items-center gap-2 rounded-md border px-2.5 py-2'>
        <CalendarDays className='text-content-muted size-3.5' />
        <input
          type='date'
          value={value}
          min={min || undefined}
          onChange={e => onChange(e.target.value)}
          className='w-full bg-transparent text-sm outline-none'
        />
      </div>
    </div>
  );
}
