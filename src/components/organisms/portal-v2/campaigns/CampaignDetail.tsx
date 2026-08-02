'use client';

import { ArrowLeft, Check, Pencil } from 'lucide-react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/molecules/portal-v2/Button';
import {
  ProgressBar,
  StagePill,
} from '@/components/molecules/portal-v2/campaigns-form';
import { EmptyState } from '@/components/molecules/portal-v2/product-form';
import { AddItemModal } from '@/components/organisms/portal-v2/campaigns/AddItemModal';
import { CampaignBriefAside } from '@/components/organisms/portal-v2/campaigns/CampaignBriefAside';
import { CampaignItemModal } from '@/components/organisms/portal-v2/campaigns/CampaignItemModal';
import { CampaignWorkTable } from '@/components/organisms/portal-v2/campaigns/CampaignWorkTable';
import { CAMPAIGN_TYPES } from '@/lib/portal-v2/campaigns/constants';
import {
  blankItem,
  campExpCount,
  campProgress,
  deriveStage,
  fmtRange,
  impliedStatus,
  subjectName,
  syncItemStage,
  todayString,
} from '@/lib/portal-v2/campaigns/helpers';
import { applyDraft, toDraft } from '@/lib/portal-v2/campaigns/mapCampaign';
import type {
  CampaignDraft,
  CampaignItem,
  CampaignView,
} from '@/lib/portal-v2/campaigns/types';
import type { ExperienceView } from '@/lib/portal-v2/experiences/types';
import { updateCampaign } from '@/services/portal-v2/campaignBoard';
import { fetchCampaignProducts } from '@/services/portal-v2/campaignBoard';
import { fetchExperienceLibrary } from '@/services/portal-v2/experienceLibrary';

type CampaignDetailProps = {
  campaign: CampaignView;
  /** True when the board fell back to the brand-scoped ads endpoint. */
  degraded: boolean;
};

const LIST_HREF = '/portal-v2/campaigns';

/**
 * One campaign: its brief on the right, the work on the left.
 *
 * Every mutation on this screen — brief edits, a subject's stage, attaching an
 * experience — goes through one PATCH so `notes` is always written as a whole
 * (and always merged over `notesRest`, which is how `/portal/marketing` keeps
 * its AI-Insights keys).
 */
export const CampaignDetail = ({ campaign, degraded }: CampaignDetailProps) => {
  const t = useTranslations('portalV2.campaigns');

  const [saved, setSaved] = useState<CampaignView>(campaign);
  const [draft, setDraft] = useState<CampaignDraft>(() => toDraft(campaign));
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  const [productNames, setProductNames] = useState<Record<string, string>>({});
  const [products, setProducts] = useState<{ id: string; name: string }[]>([]);
  const [experiences, setExperiences] = useState<ExperienceView[]>([]);
  const [experiencesLoading, setExperiencesLoading] = useState(true);

  const [itemIndex, setItemIndex] = useState<number | null>(null);
  const [addOpen, setAddOpen] = useState(false);

  /* The catalogue names the subject rows, and the library names the chips. */
  useEffect(() => {
    let cancelled = false;
    void fetchCampaignProducts().then(res => {
      if (cancelled) return;
      setProducts(res.products);
      setProductNames(
        Object.fromEntries(res.products.map(p => [p.id, p.name]))
      );
    });
    void fetchExperienceLibrary()
      .then(res => {
        if (!cancelled) setExperiences(res.items);
      })
      .finally(() => {
        if (!cancelled) setExperiencesLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const stage = deriveStage(saved);
  const progress = campProgress(saved);
  const today = useMemo(todayString, []);

  const attachedProductIds = new Set(
    draft.items.filter(i => i.kind === 'product').map(i => i.productId)
  );
  const pickableProducts = products.filter(p => !attachedProductIds.has(p.id));

  /**
   * The single write path. Items are run through `syncItemStage` first, and a
   * live subject promotes the campaign — the derived half of the state machine
   * only ever materialises here, never on read.
   */
  const persist = async (next: CampaignDraft, successMessage: string) => {
    const items = next.items.map(syncItemStage);
    const implied = impliedStatus({ ...saved, items, status: next.status });
    const payload: CampaignDraft = {
      ...next,
      items,
      status: implied ?? next.status,
    };

    setSaving(true);
    try {
      const updated = await updateCampaign(
        saved.source,
        saved.id,
        payload,
        saved.notesRest
      );
      /* The ads endpoint echoes a thinner row than `/campaigns` — fold the
         payload back in so the screen never regresses to fewer fields. */
      const merged = applyDraft(updated, payload);
      setSaved(merged);
      setDraft(toDraft(merged));
      toast.success(successMessage);
      return true;
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t('toastSaveFailed'));
      return false;
    } finally {
      setSaving(false);
    }
  };

  const handleSaveBrief = async () => {
    if (!draft.name.trim()) {
      toast.error(t('errNameRequired'));
      return;
    }
    if (draft.startDate && draft.endDate && draft.endDate < draft.startDate) {
      toast.error(t('errEndBeforeStart'));
      return;
    }
    const ok = await persist(draft, t('toastSaved', { name: draft.name }));
    if (ok) setEditing(false);
  };

  const handleCancel = () => {
    setDraft(toDraft(saved));
    setEditing(false);
  };

  const handleSaveItem = async (item: CampaignItem) => {
    if (itemIndex === null) return;
    const items = draft.items.map((current, i) =>
      i === itemIndex ? item : current
    );
    const ok = await persist({ ...draft, items }, t('toastItemSaved'));
    if (ok) setItemIndex(null);
  };

  const handleDeleteItem = async (index: number) => {
    const items = draft.items.filter((_, i) => i !== index);
    const ok = await persist({ ...draft, items }, t('toastItemRemoved'));
    if (ok) setItemIndex(null);
  };

  const handleAddProduct = async (productId: string) => {
    const item = {
      ...blankItem(draft.items, 'product', draft.endDate),
      productId,
      owner: draft.owner,
    };
    const ok = await persist(
      { ...draft, items: [...draft.items, item] },
      t('toastItemAdded')
    );
    if (ok) setAddOpen(false);
  };

  const handleAddTopic = async (name: string) => {
    const item = {
      ...blankItem(draft.items, 'topic', draft.endDate),
      name,
      owner: draft.owner,
    };
    const ok = await persist(
      { ...draft, items: [...draft.items, item] },
      t('toastItemAdded')
    );
    if (ok) setAddOpen(false);
  };

  const activeItem = itemIndex === null ? null : draft.items[itemIndex];

  return (
    <div className='flex min-h-0 flex-col'>
      <div className='border-b border-[var(--pv2-hair)] bg-[var(--pv2-paper)]'>
        <div className='mx-auto flex w-full flex-wrap items-end justify-between gap-4 px-5 pt-6 pb-4 md:px-8'>
          <div className='min-w-0'>
            <h1 className='truncate font-[family-name:var(--pv2-disp)] text-[1.625rem] font-bold tracking-[-0.03em] text-[var(--pv2-ink)] md:text-[1.75rem]'>
              {saved.name}
            </h1>
            <p className='mt-1 text-[13.5px] leading-relaxed text-[var(--pv2-mut)]'>
              {t(CAMPAIGN_TYPES[saved.type].labelKey)} ·{' '}
              {fmtRange(saved, t('ongoing'))} · {saved.owner || t('unassigned')}
            </p>
          </div>

          <div className='flex shrink-0 flex-wrap items-center gap-2 pb-0.5'>
            <StagePill stage={stage} />
            <Button variant='ghost' asChild>
              <Link href={LIST_HREF}>
                <ArrowLeft
                  className='size-[15px]'
                  strokeWidth={2}
                  aria-hidden
                />
                {t('allCampaigns')}
              </Link>
            </Button>
            {editing ? (
              <>
                <Button
                  variant='ghost'
                  onClick={handleCancel}
                  disabled={saving}
                >
                  {t('cancel')}
                </Button>
                <Button
                  variant='primary'
                  onClick={handleSaveBrief}
                  disabled={saving}
                >
                  <Check
                    className='size-[15px]'
                    strokeWidth={2.4}
                    aria-hidden
                  />
                  {saving ? t('saving') : t('save')}
                </Button>
              </>
            ) : (
              <Button variant='primary' onClick={() => setEditing(true)}>
                <Pencil className='size-[15px]' strokeWidth={2} aria-hidden />
                {t('editCampaign')}
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className='mx-auto w-full px-5 py-6 md:px-8'>
        {degraded ? (
          <p className='mb-4 rounded-[var(--pv2-r)] border border-[var(--pv2-hair)] bg-[var(--pv2-paper)] px-4 py-3 text-[12.5px] text-[var(--pv2-mut)]'>
            {t('degradedNotice')}
          </p>
        ) : null}

        <div className='grid gap-[22px] xl:grid-cols-[minmax(0,1fr)_300px] xl:items-start'>
          <div className='min-w-0'>
            <h2 className='font-[family-name:var(--pv2-disp)] text-lg font-semibold tracking-[-0.02em] text-[var(--pv2-ink)]'>
              {t('workHeading')}
            </h2>
            <p className='mt-1 mb-3.5 text-[13px] leading-relaxed text-[var(--pv2-mut)]'>
              {t('workSub', {
                subjects: saved.items.length,
                experiences: campExpCount(saved),
                ready: progress.done,
              })}
            </p>

            <ProgressBar
              className='mb-4'
              thick
              done={progress.done}
              total={progress.total}
              pct={progress.pct}
            />

            {draft.items.length ? (
              <CampaignWorkTable
                items={draft.items}
                productNames={productNames}
                experiences={experiences}
                today={today}
                editing={editing}
                onOpenItem={setItemIndex}
                onDeleteItem={handleDeleteItem}
                onAddItem={() => setAddOpen(true)}
              />
            ) : (
              <EmptyState
                title={t('noSubjectsTitle')}
                action={
                  <Button variant='primary' onClick={() => setAddOpen(true)}>
                    {t('addSubject')}
                  </Button>
                }
              >
                {t('noSubjectsBody')}
              </EmptyState>
            )}
          </div>

          <CampaignBriefAside
            draft={draft}
            editing={editing}
            onChange={patch => setDraft(prev => ({ ...prev, ...patch }))}
          />
        </div>
      </div>

      {activeItem ? (
        <CampaignItemModal
          /* Remount per subject — the modal seeds its draft from the prop once. */
          key={activeItem.id}
          item={activeItem}
          subjectLabel={subjectName(activeItem, productNames)}
          campaignName={saved.name}
          experiences={experiences}
          experiencesLoading={experiencesLoading}
          saving={saving}
          onClose={() => setItemIndex(null)}
          onSave={handleSaveItem}
          onDelete={() => {
            if (itemIndex !== null) void handleDeleteItem(itemIndex);
          }}
        />
      ) : null}

      {addOpen ? (
        <AddItemModal
          products={pickableProducts}
          onClose={() => setAddOpen(false)}
          onAddProduct={id => void handleAddProduct(id)}
          onAddTopic={name => void handleAddTopic(name)}
        />
      ) : null}
    </div>
  );
};
