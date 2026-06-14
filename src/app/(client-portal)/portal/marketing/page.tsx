'use client';

/**
 * Portal — Marketing list theo Figma node 2031-13877: grid card 2 cột, mỗi
 * card 1 "Marketing" (nhóm campaign) với ngày tạo · member stack · số
 * campaigns · status Active/Stop. BE chưa có entity Marketing nên nhóm theo
 * convention tên `"<marketing> — <campaign>"` (cùng app staff); campaign
 * không có prefix đứng thành nhóm riêng. Click card xổ danh sách campaign
 * bên trong (kèm link landing → phễu analytics). Member là placeholder —
 * BE chưa có teams.
 */

import { ChevronDown, Megaphone, Network, Plus, Sparkles } from 'lucide-react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';

import { Avatar } from '@/components/atoms/avatar';
import { Badge } from '@/components/atoms/badge';
import { Button } from '@/components/atoms/button';
import { Spinner } from '@/components/atoms/spinner';
import { cn } from '@/lib/cn';
import { rexerApi } from '@/services/rexer/endpoints';
import type { Campaign } from '@/services/rexer/types';

import { PortalShell } from '../_shell';

// BE chưa có marketing teams — avatar stack hiển thị placeholder cố định.
const PLACEHOLDER_MEMBERS = ['An Bùi', 'Châu Đỗ', 'Dũng Lê', 'Hà Mai'];

interface MarketingGroup {
  title: string;
  createdAt?: string;
  campaigns: Campaign[];
  active: boolean;
  /** Tóm tắt AI-Insights lấy từ notes (nếu có) — hiện chip trên card. */
  insight?: { goalLabel?: string; handed?: boolean };
}

function readInsight(c: Campaign): MarketingGroup['insight'] | undefined {
  try {
    const n = c.notes ? JSON.parse(c.notes) : null;
    if (!n?.insight_report_id) return undefined;
    return {
      goalLabel: n.insight_summary?.goalLabel,
      handed: !!n.insight_handoff?.template_id,
    };
  } catch {
    return undefined;
  }
}

function groupCampaigns(items: Campaign[]): MarketingGroup[] {
  const map = new Map<string, Campaign[]>();
  for (const c of items) {
    const title = c.name.includes(' — ') ? c.name.split(' — ')[0] : c.name;
    map.set(title, [...(map.get(title) ?? []), c]);
  }
  return [...map.entries()].map(([title, campaigns]) => ({
    title,
    createdAt: campaigns
      .map(c => c.created_at)
      .filter(Boolean)
      .sort()[0],
    campaigns,
    active: campaigns.some(c => c.status === 'active'),
    insight: campaigns.map(readInsight).find(Boolean),
  }));
}

const fmtCreated = (iso?: string) => {
  if (!iso) return '—';
  const d = new Date(iso);
  return `${String(d.getDate()).padStart(2, '0')}.${String(d.getMonth() + 1).padStart(2, '0')}.${d.getFullYear()}`;
};

export default function PortalMarketingPage() {
  return (
    <PortalShell fullBleed>
      <MarketingInner />
    </PortalShell>
  );
}

function MarketingInner() {
  const t = useTranslations('portal');
  const [campaigns, setCampaigns] = useState<Campaign[] | null>(null);

  const reload = useCallback(() => {
    rexerApi.campaigns
      .list({ limit: 50 })
      .then(r => setCampaigns(r.items ?? []))
      // `/campaigns` đang internal-only ở BE → brand user nhận 403
      // "Internal-only endpoint". Graceful: coi như chưa có campaign (hiện
      // empty-state) thay vì đổ raw error. Gỡ khi BE mở /campaigns cho brand.
      .catch(() => setCampaigns([]));
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  return (
    <div className='mx-auto flex w-full max-w-6xl flex-col gap-5 p-6'>
      <header className='flex flex-wrap items-center justify-between gap-3'>
        <div className='flex items-center gap-2'>
          <Megaphone className='text-primary size-5' />
          <h1 className='text-foreground text-xl font-semibold'>Marketing</h1>
          <Badge variant='outline' className='text-2xs'>
            review build
          </Badge>
        </div>
        <Button size='sm' asChild>
          <Link href='/portal/marketing/new'>
            <Plus className='size-4' /> Add more Marketing
          </Link>
        </Button>
      </header>

      {campaigns === null ? (
        <div className='text-content-muted flex h-48 items-center justify-center gap-2 text-sm'>
          <Spinner className='size-4' /> {t('marketing.loading')}
        </div>
      ) : campaigns.length === 0 ? (
        <MarketingEmpty />
      ) : (
        <div className='grid gap-4 xl:grid-cols-2'>
          {groupCampaigns(campaigns).map(g => (
            <MarketingCard key={g.title} group={g} />
          ))}
        </div>
      )}
    </div>
  );
}

function MarketingCard({ group }: { group: MarketingGroup }) {
  const t = useTranslations('portal');
  const [open, setOpen] = useState(false);
  // Click card → chi tiết (editor) của campaign đầu nhóm; chevron xổ nhanh
  // danh sách campaign con (mỗi cái có detail riêng) không rời trang.
  const detailHref = `/portal/marketing/${group.campaigns[0].id}`;
  return (
    <section className='bg-card border-border hover:border-primary/40 rounded-2xl border p-5 shadow-sm transition-colors'>
      <div className='flex items-start justify-between'>
        <Link href={detailHref} className='min-w-0 flex-1'>
          <div className='flex flex-wrap items-center gap-2'>
            <h2 className='text-foreground text-base font-bold'>
              {group.title}
            </h2>
            {group.insight && (
              <span className='text-2xs inline-flex items-center gap-1 rounded-full bg-blue-50 px-2 py-0.5 font-medium text-blue-600'>
                <Sparkles className='size-3' />
                {group.insight.handed
                  ? t('marketing.templateBuilt')
                  : (group.insight.goalLabel ?? 'AI-Insights')}
              </span>
            )}
          </div>
          <p className='text-content-muted mt-0.5 text-xs'>
            Create: {fmtCreated(group.createdAt)}
          </p>
        </Link>
        <button
          type='button'
          aria-label={t('marketing.toggleCampaigns')}
          onClick={() => setOpen(o => !o)}
          className='text-content-muted hover:text-foreground p-1'
        >
          <ChevronDown
            className={cn('size-4 transition-transform', open && 'rotate-180')}
          />
        </button>
      </div>

      <Link href={detailHref} className='mt-4 grid grid-cols-3 gap-3'>
        <div>
          <p className='text-content-muted mb-1.5 text-xs'>Member</p>
          <MemberStack />
        </div>
        <div>
          <p className='text-content-muted mb-1.5 text-xs'>Campaigns</p>
          <p className='text-foreground text-sm font-semibold tabular-nums'>
            {String(group.campaigns.length).padStart(2, '0')}
          </p>
        </div>
        <div>
          <p className='text-content-muted mb-1.5 text-xs'>Status</p>
          <span className='inline-flex items-center gap-1.5 text-sm font-medium'>
            <span
              className={cn(
                'size-2 rounded-full',
                group.active ? 'bg-emerald-500' : 'bg-red-500'
              )}
            />
            {group.active ? 'Active' : 'Stop'}
          </span>
        </div>
      </Link>

      {open && (
        <ul className='border-border mt-4 flex flex-col gap-2 border-t pt-3'>
          {group.campaigns.map(c => (
            <li
              key={c.id}
              className='flex items-center justify-between gap-3 text-sm'
            >
              <Link
                href={`/portal/marketing/${c.id}`}
                className='text-foreground hover:text-primary truncate'
              >
                {c.name}
              </Link>
              {c.landing_page_id ? (
                <Link
                  href={`/portal/landing-pages/${c.landing_page_id}/analytics`}
                  className='text-primary text-xs whitespace-nowrap hover:underline'
                >
                  {t('marketing.analyticsFunnel')}
                </Link>
              ) : (
                <span className='text-content-muted text-xs whitespace-nowrap'>
                  {t('marketing.noLanding')}
                </span>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

/** Empty state theo Figma 2031-11972: icon + "Marketing is empty" + nút đen. */
function MarketingEmpty() {
  return (
    <div className='flex flex-col items-center justify-center gap-1 py-24'>
      <Network className='text-content-muted size-16' strokeWidth={1.5} />
      <h2 className='text-foreground mt-4 text-xl font-bold'>
        Marketing is empty
      </h2>
      <p className='text-content-muted text-sm'>Create your first marketing</p>
      <Button asChild className='mt-4 rounded-full' size='lg'>
        <Link href='/portal/marketing/new'>
          <Plus className='size-4' /> Create Marketing
        </Link>
      </Button>
    </div>
  );
}

/** Avatar chồng nhau + badge tổng — placeholder tới khi BE có teams. */
function MemberStack() {
  return (
    <span className='flex items-center -space-x-2'>
      {PLACEHOLDER_MEMBERS.map(name => (
        <Avatar
          key={name}
          name={name}
          size='xs'
          className='ring-2 ring-white'
        />
      ))}
      <span className='bg-foreground text-background text-3xs z-10 inline-flex size-5 items-center justify-center rounded-full font-semibold ring-2 ring-white'>
        {PLACEHOLDER_MEMBERS.length}
      </span>
    </span>
  );
}
