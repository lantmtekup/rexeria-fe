'use client';

/**
 * Editor campaign dùng chung create/edit (`/portal/marketing/new` + `/[id]`).
 * Layout: 1 rail dọc DUY NHẤT, gom 2 nhóm (review UX 2026-06-15):
 *   THÔNG TIN: Discovery · Concept · Assets · Sản phẩm  (nuôi AI)
 *   KẾ HOẠCH:  Chiến dịch (mục tiêu/ngân sách/kênh/thời gian) · Landing page
 *   AI:        AI-Insights (chỉ hiện khi đã chạy)
 * Bỏ tab ngang lồng trong rail (2 tầng nav đá nhau). Mỗi mục là 1 panel
 * (_CampaignPanels). BE chưa có entity Marketing → brief sống trong
 * `campaign.notes` (JSON); blueprint AI fetch 1 lần ở đây rồi truyền xuống.
 */

import { ArrowLeft, FlaskConical, Plus, Sparkles, Trash2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/atoms/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/atoms/dialog';
import { cn } from '@/lib/cn';
import { rexerApi } from '@/services/rexer/endpoints';
import type { Campaign, Product } from '@/services/rexer/types';

import { useActiveWorkspace } from '../_workspace';

import { AiAssistantDialog } from './_AiAssistantDialog';
import { GeneralPanel, LandingPanel, ProductPanel } from './_CampaignPanels';
import { InsightResultPanel, type InsightHandoff } from './_InsightResultPanel';
import { marketingToInsightInputs } from './_insights-bridge';
import { type InsightSummary } from './_insights-labels';
import { HAPPY_CITY_BRIEF, HAPPY_CITY_CAMPAIGN } from './_seed';
import { emptyAssets, type AssetsState } from './_assets';
import {
  emptyBriefField,
  missingBriefFields,
  StepMarketing,
  type BriefField,
  type BriefState,
  type CampaignState,
  type MarketingSection,
} from './_steps';

type SectionKey =
  | MarketingSection
  | 'product'
  | 'campaign'
  | 'landing'
  | 'insights';

// Continue đi tuần tự theo rail: brief → sản phẩm → chiến dịch → landing → Lưu.
// `insights` ngoài luồng (chỉ hiện khi đã chạy AI).
const STEP_FLOW: SectionKey[] = [
  'discovery',
  'concept',
  'assets',
  'product',
  'campaign',
  'landing',
];
const LAST_STEP: SectionKey = STEP_FLOW[STEP_FLOW.length - 1];

// Rail dọc gom 2 nhóm (label/items là i18n key cho `t()`).
const RAIL_GROUPS: {
  label: string;
  items: { key: SectionKey; label: string }[];
}[] = [
  {
    label: 'marketingCampaignTabs.groupInfo',
    items: [
      { key: 'discovery', label: 'marketingCampaignTabs.secDiscovery' },
      { key: 'concept', label: 'marketingCampaignTabs.secConcept' },
      { key: 'assets', label: 'marketingCampaignTabs.secAssets' },
      { key: 'product', label: 'marketingCampaignTabs.productTab' },
    ],
  },
  {
    label: 'marketingCampaignTabs.groupPlan',
    items: [
      { key: 'campaign', label: 'marketingCampaignTabs.secCampaign' },
      { key: 'landing', label: 'marketingCampaignTabs.landingTab' },
    ],
  },
];

// Notes cũ lưu field dạng string thuần — migrate sang BriefField đầy đủ.
function migrateField(v: unknown): BriefField {
  if (typeof v === 'string') return { ...emptyBriefField(), text: v };
  const o = (v ?? {}) as Partial<BriefField>;
  return {
    text: o.text ?? '',
    extras: Array.isArray(o.extras) ? o.extras : [],
    files: Array.isArray(o.files) ? o.files : [],
  };
}

function migrateSection(sec: unknown): Record<string, BriefField> {
  const out: Record<string, BriefField> = {};
  for (const [k, v] of Object.entries((sec ?? {}) as Record<string, unknown>))
    out[k] = migrateField(v);
  return out;
}

export function parseReportId(notes?: string): string | undefined {
  try {
    return notes
      ? (JSON.parse(notes)?.insight_report_id ?? undefined)
      : undefined;
  } catch {
    return undefined;
  }
}

function parseHandoff(notes?: string): InsightHandoff | undefined {
  try {
    return notes
      ? (JSON.parse(notes)?.insight_handoff ?? undefined)
      : undefined;
  } catch {
    return undefined;
  }
}

function parseSummary(notes?: string): InsightSummary | undefined {
  try {
    return notes
      ? (JSON.parse(notes)?.insight_summary ?? undefined)
      : undefined;
  } catch {
    return undefined;
  }
}

function parseBrief(notes?: string): BriefState {
  try {
    const b = notes ? JSON.parse(notes)?.marketing_brief : null;
    return {
      discovery: migrateSection(b?.discovery),
      concept: migrateSection(b?.concept),
    };
  } catch {
    return { discovery: {}, concept: {} };
  }
}

function parseAssets(notes?: string): AssetsState {
  try {
    const a = notes ? JSON.parse(notes)?.marketing_brief?.assets : null;
    if (!a) return emptyAssets();
    return { ...emptyAssets(), ...a };
  } catch {
    return emptyAssets();
  }
}

const toDateInput = (v?: { 'time.Time'?: string }) =>
  v?.['time.Time'] ? v['time.Time'].slice(0, 10) : '';

export function MarketingEditor({
  mode,
  campaign: initial,
}: {
  mode: 'create' | 'edit';
  campaign?: Campaign;
}) {
  const t = useTranslations('portal');
  const router = useRouter();
  const ws = useActiveWorkspace();
  const [section, setSection] = useState<SectionKey>('discovery');
  const [products, setProducts] = useState<Product[] | null>(null);
  const [productId, setProductId] = useState(initial?.product_id ?? '');
  const [brief, setBrief] = useState<BriefState>(parseBrief(initial?.notes));
  const [assets, setAssets] = useState<AssetsState>(
    parseAssets(initial?.notes)
  );
  const [landingId, setLandingId] = useState<string | undefined>(
    initial?.landing_page_id ?? undefined
  );
  const [campaign, setCampaign] = useState<CampaignState>({
    name: initial?.name ?? '',
    objective:
      (initial?.objective as CampaignState['objective']) ?? 'conversion',
    channels: initial?.channels ?? [],
    budget: initial?.budget_amount ? String(initial.budget_amount) : '',
    currency: initial?.budget_currency ?? 'VND',
    startDate: toDateInput(initial?.start_date),
    endDate: toDateInput(initial?.end_date),
  });
  const [saving, setSaving] = useState(false);
  const [showErrors, setShowErrors] = useState(false);
  const [aiOpen, setAiOpen] = useState(false);
  const [reportId, setReportId] = useState<string | undefined>(
    parseReportId(initial?.notes)
  );
  const [handoff, setHandoff] = useState<InsightHandoff | undefined>(
    parseHandoff(initial?.notes)
  );
  const [summary, setSummary] = useState<InsightSummary | undefined>(
    parseSummary(initial?.notes)
  );
  // ID report vừa chạy phiên này → chỉ auto-mở popup cho report mới, không
  // bung lại mỗi lần vào lại trang.
  const [freshReportId, setFreshReportId] = useState<string | undefined>();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    rexerApi.products
      .list({ limit: 50 })
      .then(r => {
        setProducts(r.items ?? []);
        if (mode === 'create' && r.items?.[0]) setProductId(r.items[0].id);
      })
      .catch(() => setProducts([]));
  }, [mode]);

  const product = products?.find(p => p.id === productId);

  // Notes = nguồn lưu duy nhất cho brief/assets + liên kết AI-Insights.
  const buildNotes = (over?: {
    reportId?: string;
    handoff?: InsightHandoff;
    summary?: InsightSummary;
  }) =>
    JSON.stringify({
      marketing_brief: { ...brief, assets },
      insight_report_id: over?.reportId ?? reportId,
      insight_handoff: over?.handoff ?? handoff,
      insight_summary: over?.summary ?? summary,
    });

  const handleSave = async () => {
    if (!campaign.name.trim() || !productId) {
      toast.error(t('marketingEditor.needNameProduct'));
      setSection('campaign');
      return;
    }
    setSaving(true);
    const body = {
      name: campaign.name.trim(),
      brand_id: product?.brand_id,
      objective: campaign.objective,
      channels: campaign.channels.length ? campaign.channels : undefined,
      budget_amount: campaign.budget ? Number(campaign.budget) : undefined,
      budget_currency: campaign.budget ? campaign.currency : undefined,
      start_date: campaign.startDate || undefined,
      end_date: campaign.endDate || undefined,
      landing_page_id: landingId,
      notes: buildNotes(),
    };
    try {
      if (mode === 'create') {
        await rexerApi.campaigns.create({
          ...body,
          product_id: productId,
          status: 'active',
        });
        toast.success(
          t('marketingEditor.createdToast', { name: campaign.name.trim() })
        );
      } else if (initial) {
        await rexerApi.campaigns.update(initial.id, body);
        toast.success(t('marketingEditor.savedToast'));
      }
      router.push('/portal/marketing');
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : t('marketingEditor.saveFailed')
      );
    } finally {
      setSaving(false);
    }
  };

  const handleReportStarted = async (id: string) => {
    setReportId(id);
    setFreshReportId(id); // report mới → popup auto-mở 1 lần
    setSection('insights'); // nhảy sang tab kết quả
    // Edit mode: ghi luôn vào notes để không mất khi rời trang chưa bấm Lưu.
    if (mode === 'edit' && initial) {
      try {
        await rexerApi.campaigns.update(initial.id, {
          notes: buildNotes({ reportId: id }),
        });
      } catch {
        // notes sẽ được ghi lại khi user bấm Lưu — không chặn flow.
      }
    }
  };

  // Tóm tắt kết quả AI (goal/journey/blocks) → lưu vào notes cho list card +
  // panel hiện ngay không cần poll. Edit mode PATCH luôn.
  const handleSummary = async (s: InsightSummary) => {
    setSummary(s);
    if (mode === 'edit' && initial) {
      try {
        await rexerApi.campaigns.update(initial.id, {
          notes: buildNotes({ summary: s }),
        });
      } catch {
        /* ghi lại khi bấm Lưu */
      }
    }
  };

  const handleHandoff = async (h: InsightHandoff) => {
    setHandoff(h);
    if (mode === 'edit' && initial) {
      try {
        await rexerApi.campaigns.update(initial.id, {
          notes: buildNotes({ handoff: h }),
        });
      } catch {
        // ghi lại khi bấm Lưu.
      }
    }
  };

  // Continue đi tuần tự rail Discovery → Concept → Assets → Campaign, tới
  // Campaign thì Lưu/Tạo. Chặn sang step mới nếu section thiếu thông tin.
  const handleContinue = () => {
    if (section === 'discovery' || section === 'concept') {
      const missing = missingBriefFields(section, brief);
      if (missing.length) {
        setShowErrors(true);
        toast.error(
          t('marketingEditor.pleaseEnter', { fields: missing.join(', ') })
        );
        return;
      }
    }
    if (section === 'assets') {
      const total = (['image', 'video', '3d'] as const).reduce(
        (n, k) =>
          n +
          assets[k].items.length +
          assets[k].folders.reduce((m, f) => m + f.items.length, 0),
        0
      );
      if (total === 0) {
        toast.error(t('marketingEditor.needAsset'));
        return;
      }
    }
    setShowErrors(false);
    const i = STEP_FLOW.indexOf(section);
    if (i >= 0 && i < STEP_FLOW.length - 1) setSection(STEP_FLOW[i + 1]);
    else handleSave();
  };

  const handleDelete = async () => {
    if (!initial) return;
    setDeleting(true);
    try {
      await rexerApi.campaigns.remove(initial.id);
      toast.success(t('marketingEditor.deletedToast', { name: initial.name }));
      router.push('/portal/marketing');
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : t('marketingEditor.deleteFailed')
      );
      setDeleting(false);
    }
  };

  return (
    <div className='bg-background flex min-h-[calc(100vh-57px)] flex-col'>
      <div className='border-border flex flex-wrap items-center justify-between gap-3 border-b px-6 py-3'>
        <div className='flex items-center gap-2'>
          <Button
            variant='ghost'
            size='sm'
            onClick={() => router.push('/portal/marketing')}
          >
            <ArrowLeft className='size-4' />
          </Button>
          <h1 className='text-foreground text-base font-semibold'>
            {mode === 'create'
              ? t('marketingEditor.createTitle')
              : (initial?.name ?? '')}
          </h1>
          <Button
            variant='outline'
            size='sm'
            className='text-xs'
            onClick={() => {
              setBrief(HAPPY_CITY_BRIEF);
              setCampaign(c => ({ ...c, ...HAPPY_CITY_CAMPAIGN }));
              setShowErrors(false);
              toast.success(t('marketingEditor.sampleFilledToast'));
            }}
          >
            <FlaskConical className='size-4' />{' '}
            {t('marketingEditor.fillSample')}
          </Button>
        </div>
        <div className='flex items-center gap-3'>
          {mode === 'edit' && (
            <button
              type='button'
              aria-label={t('marketingEditor.deleteAria')}
              onClick={() => setConfirmDelete(true)}
              className='text-destructive hover:bg-destructive/10 inline-flex size-9 items-center justify-center rounded-full transition-colors'
            >
              <Trash2 className='size-4' />
            </button>
          )}
          {/* Cụm pill liền khối theo design: Add more · AI-Assistant · Continue */}
          <div className='flex items-stretch overflow-hidden rounded-full'>
            <button
              type='button'
              onClick={() => router.push('/portal/marketing/new')}
              className='bg-muted text-foreground hover:bg-muted/70 inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold transition-colors'
            >
              <Plus className='bg-foreground text-background size-4 rounded-full p-0.5' />
              {t('marketingEditor.addMore')}
            </button>
            <button
              type='button'
              onClick={() => setAiOpen(true)}
              title={t('marketingEditor.aiAssistantTitle')}
              className='inline-flex items-center gap-1.5 bg-gradient-to-r from-sky-100 via-sky-50 to-emerald-50 px-4 text-sm font-semibold text-blue-600 transition-opacity hover:opacity-80'
            >
              <Sparkles className='size-4' /> AI-Assistant
            </button>
            <button
              type='button'
              onClick={handleContinue}
              disabled={saving}
              className='bg-primary text-primary-foreground hover:bg-primary/90 inline-flex items-center px-5 text-sm font-semibold transition-colors disabled:opacity-60'
            >
              {saving
                ? t('marketingEditor.saving')
                : section === LAST_STEP || section === 'insights'
                  ? mode === 'create'
                    ? t('marketingEditor.createCta')
                    : t('marketingEditor.saveCta')
                  : t('marketingEditor.continueCta')}
            </button>
          </div>
        </div>
      </div>

      <div className='flex flex-1'>
        <aside className='border-border bg-muted/20 w-56 shrink-0 border-r px-4 py-6'>
          <nav className='flex flex-col gap-7'>
            {RAIL_GROUPS.map((g, gi) => (
              <RailGroup key={g.label} label={t(g.label)} index={gi + 1}>
                {g.items.map((s, i) => (
                  <RailItem
                    key={s.key}
                    label={t(s.label)}
                    step={i + 1}
                    active={section === s.key}
                    onClick={() => setSection(s.key)}
                  />
                ))}
              </RailGroup>
            ))}
            {/* Nhóm AI — chỉ hiện khi đã chạy AI. */}
            {reportId && (
              <RailGroup label={t('marketingCampaignTabs.groupAi')}>
                <RailItem
                  label='AI-Insights'
                  active={section === 'insights'}
                  onClick={() => setSection('insights')}
                  icon={<Sparkles className='size-4 text-blue-600' />}
                />
              </RailGroup>
            )}
          </nav>
        </aside>

        <main className='flex-1 px-6 py-5'>
          {section === 'campaign' ? (
            <GeneralPanel campaign={campaign} onCampaignChange={setCampaign} />
          ) : section === 'product' ? (
            <ProductPanel
              mode={mode}
              products={products}
              productId={productId}
              onProductIdChange={setProductId}
              product={product}
            />
          ) : section === 'landing' ? (
            <LandingPanel
              brandId={product?.brand_id ?? initial?.brand_id}
              landingId={landingId}
              onLandingChange={setLandingId}
            />
          ) : section === 'insights' ? (
            // AI-Insights: kết quả AI đổ về (panel đầy đủ). Đọc summary từ notes
            // trước → hiện ngay, poll BE để cập nhật + cho generate lại.
            reportId ? (
              <InsightResultPanel
                reportId={reportId}
                brief={marketingToInsightInputs(brief, assets, campaign).inputs}
                workspaceId={ws?.id}
                handoff={handoff}
                summary={summary}
                autoOpenId={freshReportId}
                onHandoff={handleHandoff}
                onSummary={handleSummary}
              />
            ) : (
              <p className='text-content-muted text-sm'>
                {t('marketingEditor.noInsightsHint')}
              </p>
            )
          ) : (
            <StepMarketing
              section={section}
              brief={brief}
              onBriefChange={setBrief}
              assets={assets}
              onAssetsChange={setAssets}
              showErrors={showErrors}
            />
          )}
        </main>
      </div>

      <AiAssistantDialog
        open={aiOpen}
        onOpenChange={setAiOpen}
        brief={brief}
        assets={assets}
        campaign={campaign}
        productId={productId}
        product={product}
        campaignId={mode === 'edit' ? initial?.id : undefined}
        workspaceId={ws?.id}
        existingReportId={reportId}
        onStarted={handleReportStarted}
      />

      <Dialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <DialogContent className='max-w-sm'>
          <DialogHeader>
            <DialogTitle>{t('marketingEditor.deleteTitle')}</DialogTitle>
          </DialogHeader>
          <p className='text-content-muted text-sm'>
            {t('marketingEditor.deleteDesc', { name: initial?.name ?? '' })}
          </p>
          <DialogFooter>
            <Button variant='outline' onClick={() => setConfirmDelete(false)}>
              {t('marketingEditor.cancel')}
            </Button>
            <Button
              variant='destructive'
              onClick={handleDelete}
              disabled={deleting}
            >
              {deleting
                ? t('marketingEditor.deleting')
                : t('marketingEditor.delete')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

/** Nhóm cấp 1 trong rail: tiêu đề nhóm (caps, có số thứ tự) + list item nối
 *  bằng đường guide bên trái để thấy rõ phân cấp nhóm → mục. */
function RailGroup({
  label,
  index,
  children,
}: {
  label: string;
  index?: number;
  children: React.ReactNode;
}) {
  return (
    <div>
      <p className='text-content-muted mb-2 flex items-center gap-1.5 px-1 text-[10px] font-bold tracking-[0.14em] uppercase'>
        {index != null && (
          <span className='bg-foreground/10 flex size-4 items-center justify-center rounded text-[9px] font-bold'>
            {index}
          </span>
        )}
        {label}
      </p>
      <ul className='border-border ml-[7px] flex flex-col gap-0.5 border-l pl-2'>
        {children}
      </ul>
    </div>
  );
}

/** Mục cấp 2 trong rail: pill, có số thứ tự (theo mạch Continue) hoặc icon. */
function RailItem({
  label,
  step,
  active,
  onClick,
  icon,
}: {
  label: string;
  step?: number;
  active: boolean;
  onClick: () => void;
  icon?: React.ReactNode;
}) {
  return (
    <li>
      <button
        type='button'
        onClick={onClick}
        className={cn(
          'flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-sm transition-colors',
          active
            ? 'bg-background text-foreground font-medium shadow-sm'
            : 'text-content-muted hover:bg-background/60 hover:text-foreground'
        )}
      >
        {icon ??
          (step != null && (
            <span
              className={cn(
                'flex size-5 shrink-0 items-center justify-center rounded-full border text-[10px] font-semibold',
                active
                  ? 'border-foreground text-foreground'
                  : 'border-border text-content-muted'
              )}
            >
              {step}
            </span>
          ))}
        {label}
      </button>
    </li>
  );
}
