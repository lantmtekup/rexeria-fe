'use client';

import * as React from 'react';
import { use } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowRight,
  ImageIcon,
  RefreshCw,
  Search,
  Sparkles,
} from 'lucide-react';
import { toast } from 'sonner';

import { Badge } from '@/components/atoms/badge';
import { Button } from '@/components/atoms/button';
import { Input } from '@/components/atoms/input';
import { Spinner } from '@/components/atoms/spinner';
import { EmptyState } from '@/components/molecules/EmptyState';
import { ProductWorkspaceLayout } from '@/components/templates/ProductWorkspaceLayout';
import { rexerApi } from '@/services/rexer/endpoints';
import { RxApiError } from '@/services/rexer/client';
import type {
  AITemplateCandidate,
  CanvasTemplate,
  Template,
} from '@/services/rexer/types';
import { cn } from '@/lib/cn';
import { readWizardState, writeWizardState } from '@/lib/wizardStore';

interface PageProps {
  params: Promise<{ productId: string }>;
}

function rxErrorMessage(err: unknown): string {
  if (err instanceof RxApiError) return err.message || err.code;
  if (err instanceof Error) return err.message;
  return 'Unexpected error';
}

type Tab = 'ai' | 'library';

interface AiCandidateRow {
  candidate: AITemplateCandidate;
  template?: Template;
}

export default function AiTemplatePickerPage({ params }: PageProps) {
  const { productId } = use(params);
  const router = useRouter();

  const [tab, setTab] = React.useState<Tab>('ai');

  // ── AI Suggestions tab ───────────────────────────────────────────────
  const [goal, setGoal] = React.useState('');
  const [candidates, setCandidates] = React.useState<AiCandidateRow[]>([]);
  const [aiLoading, setAiLoading] = React.useState(true);
  const [aiRefreshing, setAiRefreshing] = React.useState(false);

  const loadAi = React.useCallback(
    async (currentGoal: string) => {
      try {
        const res = await rexerApi.ai.templateSuggest({
          product_id: productId,
          goal: currentGoal.trim() || undefined,
        });
        const enriched = await Promise.all(
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
      } catch (err) {
        toast.error(`AI suggestion thất bại: ${rxErrorMessage(err)}`);
      }
    },
    [productId]
  );

  React.useEffect(() => {
    setAiLoading(true);
    loadAi('').finally(() => setAiLoading(false));
  }, [loadAi]);

  const handleAiRefresh = async () => {
    setAiRefreshing(true);
    await loadAi(goal);
    setAiRefreshing(false);
  };

  // ── All Templates tab ────────────────────────────────────────────────
  const [templates, setTemplates] = React.useState<CanvasTemplate[]>([]);
  const [search, setSearch] = React.useState('');
  const [libLoading, setLibLoading] = React.useState(true);

  React.useEffect(() => {
    let alive = true;
    setLibLoading(true);
    rexerApi.canvasTemplates
      .list({ is_active: true, limit: 50 })
      .then(r => {
        if (alive) setTemplates(r.items ?? []);
      })
      .catch(err => {
        if (alive)
          toast.error(`Không tải được template: ${rxErrorMessage(err)}`);
      })
      .finally(() => {
        if (alive) setLibLoading(false);
      });
    return () => {
      alive = false;
    };
  }, []);

  const filteredLib = React.useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return templates;
    return templates.filter(t => t.name.toLowerCase().includes(q));
  }, [templates, search]);

  // ── Shared selection state (id can come from either tab) ─────────────
  const [selected, setSelected] = React.useState<{
    id: string;
    kind: 'ai' | 'library';
  } | null>(null);

  // Restore wizard pick from sessionStorage on mount, else auto-select first
  // AI candidate / first library template.
  React.useEffect(() => {
    if (selected) return;
    const saved = readWizardState(productId);
    if (saved.template_id) {
      setSelected({
        id: saved.template_id,
        kind: saved.template_kind === 'legacy' ? 'ai' : 'library',
      });
      return;
    }
    if (candidates[0])
      setSelected({ id: candidates[0].candidate.template_id, kind: 'ai' });
    else if (templates[0])
      setSelected({ id: templates[0].id, kind: 'library' });
  }, [candidates, templates, selected, productId]);

  // Persist every selection so it survives navigation back-and-forth.
  React.useEffect(() => {
    if (!selected) return;
    const tplName =
      selected.kind === 'library'
        ? templates.find(t => t.id === selected.id)?.name
        : candidates.find(c => c.candidate.template_id === selected.id)
            ?.template?.name;
    writeWizardState(productId, {
      template_id: selected.id,
      template_kind: selected.kind === 'ai' ? 'legacy' : 'canvas',
      template_name: tplName,
      template_goal: goal.trim() || undefined,
    });
  }, [selected, productId, candidates, templates, goal]);

  const selectedAi = candidates.find(
    c => selected?.kind === 'ai' && c.candidate.template_id === selected.id
  );
  const selectedLib = templates.find(
    t => selected?.kind === 'library' && t.id === selected.id
  );

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
          disabled={!selected}
          onClick={() => router.push(`/ai-agents/${productId}/marketing`)}
        >
          Continue <ArrowRight className='size-3.5' />
        </Button>
      }
    >
      <div className='mx-auto grid h-full w-full max-w-[1280px] grid-cols-1 gap-4 px-6 pb-6 lg:grid-cols-[400px_1fr]'>
        {/* Left column — tabs + content */}
        <div className='flex h-full flex-col gap-3 overflow-y-auto'>
          {/* Tab bar */}
          <div className='border-border bg-background flex items-center gap-1 rounded-xl border p-1'>
            <TabButton
              active={tab === 'ai'}
              onClick={() => setTab('ai')}
              icon={<Sparkles className='size-3.5' />}
            >
              AI Suggestions
              {candidates.length > 0 && (
                <span className='bg-primary/15 text-primary ml-1 rounded-full px-1.5 py-0.5 text-[10px] font-semibold'>
                  {candidates.length}
                </span>
              )}
            </TabButton>
            <TabButton
              active={tab === 'library'}
              onClick={() => setTab('library')}
            >
              All Templates
              <span className='ml-1 rounded-full bg-neutral-200 px-1.5 py-0.5 text-[10px] font-semibold text-neutral-700'>
                {templates.length}
              </span>
            </TabButton>
          </div>

          {/* AI tab content */}
          {tab === 'ai' && (
            <>
              <div className='border-border bg-background flex flex-col gap-2 rounded-xl border p-3'>
                <label className='text-muted-foreground text-xs font-semibold'>
                  Mục tiêu (giúp AI chấm điểm)
                </label>
                <input
                  value={goal}
                  onChange={e => setGoal(e.target.value)}
                  placeholder='vd: pre-order, email leads…'
                  className='border-input h-9 rounded-md border bg-transparent px-3 text-sm outline-none'
                />
                <Button
                  variant='outline'
                  size='sm'
                  onClick={handleAiRefresh}
                  disabled={aiRefreshing || aiLoading}
                >
                  {aiRefreshing ? (
                    <>
                      <Spinner size={14} /> Đang chấm…
                    </>
                  ) : (
                    <>
                      <RefreshCw className='size-3.5' /> Refresh suggestions
                    </>
                  )}
                </Button>
              </div>

              {aiLoading ? (
                <div className='text-muted-foreground flex justify-center py-12'>
                  <Spinner size={20} />
                </div>
              ) : candidates.length === 0 ? (
                <EmptyState
                  icon={<Sparkles className='size-8' />}
                  title='Chưa có gợi ý'
                  description='Thử nhập mục tiêu rồi nhấn Refresh.'
                />
              ) : (
                <div className='flex flex-col gap-2'>
                  {candidates.map(({ candidate, template }) => {
                    const isSel =
                      selected?.kind === 'ai' &&
                      selected.id === candidate.template_id;
                    return (
                      <button
                        key={candidate.template_id}
                        type='button'
                        onClick={() =>
                          setSelected({
                            id: candidate.template_id,
                            kind: 'ai',
                          })
                        }
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
                          <Badge
                            variant='secondary'
                            className='from-primary/20 to-primary/10 text-primary shrink-0 bg-gradient-to-r'
                          >
                            {(candidate.score * 100).toFixed(0)}%
                          </Badge>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </>
          )}

          {/* Library tab content */}
          {tab === 'library' && (
            <>
              <div className='relative'>
                <Search className='text-muted-foreground absolute top-1/2 left-3 size-3.5 -translate-y-1/2' />
                <Input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder='Tìm template…'
                  className='h-9 pl-9'
                />
              </div>

              {libLoading ? (
                <div className='text-muted-foreground flex justify-center py-12'>
                  <Spinner size={20} />
                </div>
              ) : filteredLib.length === 0 ? (
                <EmptyState
                  title={search ? 'Không tìm thấy' : 'Chưa có template'}
                  description={
                    search
                      ? 'Thử từ khoá khác.'
                      : 'Tạo canvas template đầu tiên ở /template'
                  }
                />
              ) : (
                <div className='flex flex-col gap-2'>
                  {filteredLib.map(t => {
                    const isSel =
                      selected?.kind === 'library' && selected.id === t.id;
                    return (
                      <button
                        key={t.id}
                        type='button'
                        onClick={() =>
                          setSelected({ id: t.id, kind: 'library' })
                        }
                        className={cn(
                          'border-border bg-background hover:border-primary flex gap-3 rounded-xl border-2 p-2.5 text-left transition-colors',
                          isSel && 'border-primary bg-primary/5'
                        )}
                      >
                        <div className='bg-muted relative size-14 shrink-0 overflow-hidden rounded-md'>
                          {t.thumbnail_url ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={t.thumbnail_url}
                              alt={t.name}
                              className='size-full object-cover'
                              draggable={false}
                            />
                          ) : (
                            <div className='flex size-full items-center justify-center'>
                              <ImageIcon className='text-muted-foreground size-5' />
                            </div>
                          )}
                        </div>
                        <div className='flex min-w-0 flex-1 flex-col gap-1'>
                          <p className='text-foreground truncate text-sm font-semibold'>
                            {t.name}
                          </p>
                          <p className='text-muted-foreground text-xs'>
                            {t.width}×{t.height} · v{t.version}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </div>

        {/* Right column — preview */}
        <div className='border-border flex h-full flex-col overflow-hidden rounded-xl border bg-neutral-100'>
          <div className='flex flex-1 items-center justify-center p-6'>
            {selectedLib ? (
              <div className='bg-background flex w-full max-w-3xl flex-col overflow-hidden rounded-xl shadow-xl'>
                <div className='bg-muted flex aspect-[16/10] items-center justify-center overflow-hidden'>
                  {selectedLib.thumbnail_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={selectedLib.thumbnail_url}
                      alt={selectedLib.name}
                      className='size-full object-cover'
                    />
                  ) : (
                    <p className='text-2xl font-black tracking-tight uppercase'>
                      {selectedLib.name}
                    </p>
                  )}
                </div>
                <div className='flex items-start justify-between gap-3 p-4'>
                  <div>
                    <p className='text-foreground text-base font-semibold'>
                      {selectedLib.name}
                    </p>
                    <p className='text-muted-foreground text-xs'>
                      {selectedLib.width}×{selectedLib.height} · v
                      {selectedLib.version}
                    </p>
                  </div>
                  {selectedLib.is_template && (
                    <Badge variant='secondary'>Template</Badge>
                  )}
                </div>
              </div>
            ) : selectedAi ? (
              <div className='bg-background flex aspect-[16/10] w-full max-w-3xl items-center justify-center rounded-xl shadow-xl'>
                <div className='px-6 text-center'>
                  <Sparkles className='text-primary mx-auto mb-3 size-6' />
                  <p className='text-3xl font-black tracking-tight uppercase'>
                    {selectedAi.template?.name ?? '—'}
                  </p>
                  <p className='text-muted-foreground mt-2 text-xs'>
                    AI score {(selectedAi.candidate.score * 100).toFixed(0)}%
                  </p>
                  <p className='text-muted-foreground mt-2 max-w-md text-xs'>
                    {selectedAi.candidate.reason}
                  </p>
                </div>
              </div>
            ) : (
              <div className='text-muted-foreground text-sm'>
                Pick a template to preview
              </div>
            )}
          </div>
          <div className='border-border bg-background flex items-center justify-between border-t px-4 py-3'>
            <span className='text-muted-foreground text-xs'>
              {selected?.kind === 'ai'
                ? 'Từ AI Suggestions'
                : selected?.kind === 'library'
                  ? 'Từ All Templates'
                  : 'Chưa chọn'}
            </span>
            <Button
              variant='primary'
              size='sm'
              disabled={!selected}
              onClick={() => router.push(`/ai-agents/${productId}/marketing`)}
            >
              Use this template
            </Button>
          </div>
        </div>
      </div>
    </ProductWorkspaceLayout>
  );
}

function TabButton({
  active,
  onClick,
  icon,
  children,
}: {
  active?: boolean;
  onClick: () => void;
  icon?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <button
      type='button'
      onClick={onClick}
      className={cn(
        'flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition-colors',
        active
          ? 'bg-foreground text-background'
          : 'text-muted-foreground hover:text-foreground'
      )}
    >
      {icon}
      {children}
    </button>
  );
}
