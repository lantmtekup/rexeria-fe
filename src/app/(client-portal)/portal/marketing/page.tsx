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

import { ChevronDown, Megaphone, Network, Plus } from 'lucide-react';
import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';

import { Avatar } from '@/components/atoms/avatar';
import { Badge } from '@/components/atoms/badge';
import { Button } from '@/components/atoms/button';
import { Spinner } from '@/components/atoms/spinner';
import { EmptyState } from '@/components/molecules/EmptyState';
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
  const [campaigns, setCampaigns] = useState<Campaign[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(() => {
    rexerApi.campaigns
      .list({ limit: 50 })
      .then(r => setCampaigns(r.items ?? []))
      .catch(err => setError(err instanceof Error ? err.message : 'API_ERROR'));
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

      {error ? (
        <EmptyState title='Không tải được campaigns' description={error} />
      ) : campaigns === null ? (
        <div className='text-content-muted flex h-48 items-center justify-center gap-2 text-sm'>
          <Spinner className='size-4' /> Đang tải…
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
  const [open, setOpen] = useState(false);
  // Click card → chi tiết (editor) của campaign đầu nhóm; chevron xổ nhanh
  // danh sách campaign con (mỗi cái có detail riêng) không rời trang.
  const detailHref = `/portal/marketing/${group.campaigns[0].id}`;
  return (
    <section className='bg-card border-border hover:border-primary/40 rounded-2xl border p-5 shadow-sm transition-colors'>
      <div className='flex items-start justify-between'>
        <Link href={detailHref} className='min-w-0 flex-1'>
          <h2 className='text-foreground text-base font-bold'>{group.title}</h2>
          <p className='text-content-muted mt-0.5 text-xs'>
            Create: {fmtCreated(group.createdAt)}
          </p>
        </Link>
        <button
          type='button'
          aria-label='Xem campaigns trong nhóm'
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
                  Phễu analytics →
                </Link>
              ) : (
                <span className='text-content-muted text-xs whitespace-nowrap'>
                  chưa gắn landing
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
