'use client';

import { ArrowLeft, Check, Pencil, Trash2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';

import { addCampaignItem } from '@/services/portal-v2/campaignBoardV2';

import { Button } from '@/components/molecules/portal-v2/Button';
import { cn } from '@/lib/cn';
import {
  HealthBadge,
  StagePill,
} from '@/components/molecules/portal-v2/campaigns-form';
import { AddItemModal } from '@/components/organisms/portal-v2/campaigns/AddItemModal';
import { CampaignItemModal } from '@/components/organisms/portal-v2/campaigns/CampaignItemModal';
import { RouteJourneyModal } from '@/components/organisms/portal-v2/campaigns/RouteJourneyModal';
import { BuildPhase } from '@/components/organisms/portal-v2/campaigns/detail/BuildPhase';
import { LearnPhase } from '@/components/organisms/portal-v2/campaigns/detail/LearnPhase';
import { PhaseStrip } from '@/components/organisms/portal-v2/campaigns/detail/PhaseStrip';
import { PlanPhase } from '@/components/organisms/portal-v2/campaigns/detail/PlanPhase';
import { RunPhase } from '@/components/organisms/portal-v2/campaigns/detail/RunPhase';
import { campaignTypeStyle } from '@/lib/portal-v2/campaigns/constants';
import {
  applyDraft,
  deriveStage,
  fmtRange,
  journeyOriginOf,
  subjectName,
  subjectRef,
  syncItemStage,
  toDraft,
} from '@/lib/portal-v2/campaigns/helpers';
import {
  subjectLane,
  subjectLensFromLane,
  type CampaignSubjectLens,
} from '@/lib/portal-v2/campaigns/subjectLane';
import { JourneyEditor } from '@/components/organisms/portal-v2/journeys/editor/JourneyEditor';
import {
  blueprintJourneys,
  journeyForCampaign,
} from '@/lib/portal-v2/campaigns/journeyLink';
import {
  experienceCopyId,
  forkExperience,
} from '@/lib/portal-v2/campaigns/mock';
import { campPhase } from '@/lib/portal-v2/campaigns/phases';
import { campReadiness } from '@/lib/portal-v2/campaigns/readiness';
import type {
  CampaignDraft,
  CampaignExperience,
  CampaignGap,
  CampaignItem,
  CampaignPhase,
  CampaignView,
} from '@/lib/portal-v2/campaigns/types';
import { campHealth, campVerdict } from '@/lib/portal-v2/campaigns/verdict';
import type { Journey } from '@/lib/portal-v2/journeys/types';

type CampaignDetailProps = {
  campaign: CampaignView;
  journeys: Journey[];
  experiences: CampaignExperience[];
  products: { id: string; name: string }[];
  productNames: Record<string, string>;
  today: string;
  onChange: (next: CampaignView) => void;
  onBack: () => void;
  onDelete: () => void;
  onRouteJourney: (blueprintId: string) => void;
  onCarryRoute: () => void;
  onEnsureExperiences: (copies: CampaignExperience[]) => void;
  onPatchExperience: (id: string, patch: Partial<CampaignExperience>) => void;
  onPromoteJourney: () => void;
  onJourneyChange: (next: Journey) => void;
};

/**
 * One campaign, across its whole life: Plan, Build, Run, Learn.
 *
 * The four phases are views on the same object, not four screens — the strip
 * changes what is emphasised, never what is true. Which phase opens first is
 * derived from where the work actually is, so a live campaign lands on its
 * numbers and a draft lands on its gate.
 */
export const CampaignDetail = ({
  campaign,
  journeys,
  experiences,
  products,
  productNames,
  today,
  onChange,
  onBack,
  onDelete,
  onRouteJourney,
  onCarryRoute,
  onEnsureExperiences,
  onPatchExperience,
  onPromoteJourney,
  onJourneyChange,
}: CampaignDetailProps) => {
  const t = useTranslations('portalV2.campaigns');

  const derivedPhase = campPhase(campaign, experiences, journeys);
  const [phase, setPhase] = useState<CampaignPhase>(derivedPhase);

  const [draft, setDraft] = useState<CampaignDraft>(() => toDraft(campaign));
  const [editing, setEditing] = useState(false);
  const [itemIndex, setItemIndex] = useState<number | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [routeOpen, setRouteOpen] = useState(false);
  const [journeyLens, setJourneyLens] = useState<{
    itemIndex: number;
    focusNodeId: string | null;
  } | null>(null);
  /** Full route editor after leaving subject lens (demo `jedlens:edit`). */
  const [editingRoute, setEditingRoute] = useState(false);

  const stage = deriveStage(campaign);
  const readiness = useMemo(
    () => campReadiness(campaign, experiences, journeys),
    [campaign, experiences, journeys]
  );
  const verdict = useMemo(
    () => campVerdict(campaign, experiences),
    [campaign, experiences]
  );
  const health = useMemo(
    () => campHealth(campaign, experiences, today, journeys),
    [campaign, experiences, today, journeys]
  );

  const journey = journeyForCampaign(journeys, campaign);
  const journeyOrigin = journeyOriginOf(campaign);
  const blueprint = journeyOrigin
    ? (journeys.find(j => j.id === journeyOrigin) ?? null)
    : null;

  const attachedProductIds = new Set(
    campaign.items.filter(i => i.kind === 'product').map(i => i.productId)
  );
  const pickableProducts = products.filter(p => !attachedProductIds.has(p.id));

  /** Fold the campaign forward — items resync, and a live subject promotes it. */
  const commit = (next: CampaignDraft, message: string) => {
    const updated = applyDraft(campaign, next);
    onChange(updated);
    setDraft(toDraft(updated));
    toast.success(message);
    return updated;
  };

  const handleSaveBrief = () => {
    if (!draft.name.trim()) {
      toast.error(t('errNameRequired'));
      return;
    }
    if (draft.startDate && draft.endDate && draft.endDate < draft.startDate) {
      toast.error(t('errEndBeforeStart'));
      return;
    }
    commit(draft, t('toastSaved', { name: draft.name.trim() }));
    setEditing(false);
  };

  const handleCancelEdit = () => {
    setDraft(toDraft(campaign));
    setEditing(false);
  };

  const handleSaveItem = (item: CampaignItem) => {
    const items = campaign.items.map((current, i) =>
      i === itemIndex ? item : current
    );
    commit({ ...toDraft(campaign), items }, t('toastItemSaved'));
    setItemIndex(null);
  };

  const handleDeleteItem = (index: number) => {
    const items = campaign.items.filter((_, i) => i !== index);
    commit({ ...toDraft(campaign), items }, t('toastItemRemoved'));
    setItemIndex(null);
  };

  /**
   * Thêm hạng mục — gọi `POST /campaigns/{id}/items`.
   *
   * KHÔNG đi qua `commit`: `PUT /campaigns` không có trường `items`, nên gộp
   * vào đó là im lặng đánh rơi hạng mục vừa thêm. Id cũng do server cấp.
   */
  const handleAddItem = async (
    kind: 'product' | 'topic',
    value: string
  ): Promise<void> => {
    setAddOpen(false);
    const item = await addCampaignItem(campaign.id, kind, value, {
      due: campaign.endDate,
    }).catch(() => null);
    if (!item) {
      toast.error(t('toastItemAddFailed'));
      return;
    }
    onChange({ ...campaign, items: [...campaign.items, item] });
    toast.success(t('toastItemAdded'));
  };

  /**
   * Forking a master onto a subject. The copy id is derived, so the modal can
   * attach it immediately and the workspace only has to make the record exist.
   */
  const handleAttachMaster = (item: CampaignItem) => (masterId: string) => {
    const ref = subjectRef(item);
    const copyId = experienceCopyId(masterId, campaign.id, ref);
    const master = experiences.find(e => e.id === masterId);

    if (master && !experiences.some(e => e.id === copyId)) {
      onEnsureExperiences([
        forkExperience(
          master,
          campaign.id,
          campaign.name,
          ref,
          subjectName(item, productNames) || ref
        ),
      ]);
    }
    return copyId;
  };

  const attachMasterToItem = (
    item: CampaignItem,
    masterId: string
  ): CampaignItem => {
    const copyId = handleAttachMaster(item)(masterId);
    if (item.expIds.includes(copyId)) return item;
    return syncItemStage({ ...item, expIds: [...item.expIds, copyId] });
  };

  const handleAdaptExperience = (experienceId: string) => {
    onPatchExperience(experienceId, { adapted: true });
    toast.success(t('journeyLensAdapted'));
  };

  const handleOpenSubjectJourney = (index: number, nodeId?: string) => {
    if (!journey) {
      toast.error(t('journeyLensNoRoute'));
      setPhase('plan');
      setRouteOpen(true);
      return;
    }
    setEditingRoute(false);
    setJourneyLens({ itemIndex: index, focusNodeId: nodeId ?? null });
  };

  const handleEditJourneyFromLens = () => {
    setJourneyLens(null);
    setEditingRoute(true);
    toast.warning(t('journeyLensEditBlast', { count: campaign.items.length }));
  };

  const handleCloseJourneyEditor = () => {
    setJourneyLens(null);
    setEditingRoute(false);
  };

  const handleLensNodeActivate = (nodeId: string) => {
    if (!journeyLens) return;
    const item = campaign.items[journeyLens.itemIndex];
    if (!item) return;

    const lane = subjectLane(campaign, item, journeys, experiences);
    const card = lane.cards.find(c => c.node.id === nodeId);
    if (!card || card.node.kind !== 'experience' || !card.node.x) return;

    if (card.fit === 'open') {
      const next = attachMasterToItem(item, card.node.x);
      const items = campaign.items.map((current, i) =>
        i === journeyLens.itemIndex ? next : current
      );
      commit({ ...toDraft(campaign), items }, t('journeyLensBuilt'));
      return;
    }

    if (card.fit === 'shared') {
      const next = attachMasterToItem(item, card.node.x);
      const items = campaign.items.map((current, i) =>
        i === journeyLens.itemIndex ? next : current
      );
      commit({ ...toDraft(campaign), items }, t('journeyLensForked'));
      return;
    }

    if (card.fit === 'edit' && card.mine) {
      handleAdaptExperience(card.mine.id);
      return;
    }

    if (card.mine) {
      setItemIndex(journeyLens.itemIndex);
    }
  };

  const lensItem =
    journeyLens === null
      ? null
      : (campaign.items[journeyLens.itemIndex] ?? null);

  const subjectLens: CampaignSubjectLens | null = useMemo(() => {
    if (!lensItem) return null;
    const lane = subjectLane(campaign, lensItem, journeys, experiences);
    return subjectLensFromLane(
      subjectName(lensItem, productNames) || t('untitledSubject'),
      lane
    );
  }, [campaign, lensItem, journeys, experiences, productNames, t]);

  /** A gap in the plan gate knows which screen closes it. */
  const handleFixGap = (gap: CampaignGap) => {
    if (gap.fix.kind === 'brief') {
      setPhase('plan');
      setEditing(true);
      return;
    }
    if (gap.fix.kind === 'journey') {
      setRouteOpen(true);
      return;
    }
    if (gap.fix.kind === 'addItem') {
      setPhase('build');
      setAddOpen(true);
      return;
    }
    setPhase('build');
    setItemIndex(gap.fix.index);
  };

  const activeItem = itemIndex === null ? null : campaign.items[itemIndex];

  return (
    <div className='flex min-h-0 flex-col'>
      <div className='border-b border-[var(--pv2-hair)]'>
        <div className='pv2-page-header'>
          <div className='mx-auto w-full px-5 pt-5 md:px-8'>
            <button
              type='button'
              onClick={onBack}
              className={cn(
                'inline-flex cursor-pointer items-center gap-1.5 rounded-[var(--pv2-r)] px-1 py-1',
                'text-[12.5px] font-semibold text-[var(--pv2-mut)] transition-colors',
                'hover:text-[var(--pv2-ink)]',
                'focus-visible:ring-2 focus-visible:ring-[var(--pv2-electric)] focus-visible:outline-none'
              )}
            >
              <ArrowLeft
                className='size-3.5 shrink-0'
                strokeWidth={2.2}
                aria-hidden
              />
              {t('allCampaigns')}
            </button>
          </div>

          <div className='mx-auto flex w-full flex-wrap items-start justify-between gap-x-6 gap-y-4 px-5 pt-3 pb-4 md:px-8'>
            <div className='min-w-0 flex-1'>
              <div className='flex flex-wrap items-center gap-2'>
                <StagePill stage={stage} />
                <HealthBadge health={health} />
              </div>
              <h1 className='mt-2 truncate font-[family-name:var(--pv2-disp)] text-[1.625rem] font-bold tracking-[-0.03em] text-[var(--pv2-ink)] md:text-[1.75rem]'>
                {campaign.name}
              </h1>
              <p className='mt-1 text-[13.5px] leading-relaxed text-[var(--pv2-mut)]'>
                {t(campaignTypeStyle(campaign.type).labelKey)} ·{' '}
                {fmtRange(campaign, t('ongoing'))} ·{' '}
                {campaign.owner || t('unassigned')}
              </p>
              {campaign.brief.objective ? (
                <p className='mt-2 max-w-[70ch] border-l-2 border-[var(--pv2-electric)] pl-3 text-[12.5px] leading-relaxed text-[var(--pv2-mut)]'>
                  {campaign.brief.objective}
                </p>
              ) : null}
            </div>

            <div className='flex shrink-0 flex-wrap items-center gap-2 pt-1'>
              {editing ? (
                <>
                  <Button variant='ghost' onClick={handleCancelEdit}>
                    {t('cancel')}
                  </Button>
                  <Button variant='primary' onClick={handleSaveBrief}>
                    <Check
                      className='size-[15px]'
                      strokeWidth={2.4}
                      aria-hidden
                    />
                    {t('save')}
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    variant='ghost'
                    onClick={onDelete}
                    aria-label={t('rowDeleteAria', { name: campaign.name })}
                    className='text-[var(--pv2-error)] hover:border-[color-mix(in_srgb,var(--pv2-error)_35%,transparent)] hover:bg-[color-mix(in_srgb,var(--pv2-error)_8%,transparent)] hover:text-[var(--pv2-error)]'
                  >
                    <Trash2
                      className='size-[15px]'
                      strokeWidth={2}
                      aria-hidden
                    />
                    {t('rowDelete')}
                  </Button>
                  <Button
                    variant='primary'
                    onClick={() => {
                      setPhase('plan');
                      setEditing(true);
                    }}
                  >
                    <Pencil
                      className='size-[15px]'
                      strokeWidth={2}
                      aria-hidden
                    />
                    {t('editCampaign')}
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>

        <div className='mx-auto w-full overflow-x-auto border-t border-[var(--pv2-hair)] bg-[var(--pv2-paper)] px-5 py-3 md:px-8'>
          <PhaseStrip
            derived={derivedPhase}
            active={phase}
            onSelect={setPhase}
          />
        </div>
      </div>

      <div className='mx-auto w-full px-5 py-6 md:px-8'>
        {phase === 'plan' ? (
          <PlanPhase
            campaign={campaign}
            draft={draft}
            editing={editing}
            readiness={readiness}
            finished={stage === 'done'}
            experiences={experiences}
            journeys={journeys}
            journey={journey}
            blueprint={blueprint}
            onDraftChange={patch => setDraft(prev => ({ ...prev, ...patch }))}
            onFixGap={handleFixGap}
            onRoute={() => setRouteOpen(true)}
            onCarryRoute={onCarryRoute}
          />
        ) : null}

        {phase === 'build' ? (
          <BuildPhase
            campaign={campaign}
            experiences={experiences}
            journeys={journeys}
            productNames={productNames}
            journeyName={journey?.name ?? null}
            today={today}
            editing
            onOpenItem={setItemIndex}
            onOpenSubjectJourney={handleOpenSubjectJourney}
            onDeleteItem={handleDeleteItem}
            onAddItem={() => setAddOpen(true)}
          />
        ) : null}

        {phase === 'run' ? (
          <RunPhase
            campaign={campaign}
            verdict={verdict}
            health={health}
            productNames={productNames}
          />
        ) : null}

        {phase === 'learn' ? (
          <LearnPhase
            campaign={campaign}
            verdict={verdict}
            journey={journey}
            onPromoteJourney={onPromoteJourney}
          />
        ) : null}
      </div>

      {activeItem ? (
        <CampaignItemModal
          /* Remount per subject — the modal seeds its draft from the prop once. */
          key={activeItem.id}
          item={activeItem}
          subjectLabel={subjectName(activeItem, productNames)}
          campaignName={campaign.name}
          experiences={experiences}
          onClose={() => setItemIndex(null)}
          onSave={handleSaveItem}
          onDelete={() => handleDeleteItem(itemIndex ?? 0)}
          onAttachMaster={handleAttachMaster(activeItem)}
          onAdaptExperience={handleAdaptExperience}
        />
      ) : null}

      {addOpen ? (
        <AddItemModal
          products={pickableProducts}
          onClose={() => setAddOpen(false)}
          onAddProduct={id => handleAddItem('product', id)}
          onAddTopic={name => handleAddItem('topic', name)}
        />
      ) : null}

      {routeOpen ? (
        <RouteJourneyModal
          campaignName={campaign.name}
          blueprints={blueprintJourneys(journeys)}
          currentOrigin={journeyOrigin}
          replacing={Boolean(journey)}
          onClose={() => setRouteOpen(false)}
          onPick={blueprintId => {
            onRouteJourney(blueprintId);
            setRouteOpen(false);
          }}
        />
      ) : null}

      {journey && (editingRoute || (journeyLens !== null && subjectLens)) ? (
        <JourneyEditor
          key={
            editingRoute
              ? `${journey.id}-structure`
              : `${journey.id}-${journeyLens!.itemIndex}`
          }
          journey={journey}
          journeys={journeys}
          lens={editingRoute || !subjectLens ? undefined : subjectLens}
          initialNodeId={
            editingRoute ? null : (journeyLens?.focusNodeId ?? null)
          }
          returnLabel={t('journeyLensBack')}
          onLensNodeActivate={editingRoute ? undefined : handleLensNodeActivate}
          onEditJourney={editingRoute ? undefined : handleEditJourneyFromLens}
          onCancel={handleCloseJourneyEditor}
          onPersist={onJourneyChange}
          onSave={next => {
            onJourneyChange(next);
            handleCloseJourneyEditor();
            toast.success(t('toastSaved', { name: campaign.name }));
          }}
        />
      ) : null}
    </div>
  );
};
