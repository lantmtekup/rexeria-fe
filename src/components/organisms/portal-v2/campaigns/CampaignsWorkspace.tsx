'use client';

import { Plus } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';

import {
  createCampaign as createCampaignApi,
  deleteCampaigns as deleteCampaignsApi,
  duplicateCampaign as duplicateCampaignApi,
  fetchCampaignDetail,
  saveCampaign,
} from '@/services/portal-v2/campaignBoardV2';

import { Button } from '@/components/molecules/portal-v2/Button';
import { Tabs } from '@/components/molecules/portal-v2/Tabs';
import { EmptyState } from '@/components/molecules/portal-v2/product-form';
import { CampaignBulkBar } from '@/components/organisms/portal-v2/campaigns/CampaignBulkBar';
import { CampaignDetail } from '@/components/organisms/portal-v2/campaigns/CampaignDetail';
import { CampaignGrid } from '@/components/organisms/portal-v2/campaigns/CampaignGrid';
import { CampaignTable } from '@/components/organisms/portal-v2/campaigns/CampaignTable';
import { CampaignToolbar } from '@/components/organisms/portal-v2/campaigns/CampaignToolbar';
import { DeleteCampaignModal } from '@/components/organisms/portal-v2/campaigns/DeleteCampaignModal';
import { NewCampaignWizard } from '@/components/organisms/portal-v2/campaigns/NewCampaignWizard';
import {
  CAMPAIGN_DEFAULT_FILTERS,
  CAMPAIGN_STAGES,
  CAMPAIGN_STAGE_ORDER,
  CAMPAIGN_TEAM,
} from '@/lib/portal-v2/campaigns/constants';
import {
  countByStage,
  deleteCampaigns,
  findCampaign,
  replaceCampaign,
  todayString,
  visibleCampaigns,
} from '@/lib/portal-v2/campaigns/helpers';
import {
  readCampaignIdParam,
  writeCampaignIdParam,
} from '@/lib/portal-v2/campaigns/idParam';
import {
  bindRouteToItems,
  ensureCampaignExperiences,
  ensureCampaignJourneys,
  routeJourneyOntoCampaign,
  seedExperiences,
} from '@/lib/portal-v2/campaigns/journeyLink';
import {
  CAMPAIGN_PRODUCTS,
  CAMPAIGN_PRODUCT_NAMES,
} from '@/lib/portal-v2/campaigns/mock';
import type {
  CampaignExperience,
  CampaignFilters,
  CampaignStage,
  CampaignView,
  CampaignWizard,
} from '@/lib/portal-v2/campaigns/types';
import { wizardDraft } from '@/lib/portal-v2/campaigns/wizard';
import { cloneJourneys, MOCK_JOURNEYS } from '@/lib/portal-v2/journeys/mock';
import type { Journey } from '@/lib/portal-v2/journeys/types';

type CampaignsWorkspaceProps = {
  /** `?id=` — the campaign to open on arrival, so the screen is shareable. */
  initialCampaignId: string | null;
  /** Chiến dịch THẬT — `GET /v1/campaigns`, đã lọc theo brand. */
  initialCampaigns: CampaignView[];
  /** Nạp hỏng ⇒ nói ra, đừng để đọc như "chưa có chiến dịch nào". */
  initialError?: string | null;
};

/**
 * The Campaigns workspace — the list and one open campaign, in one state tree.
 *
 * The detail is not a route. A campaign, its journey fork and its experience
 * copies are one object graph: routing a blueprint mints a journey, carrying the
 * route mints experiences, and shipping a subject promotes the campaign. Putting
 * the detail behind its own server route would re-read the seed on every
 * navigation and throw all of that away, which is why the prototype keeps both
 * on one screen too.
 */
export const CampaignsWorkspace = ({
  initialCampaignId,
  initialCampaigns,
  initialError = null,
}: CampaignsWorkspaceProps) => {
  const t = useTranslations('portalV2.campaigns');

  // Dữ liệu THẬT từ `GET /v1/campaigns`. Danh sách không kèm `items[]` — chỉ
  // `items_count` — nên chi tiết nạp riêng khi mở.
  const [campaigns, setCampaigns] = useState<CampaignView[]>(
    () => initialCampaigns
  );
  const [loadError] = useState<string | null>(initialError);

  /**
   * Journeys and experiences are seeded from the campaigns that claim them: the
   * seed says `m4` runs `j-j1-m4` and its subject carries a copy of `e4`, and
   * these two calls make both true before anything renders.
   */
  // Journeys và experiences CHƯA ráp API — vẫn là mock, gieo từ chính danh
  // sách chiến dịch thật để liên kết không trỏ vào hư không.
  const [journeys, setJourneys] = useState<Journey[]>(() =>
    ensureCampaignJourneys(cloneJourneys(MOCK_JOURNEYS), initialCampaigns)
  );
  const [experiences, setExperiences] = useState<CampaignExperience[]>(() =>
    ensureCampaignExperiences(
      seedExperiences(),
      initialCampaigns,
      CAMPAIGN_PRODUCT_NAMES
    )
  );

  const [openId, setOpenId] = useState<string | null>(() =>
    initialCampaignId && findCampaign(initialCampaigns, initialCampaignId)
      ? initialCampaignId
      : null
  );
  const [filters, setFilters] = useState<CampaignFilters>(
    CAMPAIGN_DEFAULT_FILTERS
  );
  const [selected, setSelected] = useState<string[]>([]);
  const [wizardOpen, setWizardOpen] = useState(false);
  const [deleteIds, setDeleteIds] = useState<string[] | null>(null);

  const today = useMemo(todayString, []);

  /* Keep the address bar in step without re-running the server page. */
  useEffect(() => {
    writeCampaignIdParam(openId);
  }, [openId]);

  /** A campaign opened from elsewhere in the portal, after this mounted. */
  useEffect(() => {
    const handlePop = () => {
      const params = Object.fromEntries(
        new URL(window.location.href).searchParams.entries()
      );
      setOpenId(readCampaignIdParam(params));
    };
    window.addEventListener('popstate', handlePop);
    return () => window.removeEventListener('popstate', handlePop);
  }, []);

  const open = openId ? findCampaign(campaigns, openId) : null;

  const visible = useMemo(
    () => visibleCampaigns(campaigns, filters),
    [campaigns, filters]
  );

  const stageTabs = useMemo(
    () => [
      { id: 'all', label: t('tabAll'), count: campaigns.length },
      ...CAMPAIGN_STAGE_ORDER.map(stage => ({
        id: stage,
        label: t(CAMPAIGN_STAGES[stage].labelKey),
        count: countByStage(campaigns, stage),
      })),
    ],
    [campaigns, t]
  );

  const patchFilters = (partial: Partial<CampaignFilters>) => {
    setFilters(prev => ({ ...prev, ...partial }));
    /* A changed facet invalidates the selection; a view swap does not. */
    if (!('view' in partial)) setSelected([]);
  };

  /**
   * Mở một chiến dịch ⇒ nạp chi tiết.
   *
   * `GET /campaigns` chỉ trả `items_count`, KHÔNG trả `items[]`. Vẽ thẳng bản
   * ghi của danh sách sẽ hiện "0 hạng mục" cho một chiến dịch có 3 — nên phải
   * gọi `GET /campaigns/{id}` rồi thay vào.
   */
  useEffect(() => {
    if (!openId) return;
    let alive = true;
    void fetchCampaignDetail(openId).then(detail => {
      if (alive && detail) setCampaigns(prev => replaceCampaign(prev, detail));
    });
    return () => {
      alive = false;
    };
  }, [openId]);

  /**
   * Sửa brief/ngân sách/kênh — ghi lạc quan rồi PUT. Hỏng thì trả về bản cũ,
   * vì để màn hình giữ giá trị chưa lưu là nói dối về thứ đang có trên server.
   */
  const handleChange = useCallback(
    (next: CampaignView) => {
      const before = campaigns.find(c => c.id === next.id);
      setCampaigns(prev => replaceCampaign(prev, next));
      void saveCampaign(next).catch(() => {
        if (before) setCampaigns(prev => replaceCampaign(prev, before));
        toast.error(t('toastSaveFailed'));
      });
    },
    [campaigns, t]
  );

  const handleCreate = async (wizard: CampaignWizard) => {
    const draft = wizardDraft(wizard);
    const saved = await createCampaignApi(draft).catch(() => null);
    if (!saved) {
      toast.error(t('toastCreateFailed'));
      return;
    }
    // Id do SERVER cấp, không phải `nextCampaignId` đếm trong mảng — id bịa ở
    // FE sẽ trỏ vào hư không ngay lần tải lại trang đầu tiên.
    const id = saved.id;
    const created = saved;

    if (wizard.journeyId) {
      const routed = routeJourneyOntoCampaign(
        created,
        journeys,
        experiences,
        wizard.journeyId,
        CAMPAIGN_PRODUCT_NAMES
      );
      setJourneys(routed.journeys);
      setExperiences(routed.experiences);
      setCampaigns(prev => [routed.campaign, ...prev]);
    } else {
      setCampaigns(prev => [created, ...prev]);
    }

    setWizardOpen(false);
    setFilters(CAMPAIGN_DEFAULT_FILTERS);
    setSelected([]);
    setOpenId(id);
    toast.success(t('toastCreated', { name: created.name }));
  };

  const handleDuplicate = async (id: string) => {
    const copy = await duplicateCampaignApi(id).catch(() => null);
    if (!copy) {
      toast.error(t('toastDuplicateFailed'));
      return;
    }
    const result = { campaign: copy, list: [copy, ...campaigns] };

    setCampaigns(result.list);
    setJourneys(prev => ensureCampaignJourneys(prev, [result.campaign]));
    setExperiences(prev =>
      ensureCampaignExperiences(prev, [result.campaign], CAMPAIGN_PRODUCT_NAMES)
    );
    setSelected([]);
    toast.success(t('toastDuplicated', { name: result.campaign.name }));
  };

  const handleDelete = async () => {
    if (!deleteIds?.length) return;
    const failed = await deleteCampaignsApi(deleteIds);
    if (failed.length) {
      toast.error(t('toastDeleteFailed', { count: failed.length }));
      if (failed.length === deleteIds.length) {
        setDeleteIds(null);
        return;
      }
    }
    // Chỉ bỏ khỏi màn hình những id server ĐÃ xoá.
    const removed = deleteIds.filter(x => !failed.includes(x));
    /* The journey forks and experience copies go with them — the blueprints and
       library masters they came from are untouched. */
    setJourneys(prev => prev.filter(j => !removed.includes(j.campaign ?? '')));
    setExperiences(prev =>
      prev.filter(e => !removed.includes(e.campaign ?? ''))
    );
    setCampaigns(prev => deleteCampaigns(prev, removed));
    if (openId && removed.includes(openId)) setOpenId(null);
    setDeleteIds(null);
    setSelected([]);
    if (removed.length) {
      toast.success(t('toastDeleted', { count: removed.length }));
    }
  };

  const handleRouteJourney = (blueprintId: string) => {
    if (!open) return;
    const routed = routeJourneyOntoCampaign(
      open,
      journeys,
      experiences,
      blueprintId,
      CAMPAIGN_PRODUCT_NAMES
    );
    setJourneys(routed.journeys);
    setExperiences(routed.experiences);
    handleChange(routed.campaign);
    toast.success(t('toastRouted', { name: routed.campaign.name }));
  };

  const handleCarryRoute = () => {
    if (!open) return;
    const bound = bindRouteToItems(
      open,
      experiences,
      CAMPAIGN_PRODUCT_NAMES,
      journeys
    );
    setExperiences(bound.experiences);
    handleChange(bound.campaign);
    toast.success(t('toastCarried'));
  };

  /**
   * Attaching a library master to a subject forks it: the copy id is derived
   * from origin × campaign × subject, so the caller already knows it and only
   * needs the record to exist.
   */
  const handleEnsureExperience = (copies: CampaignExperience[]) => {
    setExperiences(prev => {
      const known = new Set(prev.map(e => e.id));
      const added = copies.filter(copy => !known.has(copy.id));
      return added.length ? [...prev, ...added] : prev;
    });
  };

  const handlePatchExperience = (
    id: string,
    patch: Partial<CampaignExperience>
  ) => {
    setExperiences(prev =>
      prev.map(e => (e.id === id ? { ...e, ...patch } : e))
    );
  };

  /**
   * A finished campaign's route becomes the next one's starting point — the
   * fork is promoted back to a blueprint, and the copy keeps its numbers.
   */
  const handlePromoteJourney = () => {
    if (!open) return;
    const fork = journeys.find(j => j.id === open.journeyId);
    if (!fork) return;

    const blueprint: Journey = {
      ...structuredClone(fork),
      id: `j-promoted-${open.id}`,
      name: `${fork.name} — ${t('promotedSuffix')}`,
      template: true,
      campaign: null,
      campaignName: null,
      origin: null,
      updated: 'just now',
    };

    setJourneys(prev => [blueprint, ...prev]);
    handleChange({ ...open, promoted: true });
    toast.success(t('toastPromoted', { name: blueprint.name }));
  };

  const deleteItems = deleteIds
    ? campaigns.filter(campaign => deleteIds.includes(campaign.id))
    : [];

  if (open) {
    return (
      <>
        <CampaignDetail
          key={open.id}
          campaign={open}
          journeys={journeys}
          experiences={experiences}
          products={CAMPAIGN_PRODUCTS}
          productNames={CAMPAIGN_PRODUCT_NAMES}
          today={today}
          onChange={handleChange}
          onBack={() => setOpenId(null)}
          onDelete={() => setDeleteIds([open.id])}
          onRouteJourney={handleRouteJourney}
          onCarryRoute={handleCarryRoute}
          onEnsureExperiences={handleEnsureExperience}
          onPatchExperience={handlePatchExperience}
          onPromoteJourney={handlePromoteJourney}
          onJourneyChange={next =>
            setJourneys(prev => prev.map(j => (j.id === next.id ? next : j)))
          }
        />
        {deleteItems.length ? (
          <DeleteCampaignModal
            items={deleteItems}
            onClose={() => setDeleteIds(null)}
            onConfirm={handleDelete}
          />
        ) : null}
      </>
    );
  }

  return (
    <div className='flex min-h-0 flex-col'>
      <div className='pv2-page-header'>
        <div className='mx-auto flex w-full flex-wrap items-end justify-between gap-4 px-5 pt-6 pb-4 md:px-8'>
          <div className='min-w-0'>
            <h1 className='font-[family-name:var(--pv2-disp)] text-[1.625rem] font-bold tracking-[-0.03em] text-[var(--pv2-ink)] md:text-[1.75rem]'>
              {t('title')}
            </h1>
            <p className='mt-1 text-[13.5px] leading-relaxed text-[var(--pv2-mut)]'>
              {t('subtitle')}
            </p>
          </div>

          <div className='flex shrink-0 items-center gap-2 pb-0.5'>
            <Button variant='primary' onClick={() => setWizardOpen(true)}>
              <Plus className='size-[15px]' strokeWidth={2.4} aria-hidden />
              {t('newCampaign')}
            </Button>
          </div>
        </div>
      </div>

      <div className='sticky top-0 z-10 bg-[var(--pv2-paper)]'>
        <div className='mx-auto w-full px-5 md:px-8'>
          <Tabs
            items={stageTabs}
            value={filters.stage}
            onChange={id =>
              patchFilters({ stage: id as CampaignStage | 'all' })
            }
            aria-label={t('stageTabsAria')}
          />
        </div>
      </div>

      <div className='mx-auto w-full px-5 py-6 md:px-8'>
        <CampaignToolbar filters={filters} onChange={patchFilters} />

        {selected.length ? (
          <CampaignBulkBar
            count={selected.length}
            onDelete={() => setDeleteIds(selected)}
            onClear={() => setSelected([])}
          />
        ) : null}

        {/*
          Nạp hỏng ⇒ nói ra. Rơi thẳng vào EmptyState sẽ đọc như "chưa có chiến
          dịch nào", trong khi sự thật là chưa hỏi được server.
        */}
        {loadError ? (
          <p className='rounded-[var(--pv2-r)] border border-[var(--pv2-hair)] px-3.5 py-3 text-[12.5px] text-[var(--pv2-error)]'>
            {loadError}
          </p>
        ) : !visible.length ? (
          <EmptyState
            title={t('emptyTitle')}
            action={
              <Button variant='primary' onClick={() => setWizardOpen(true)}>
                <Plus className='size-[15px]' strokeWidth={2.4} aria-hidden />
                {t('newCampaign')}
              </Button>
            }
          >
            {t('emptyBody')}
          </EmptyState>
        ) : filters.view === 'grid' ? (
          <CampaignGrid
            campaigns={visible}
            productNames={CAMPAIGN_PRODUCT_NAMES}
            experiences={experiences}
            journeys={journeys}
            today={today}
            selected={selected}
            onToggleSelect={id =>
              setSelected(prev =>
                prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
              )
            }
            onOpen={setOpenId}
            onDuplicate={handleDuplicate}
            onDelete={id => setDeleteIds([id])}
          />
        ) : (
          <CampaignTable
            campaigns={visible}
            experiences={experiences}
            journeys={journeys}
            today={today}
            selected={selected}
            onToggleSelect={id =>
              setSelected(prev =>
                prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
              )
            }
            onToggleAll={() =>
              setSelected(prev =>
                prev.length === visible.length ? [] : visible.map(c => c.id)
              )
            }
            onOpen={setOpenId}
            onDuplicate={handleDuplicate}
            onDelete={id => setDeleteIds([id])}
          />
        )}
      </div>

      {wizardOpen ? (
        <NewCampaignWizard
          owner={CAMPAIGN_TEAM[0]}
          products={CAMPAIGN_PRODUCTS}
          blueprints={journeys.filter(j => j.template)}
          onClose={() => setWizardOpen(false)}
          onCreate={handleCreate}
        />
      ) : null}

      {deleteItems.length ? (
        <DeleteCampaignModal
          items={deleteItems}
          onClose={() => setDeleteIds(null)}
          onConfirm={handleDelete}
        />
      ) : null}
    </div>
  );
};
