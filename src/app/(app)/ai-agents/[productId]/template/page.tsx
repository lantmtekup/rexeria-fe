'use client';

import * as React from 'react';
import { use } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, RefreshCw, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

import { Badge } from '@/components/atoms/badge';
import { Button } from '@/components/atoms/button';
import { Spinner } from '@/components/atoms/spinner';
import { EmptyState } from '@/components/molecules/EmptyState';
import { ProductWorkspaceLayout } from '@/components/templates/ProductWorkspaceLayout';
import { rexerApi } from '@/services/rexer/endpoints';
import { RxApiError } from '@/services/rexer/client';
import type { AITemplateCandidate, Template } from '@/services/rexer/types';
import { cn } from '@/lib/cn';

interface PageProps {
  params: Promise<{ productId: string }>;
}

function rxErrorMessage(err: unknown): string {
  if (err instanceof RxApiError) return err.message || err.code;
  if (err instanceof Error) return err.message;
  return 'Unexpected error';
}

interface CandidateWithTemplate {
  candidate: AITemplateCandidate;
  template?: Template;
}

export default function AiTemplatePickerPage({ params }: PageProps) {
  const { productId } = use(params);
  const router = useRouter();

  const [goal, setGoal] = React.useState('');
  const [candidates, setCandidates] = React.useState<CandidateWithTemplate[]>(
    []
  );
  const [selectedId, setSelectedId] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [refreshing, setRefreshing] = React.useState(false);

  const loadSuggestions = React.useCallback(
    async (currentGoal: string) => {
      try {
        const res = await rexerApi.ai.templateSuggest({
          product_id: productId,
          goal: currentGoal.trim() || undefined,
        });
        // Hydrate template metadata for each candidate (parallel best-effort).
        const enriched: CandidateWithTemplate[] = await Promise.all(
          res.candidates.map(async c => {
            try {
              const t = await rexerApi.templates.get(c.template_id);
              return { candidate: c, template: t.template };
            } catch {
              return { candidate: c };
            }
          })
        );
        setCandidates(enriched);
        if (enriched.length > 0) {
          setSelectedId(enriched[0].candidate.template_id);
        }
      } catch (err) {
        toast.error(`AI suggestion failed: ${rxErrorMessage(err)}`);
      }
    },
    [productId]
  );

  React.useEffect(() => {
    setLoading(true);
    loadSuggestions('').finally(() => setLoading(false));
  }, [loadSuggestions]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadSuggestions(goal);
    setRefreshing(false);
  };

  const selected = candidates.find(c => c.candidate.template_id === selectedId);

  return (
    <ProductWorkspaceLayout
      basePath={`/ai-agents/${productId}`}
      productName='Pick a template'
      scope='ai-agents'
      section='template'
      actions={
        <Button
          variant='primary'
          size='sm'
          disabled={!selectedId}
          onClick={() => router.push(`/ai-agents/${productId}/media`)}
        >
          Continue <ArrowRight className='size-3.5' />
        </Button>
      }
    >
      <div className='mx-auto grid h-full w-full max-w-[1200px] grid-cols-1 gap-4 px-6 pb-6 lg:grid-cols-[320px_1fr]'>
        {/* Left column — candidates */}
        <div className='flex h-full flex-col gap-3 overflow-y-auto'>
          <div className='border-border bg-background flex flex-col gap-2 rounded-xl border p-3'>
            <label className='text-muted-foreground text-xs font-semibold'>
              Goal (helps AI score templates)
            </label>
            <input
              value={goal}
              onChange={e => setGoal(e.target.value)}
              placeholder='e.g. drive pre-orders, build email list'
              className='border-input h-9 rounded-md border bg-transparent px-3 text-sm outline-none'
            />
            <Button
              variant='outline'
              size='sm'
              onClick={handleRefresh}
              disabled={refreshing || loading}
            >
              {refreshing ? (
                <>
                  <Spinner size={14} /> Re-suggesting…
                </>
              ) : (
                <>
                  <RefreshCw className='size-3.5' /> Refresh suggestions
                </>
              )}
            </Button>
          </div>

          {loading ? (
            <div className='text-muted-foreground flex justify-center py-12'>
              <Spinner size={20} />
            </div>
          ) : candidates.length === 0 ? (
            <EmptyState
              icon={<Sparkles className='size-8' />}
              title='No suggestions yet'
              description='Try refining the goal or refreshing.'
            />
          ) : (
            <div className='flex flex-col gap-2'>
              {candidates.map(({ candidate, template }) => {
                const isSel = candidate.template_id === selectedId;
                return (
                  <button
                    key={candidate.template_id}
                    type='button'
                    onClick={() => setSelectedId(candidate.template_id)}
                    className={cn(
                      'border-border bg-background hover:border-primary flex flex-col gap-2 rounded-xl border-2 p-3 text-left transition-colors',
                      isSel && 'border-primary bg-primary/5'
                    )}
                  >
                    <div className='flex items-start justify-between gap-2'>
                      <div className='min-w-0 flex-1'>
                        <p className='text-foreground truncate text-sm font-semibold'>
                          {template?.name ??
                            `Template ${candidate.template_id.slice(0, 6)}`}
                        </p>
                        <p className='text-muted-foreground mt-0.5 line-clamp-2 text-xs'>
                          {candidate.reason}
                        </p>
                      </div>
                      <Badge variant='secondary' className='shrink-0'>
                        {(candidate.score * 100).toFixed(0)}%
                      </Badge>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Right column — preview */}
        <div className='border-border flex h-full flex-col rounded-xl border bg-neutral-100'>
          <div className='flex flex-1 items-center justify-center p-8'>
            {selected ? (
              <div className='bg-background flex aspect-[16/10] w-full max-w-3xl items-center justify-center rounded-xl shadow-xl'>
                <div className='text-center'>
                  <p className='text-3xl font-black uppercase'>
                    {selected.template?.name ?? '—'}
                  </p>
                  <p className='text-muted-foreground mt-2 text-xs'>
                    Score {(selected.candidate.score * 100).toFixed(0)} ·{' '}
                    {selected.template?.description || '—'}
                  </p>
                </div>
              </div>
            ) : (
              <div className='text-muted-foreground text-sm'>
                Pick a candidate to preview
              </div>
            )}
          </div>
          <div className='border-border bg-background flex items-center justify-end border-t px-4 py-3'>
            <Button
              variant='primary'
              size='sm'
              disabled={!selectedId}
              onClick={() => router.push(`/ai-agents/${productId}/media`)}
            >
              Use this template
            </Button>
          </div>
        </div>
      </div>
    </ProductWorkspaceLayout>
  );
}
