'use client';

import * as React from 'react';
import { use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  CalendarRange,
  ExternalLink,
  Megaphone,
  Pencil,
  RefreshCw,
  Save,
  Trash2,
} from 'lucide-react';
import { toast } from 'sonner';

import { Badge } from '@/components/atoms/badge';
import { Button } from '@/components/atoms/button';
import { Spinner } from '@/components/atoms/spinner';
import { Textarea } from '@/components/atoms/textarea';
import { MetricCard } from '@/components/molecules/MetricCard';
import { LandingPagePicker } from '@/components/molecules/LandingPagePicker';
import { ProductWorkspaceLayout } from '@/components/templates/ProductWorkspaceLayout';
import { rexerApi } from '@/services/rexer/endpoints';
import { RxApiError } from '@/services/rexer/client';
import type {
  Campaign,
  CampaignKPI,
  CampaignMetrics,
  CampaignObjective,
} from '@/services/rexer/types';
import { packNotes, unpackNotes, type WizardState } from '@/lib/wizardStore';

interface PageProps {
  params: Promise<{ id: string; mid: string }>;
}

const OBJECTIVES: CampaignObjective[] = [
  'awareness',
  'traffic',
  'conversion',
  'retention',
];

function rxErrorMessage(err: unknown): string {
  if (err instanceof RxApiError) return err.message || err.code;
  if (err instanceof Error) return err.message;
  return 'Unexpected error';
}

function formatNumber(n?: number) {
  if (n == null) return '—';
  return n.toLocaleString();
}
function formatPercent(n?: number) {
  if (n == null) return '—';
  return `${(n * 100).toFixed(1)}%`;
}

function ChannelEditor({
  value,
  onChange,
  disabled,
}: {
  value: string[];
  onChange: (next: string[]) => void;
  disabled?: boolean;
}) {
  const [draft, setDraft] = React.useState('');
  const add = () => {
    const v = draft.trim();
    if (!v) return;
    if (value.includes(v)) {
      setDraft('');
      return;
    }
    onChange([...value, v]);
    setDraft('');
  };
  return (
    <div className='flex flex-wrap items-center gap-1.5'>
      {value.map(v => (
        <span
          key={v}
          className='bg-muted text-foreground inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs'
        >
          {v}
          <button
            type='button'
            disabled={disabled}
            onClick={() => onChange(value.filter(x => x !== v))}
            className='hover:text-destructive'
          >
            ×
          </button>
        </span>
      ))}
      <input
        value={draft}
        onChange={e => setDraft(e.target.value)}
        onKeyDown={e => {
          if (e.key === 'Enter') {
            e.preventDefault();
            add();
          }
        }}
        onBlur={add}
        disabled={disabled}
        placeholder='+ channel'
        className='border-input h-7 min-w-[80px] rounded-md border bg-transparent px-2 text-xs outline-none'
      />
    </div>
  );
}

function KpiEditor({
  value,
  onChange,
  disabled,
}: {
  value: CampaignKPI[];
  onChange: (next: CampaignKPI[]) => void;
  disabled?: boolean;
}) {
  const setItem = (i: number, patch: Partial<CampaignKPI>) =>
    onChange(value.map((k, idx) => (idx === i ? { ...k, ...patch } : k)));
  const remove = (i: number) => onChange(value.filter((_, idx) => idx !== i));
  return (
    <ul className='flex flex-col gap-1.5'>
      {value.map((k, i) => (
        <li key={i} className='flex items-center gap-2'>
          <input
            value={k.name}
            onChange={e => setItem(i, { name: e.target.value })}
            disabled={disabled}
            placeholder='KPI name'
            className='border-input h-8 flex-1 rounded-md border bg-transparent px-2 text-sm outline-none'
          />
          <input
            type='number'
            value={k.target ?? ''}
            onChange={e =>
              setItem(i, {
                target: e.target.value ? Number(e.target.value) : undefined,
              })
            }
            disabled={disabled}
            placeholder='target'
            className='border-input h-8 w-28 rounded-md border bg-transparent px-2 text-sm outline-none'
          />
          <Button
            type='button'
            variant='ghost'
            size='icon'
            disabled={disabled}
            onClick={() => remove(i)}
            className='text-muted-foreground hover:text-destructive size-8'
          >
            <Trash2 className='size-3.5' />
          </Button>
        </li>
      ))}
      <Button
        type='button'
        variant='outline'
        size='sm'
        disabled={disabled}
        onClick={() => onChange([...value, { name: '' }])}
      >
        + Add KPI
      </Button>
    </ul>
  );
}

export default function CampaignDetailPage({ params }: PageProps) {
  const { id, mid } = use(params);
  const router = useRouter();
  const basePath = `/product/${id}`;

  const [campaign, setCampaign] = React.useState<Campaign | null>(null);
  const [metrics, setMetrics] = React.useState<CampaignMetrics | null>(null);
  const [draft, setDraft] = React.useState<Campaign | null>(null);
  const [editing, setEditing] = React.useState(false);
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [refreshing, setRefreshing] = React.useState(false);

  const reload = React.useCallback(async () => {
    setLoading(true);
    try {
      const [c, m] = await Promise.all([
        rexerApi.campaigns.get(mid),
        rexerApi.campaigns.metrics(mid).catch(() => null),
      ]);
      setCampaign(c);
      setDraft(c);
      setMetrics(m);
    } catch (err) {
      toast.error(`Failed to load campaign: ${rxErrorMessage(err)}`);
    } finally {
      setLoading(false);
    }
  }, [mid]);

  React.useEffect(() => {
    reload();
  }, [reload]);

  const refreshMetrics = async () => {
    setRefreshing(true);
    try {
      const m = await rexerApi.campaigns.metrics(mid);
      setMetrics(m);
    } catch (err) {
      toast.error(`Refresh failed: ${rxErrorMessage(err)}`);
    } finally {
      setRefreshing(false);
    }
  };

  const handleSave = async () => {
    if (!draft) return;
    setSaving(true);
    try {
      // Re-pack wizard metadata with the current user notes so the
      // `@@rexer-wizard:` header isn't lost on save.
      const { meta, userNotes: currentUserNotes } = unpackNotes(
        draft.notes ?? undefined
      );
      const updated = await rexerApi.campaigns.update(mid, {
        name: draft.name,
        objective: draft.objective as CampaignObjective | undefined,
        channels: draft.channels,
        kpis: draft.kpis,
        budget_amount: draft.budget_amount,
        budget_currency: draft.budget_currency,
        notes: meta.template_id
          ? packNotes(meta, currentUserNotes)
          : (draft.notes ?? undefined),
        // Gắn landing → BE dựng tracked_url + scope metrics (be-fe-handoff Q3).
        landing_page_id: draft.landing_page_id ?? undefined,
      });
      setCampaign(updated);
      setDraft(updated);
      setEditing(false);
      toast.success('Campaign saved');
    } catch (err) {
      toast.error(`Save failed: ${rxErrorMessage(err)}`);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete this campaign? This cannot be undone.')) return;
    try {
      await rexerApi.campaigns.remove(mid);
      toast.success('Campaign deleted');
      router.push(`${basePath}/marketing`);
    } catch (err) {
      toast.error(`Delete failed: ${rxErrorMessage(err)}`);
    }
  };

  const view = editing ? draft : campaign;
  const parsed = React.useMemo(
    () => unpackNotes(view?.notes ?? undefined),
    [view?.notes]
  );
  const wizardMeta: WizardState = parsed.meta;
  const userNotes = parsed.userNotes;

  return (
    <ProductWorkspaceLayout
      basePath={basePath}
      productName={view?.name ?? 'Campaign'}
      scope='product'
      section='marketing'
      actions={
        <>
          <Button asChild variant='pill-light' size='sm'>
            <Link href={`${basePath}/marketing`}>
              <ArrowLeft className='size-3.5' /> Back
            </Link>
          </Button>
          {editing ? (
            <Button
              variant='primary'
              size='sm'
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? (
                <>
                  <Spinner size={14} /> Saving…
                </>
              ) : (
                <>
                  <Save className='size-3.5' /> Save
                </>
              )}
            </Button>
          ) : (
            <Button
              variant='outline'
              size='sm'
              onClick={() => setEditing(true)}
              disabled={!campaign}
            >
              <Pencil className='size-3.5' /> Edit
            </Button>
          )}
        </>
      }
    >
      <div className='mx-auto flex w-full max-w-[1100px] flex-col gap-5 px-6 pb-10'>
        {loading ? (
          <div className='text-muted-foreground flex justify-center py-16'>
            <Spinner size={20} />
          </div>
        ) : !view ? (
          <div className='text-muted-foreground py-16 text-center text-sm'>
            Campaign not found.
          </div>
        ) : (
          <>
            {/* Status + Tracked URL */}
            <section className='border-border bg-background flex flex-wrap items-center justify-between gap-3 rounded-xl border p-5'>
              <div>
                <p className='text-muted-foreground text-xs font-medium tracking-wide uppercase'>
                  <Megaphone className='-mt-0.5 mr-1 inline size-3.5' />
                  Campaign
                </p>
                {editing ? (
                  <input
                    value={draft?.name ?? ''}
                    onChange={e =>
                      setDraft(d => (d ? { ...d, name: e.target.value } : d))
                    }
                    className='border-input mt-1 h-9 rounded-md border bg-transparent px-2 text-lg font-semibold outline-none'
                  />
                ) : (
                  <h2 className='text-foreground text-xl font-semibold'>
                    {view.name}
                  </h2>
                )}
                <div className='mt-1 flex items-center gap-2'>
                  <Badge variant='secondary' className='capitalize'>
                    {view.status ?? 'draft'}
                  </Badge>
                  <Badge variant='outline' className='capitalize'>
                    {view.objective ?? '—'}
                  </Badge>
                </div>
              </div>
              <div className='flex items-center gap-2'>
                {metrics?.tracked_url ? (
                  <Button asChild variant='outline' size='sm'>
                    <a
                      href={metrics.tracked_url}
                      target='_blank'
                      rel='noreferrer noopener'
                    >
                      <ExternalLink className='size-3.5' /> Open landing
                    </a>
                  </Button>
                ) : view.tracked_url ? (
                  <Button asChild variant='outline' size='sm'>
                    <a
                      href={view.tracked_url}
                      target='_blank'
                      rel='noreferrer noopener'
                    >
                      <ExternalLink className='size-3.5' /> Open landing
                    </a>
                  </Button>
                ) : (
                  <span className='text-muted-foreground text-xs'>
                    Link a landing to get a tracked URL
                  </span>
                )}
                <Button
                  variant='ghost'
                  size='sm'
                  className='text-muted-foreground hover:text-destructive'
                  onClick={handleDelete}
                >
                  <Trash2 className='size-3.5' /> Delete
                </Button>
              </div>
            </section>

            {/* Metrics */}
            <section className='border-border bg-background flex flex-col gap-3 rounded-xl border p-5'>
              <header className='flex items-center justify-between'>
                <h3 className='text-foreground text-base font-semibold'>
                  Performance
                </h3>
                <Button
                  variant='ghost'
                  size='sm'
                  onClick={refreshMetrics}
                  disabled={refreshing}
                >
                  <RefreshCw
                    className={`size-3.5 ${refreshing ? 'animate-spin' : ''}`}
                  />
                  Refresh
                </Button>
              </header>
              <div className='grid grid-cols-2 gap-3 sm:grid-cols-4'>
                <MetricCard
                  label='Page views'
                  value={formatNumber(metrics?.summary?.page_views)}
                />
                <MetricCard
                  label='CTA clicks'
                  value={formatNumber(metrics?.summary?.cta_clicks)}
                />
                <MetricCard
                  label='Conversions'
                  value={formatNumber(metrics?.summary?.conversions)}
                />
                <MetricCard
                  label='CTR'
                  value={formatPercent(metrics?.summary?.ctr)}
                />
              </div>
              {metrics?.utm_campaign && (
                <p className='text-muted-foreground text-xs'>
                  Tracked via{' '}
                  <code className='font-mono'>
                    utm_campaign={metrics.utm_campaign}
                  </code>
                </p>
              )}
            </section>

            {/* Editor */}
            <section className='border-border bg-background grid grid-cols-1 gap-4 rounded-xl border p-5 sm:grid-cols-2'>
              <div className='flex flex-col gap-2'>
                <label className='text-muted-foreground text-xs font-semibold'>
                  Objective
                </label>
                <select
                  value={view.objective ?? ''}
                  onChange={e =>
                    editing &&
                    setDraft(d => (d ? { ...d, objective: e.target.value } : d))
                  }
                  disabled={!editing}
                  className='border-input bg-background h-10 rounded-md border px-3 text-sm'
                >
                  <option value=''>—</option>
                  {OBJECTIVES.map(o => (
                    <option key={o} value={o}>
                      {o}
                    </option>
                  ))}
                </select>
              </div>

              <div className='flex flex-col gap-2'>
                <label className='text-muted-foreground text-xs font-semibold'>
                  Budget
                </label>
                <div className='flex gap-2'>
                  <input
                    type='number'
                    value={view.budget_amount ?? ''}
                    onChange={e =>
                      editing &&
                      setDraft(d =>
                        d
                          ? {
                              ...d,
                              budget_amount: e.target.value
                                ? Number(e.target.value)
                                : undefined,
                            }
                          : d
                      )
                    }
                    disabled={!editing}
                    className='border-input h-10 flex-1 rounded-md border bg-transparent px-3 text-sm outline-none'
                  />
                  <input
                    value={view.budget_currency ?? ''}
                    onChange={e =>
                      editing &&
                      setDraft(d =>
                        d ? { ...d, budget_currency: e.target.value } : d
                      )
                    }
                    disabled={!editing}
                    placeholder='USD'
                    className='border-input h-10 w-20 rounded-md border bg-transparent px-3 text-sm uppercase outline-none'
                  />
                </div>
              </div>

              <div className='flex flex-col gap-2 sm:col-span-2'>
                <label className='text-muted-foreground text-xs font-semibold'>
                  Channels
                </label>
                <ChannelEditor
                  value={view.channels ?? []}
                  onChange={next =>
                    setDraft(d => (d ? { ...d, channels: next } : d))
                  }
                  disabled={!editing}
                />
              </div>

              <div className='flex flex-col gap-2 sm:col-span-2'>
                <label className='text-muted-foreground text-xs font-semibold'>
                  KPIs
                </label>
                <KpiEditor
                  value={view.kpis ?? []}
                  onChange={next =>
                    setDraft(d => (d ? { ...d, kpis: next } : d))
                  }
                  disabled={!editing}
                />
              </div>

              <div className='flex flex-col gap-2 sm:col-span-2'>
                <label className='text-muted-foreground text-xs font-semibold'>
                  Landing page
                </label>
                <LandingPagePicker
                  brandId={view.brand_id}
                  value={view.landing_page_id}
                  onChange={pageId =>
                    setDraft(d => (d ? { ...d, landing_page_id: pageId } : d))
                  }
                  disabled={!editing}
                />
                <p className='text-muted-foreground text-[11px]'>
                  Trang được gắn sẽ dựng tracked URL + scope metrics. Bỏ trống =
                  không gắn.
                </p>
              </div>

              {wizardMeta.template_id && (
                <div className='flex flex-col gap-2 sm:col-span-2'>
                  <label className='text-muted-foreground text-xs font-semibold'>
                    Linked landing / template (wizard)
                  </label>
                  <div className='border-border bg-muted/30 flex items-start justify-between gap-3 rounded-xl border p-3'>
                    <div className='min-w-0 flex-1'>
                      <p className='text-foreground truncate text-sm font-medium'>
                        {wizardMeta.template_name ??
                          `Template ${wizardMeta.template_id.slice(0, 8)}`}
                      </p>
                      <p className='text-muted-foreground mt-0.5 text-xs'>
                        Saved from wizard ·{' '}
                        {wizardMeta.template_kind === 'canvas'
                          ? 'Canvas template'
                          : 'Landing template'}
                        {wizardMeta.template_goal
                          ? ` · goal: ${wizardMeta.template_goal}`
                          : ''}
                      </p>
                    </div>
                    {wizardMeta.template_kind === 'canvas' && (
                      <Button asChild variant='outline' size='sm'>
                        <Link
                          href={`/canvas-templates/${wizardMeta.template_id}?apply_product=${id}`}
                        >
                          <ExternalLink className='size-3.5' />
                          Mở editor
                        </Link>
                      </Button>
                    )}
                  </div>
                  {wizardMeta.marketing_brief && (
                    <p className='text-muted-foreground text-xs italic'>
                      Brief: {wizardMeta.marketing_brief}
                    </p>
                  )}
                </div>
              )}

              <div className='flex flex-col gap-2 sm:col-span-2'>
                <label className='text-muted-foreground text-xs font-semibold'>
                  <CalendarRange className='-mt-0.5 mr-1 inline size-3' />
                  Notes
                </label>
                <Textarea
                  rows={3}
                  value={userNotes}
                  onChange={e =>
                    setDraft(d =>
                      d
                        ? {
                            ...d,
                            notes: wizardMeta.template_id
                              ? packNotes(wizardMeta, e.target.value)
                              : e.target.value,
                          }
                        : d
                    )
                  }
                  disabled={!editing}
                />
              </div>
            </section>
          </>
        )}
      </div>
    </ProductWorkspaceLayout>
  );
}
