'use client';

import * as React from 'react';
import { use } from 'react';
import { useRouter } from 'next/navigation';
import { Check, Rocket, Sparkles, Wand2 } from 'lucide-react';
import { toast } from 'sonner';

import { Badge } from '@/components/atoms/badge';
import { Button } from '@/components/atoms/button';
import { Spinner } from '@/components/atoms/spinner';
import { Textarea } from '@/components/atoms/textarea';
import { ProductWorkspaceLayout } from '@/components/templates/ProductWorkspaceLayout';
import { rexerApi } from '@/services/rexer/endpoints';
import { RxApiError } from '@/services/rexer/client';
import type {
  AICampaignPlanResponse,
  CampaignObjective,
} from '@/services/rexer/types';
import {
  clearWizardState,
  packNotes,
  readWizardState,
} from '@/lib/wizardStore';

interface PageProps {
  params: Promise<{ productId: string }>;
}

const OBJECTIVES: { key: CampaignObjective; label: string; hint: string }[] = [
  {
    key: 'awareness',
    label: 'Awareness',
    hint: 'Reach new audiences',
  },
  {
    key: 'traffic',
    label: 'Traffic',
    hint: 'Drive visitors to landing',
  },
  {
    key: 'conversion',
    label: 'Conversion',
    hint: 'Maximise sign-ups / sales',
  },
  {
    key: 'retention',
    label: 'Retention',
    hint: 'Re-engage existing users',
  },
];

function rxErrorMessage(err: unknown): string {
  if (err instanceof RxApiError) return err.message || err.code;
  if (err instanceof Error) return err.message;
  return 'Unexpected error';
}

export default function AiCampaignPage({ params }: PageProps) {
  const { productId } = use(params);
  const router = useRouter();

  const [objective, setObjective] =
    React.useState<CampaignObjective>('conversion');
  const [budget, setBudget] = React.useState<string>('1000');
  const [notes, setNotes] = React.useState('');
  const [plan, setPlan] = React.useState<AICampaignPlanResponse | null>(null);
  const [planning, setPlanning] = React.useState(false);
  const [creating, setCreating] = React.useState(false);
  // Cache product.client_id so we can scope the campaign to the same client
  // as the product. Without this BE rejects with ERR_FORBIDDEN
  // "Product belongs to another client" when the logged-in user (eg admin)
  // has no client of its own.
  const [productClientId, setProductClientId] = React.useState<
    string | null | undefined
  >(undefined);

  React.useEffect(() => {
    let alive = true;
    rexerApi.products
      .get(productId)
      .then(res => {
        if (alive) setProductClientId(res.product.client_id ?? null);
      })
      .catch(() => {
        if (alive) setProductClientId(null);
      });
    return () => {
      alive = false;
    };
  }, [productId]);

  const handlePlan = async () => {
    setPlanning(true);
    try {
      const res = await rexerApi.ai.campaignPlan({
        product_id: productId,
        objective,
        budget: budget ? Number(budget) : undefined,
      });
      setPlan(res);
      toast.success('AI plan ready');
    } catch (err) {
      toast.error(`Plan failed: ${rxErrorMessage(err)}`);
    } finally {
      setPlanning(false);
    }
  };

  const handleLaunch = async () => {
    if (!plan) return;
    setCreating(true);
    try {
      // Pull wizard picks from sessionStorage so the picked template +
      // marketing brief travel into campaign.notes. Detail page reads them
      // back via unpackNotes() so reopening shows linked landing/template.
      const wizard = readWizardState(productId);
      const created = await rexerApi.campaigns.create({
        name: plan.name,
        product_id: productId,
        // Scope campaign to the product's client (BE enforces match).
        // Skip when product has no client (admin-owned).
        client_id: productClientId ?? undefined,
        // Template binding via `landing_project_id` removed — project-based
        // landings deprecated. Campaign now references canvas-template via
        // notes payload only; structured FK will return when BE adds a
        // `canvas_template_id` column on campaigns.
        objective,
        channels: plan.channels,
        kpis: plan.kpis,
        budget_amount: budget ? Number(budget) : undefined,
        notes: packNotes(wizard, notes),
      });
      toast.success(`Campaign "${created.name}" created`);
      clearWizardState(productId);
      router.push(`/product/${productId}/marketing/${created.id}`);
    } catch (err) {
      toast.error(`Create failed: ${rxErrorMessage(err)}`);
    } finally {
      setCreating(false);
    }
  };

  return (
    <ProductWorkspaceLayout
      basePath={`/ai-agents/${productId}`}
      productName='Plan a campaign'
      scope='ai-agents'
      section='campaign'
      actions={
        <Button
          variant='ai'
          size='sm'
          onClick={handleLaunch}
          disabled={!plan || creating}
        >
          {creating ? (
            <>
              <Spinner size={14} /> Launching…
            </>
          ) : (
            <>
              <Rocket className='size-3.5' /> Launch
            </>
          )}
        </Button>
      }
    >
      <div className='mx-auto grid w-full max-w-[1100px] grid-cols-1 gap-5 px-6 pb-10 lg:grid-cols-2'>
        {/* Left — inputs */}
        <section className='border-border bg-background flex flex-col gap-4 rounded-xl border p-5'>
          <header className='flex items-center gap-2'>
            <Wand2 className='text-primary size-4' />
            <h3 className='text-foreground text-base font-semibold'>
              Campaign brief
            </h3>
          </header>

          <div className='flex flex-col gap-2'>
            <span className='text-muted-foreground text-xs font-semibold'>
              Objective
            </span>
            <div className='grid grid-cols-2 gap-2'>
              {OBJECTIVES.map(o => {
                const active = o.key === objective;
                return (
                  <button
                    key={o.key}
                    type='button'
                    onClick={() => setObjective(o.key)}
                    className={`rounded-xl border-2 px-3 py-2 text-left transition-colors ${
                      active
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-neutral-300'
                    }`}
                  >
                    <p className='text-foreground text-sm font-semibold'>
                      {o.label}
                    </p>
                    <p className='text-muted-foreground text-xs'>{o.hint}</p>
                  </button>
                );
              })}
            </div>
          </div>

          <div className='flex flex-col gap-2'>
            <label
              htmlFor='budget'
              className='text-muted-foreground text-xs font-semibold'
            >
              Budget (USD)
            </label>
            <input
              id='budget'
              type='number'
              min={0}
              step={100}
              value={budget}
              onChange={e => setBudget(e.target.value)}
              className='border-input h-10 rounded-md border bg-transparent px-3 text-sm outline-none'
            />
          </div>

          <div className='flex flex-col gap-2'>
            <label
              htmlFor='notes'
              className='text-muted-foreground text-xs font-semibold'
            >
              Notes (optional)
            </label>
            <Textarea
              id='notes'
              rows={3}
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder='Channels you prefer, launch date, brand guardrails…'
            />
          </div>

          <Button
            variant='ai'
            size='md'
            onClick={handlePlan}
            disabled={planning}
          >
            {planning ? (
              <>
                <Spinner size={14} /> Planning…
              </>
            ) : (
              <>
                <Sparkles className='size-3.5' /> Plan with AI
              </>
            )}
          </Button>
        </section>

        {/* Right — AI plan */}
        <section className='border-border bg-background flex flex-col gap-4 rounded-xl border p-5'>
          <header className='flex items-center gap-2'>
            <Rocket className='text-primary size-4' />
            <h3 className='text-foreground text-base font-semibold'>AI plan</h3>
          </header>

          {!plan ? (
            <p className='text-muted-foreground text-sm italic'>
              Configure the brief and click <strong>Plan with AI</strong>.
            </p>
          ) : (
            <>
              <div>
                <p className='text-muted-foreground text-xs font-semibold uppercase'>
                  Suggested name
                </p>
                <p className='text-foreground text-lg font-semibold'>
                  {plan.name}
                </p>
              </div>

              <div>
                <p className='text-muted-foreground mb-1 text-xs font-semibold uppercase'>
                  Channels
                </p>
                <div className='flex flex-wrap gap-1'>
                  {plan.channels.map(c => (
                    <Badge key={c} variant='secondary' className='capitalize'>
                      {c}
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <p className='text-muted-foreground text-xs font-semibold uppercase'>
                  Suggested duration
                </p>
                <p className='text-foreground text-sm'>
                  {plan.duration_days} day(s)
                </p>
              </div>

              <div>
                <p className='text-muted-foreground mb-1 text-xs font-semibold uppercase'>
                  KPIs
                </p>
                <ul className='flex flex-col gap-1.5'>
                  {plan.kpis.map(k => (
                    <li
                      key={k.name}
                      className='border-border flex items-center justify-between rounded-md border px-3 py-1.5 text-sm'
                    >
                      <span className='inline-flex items-center gap-2'>
                        <Check className='text-primary size-3.5' /> {k.name}
                      </span>
                      <span className='text-muted-foreground'>
                        {k.target ?? '—'}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </>
          )}
        </section>
      </div>
    </ProductWorkspaceLayout>
  );
}
