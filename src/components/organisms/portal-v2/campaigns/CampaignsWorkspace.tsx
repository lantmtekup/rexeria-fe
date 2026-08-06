'use client';

import { Plus } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';

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
  createCampaign,
  deleteCampaigns,
  duplicateCampaign,
  findCampaign,
  nextCampaignId,
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
  MOCK_CAMPAIGNS,
  cloneCampaigns,
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
}: CampaignsWorkspaceProps) => {
  const t = useTranslations('portalV2.campaigns');

  const [campaigns, setCampaigns] = useState<CampaignView[]>(() =>
    cloneCampaigns(MOCK_CAMPAIGNS)
  );

  /**
   * Journeys and experiences are seeded from the campaigns that claim them: the
   * seed says `m4` runs `j-j1-m4` and its subject carries a copy of `e4`, and
   * these two calls make both true before anything renders.
   */
  const [journeys, setJourneys] = useState<Journey[]>(() =>
    ensureCampaignJourneys(cloneJourneys(MOCK_JOURNEYS), MOCK_CAMPAIGNS)
  );
  const [experiences, setExperiences] = useState<CampaignExperience[]>(() =>
    ensureCampaignExperiences(
      seedExperiences(),
      MOCK_CAMPAIGNS,
      CAMPAIGN_PRODUCT_NAMES
    )
  );

  const [openId, setOpenId] = useState<string | null>(() =>
    initialCampaignId && findCampaign(MOCK_CAMPAIGNS, initialCampaignId)
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

  const handleChange = useCallback((next: CampaignView) => {
    setCampaigns(prev => replaceCampaign(prev, next));
  }, []);

  const handleCreate = (wizard: CampaignWizard) => {
    const id = nextCampaignId(campaigns);
    const created = createCampaign(campaigns, id, wizardDraft(wizard));

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

  const handleDuplicate = (id: string) => {
    const result = duplicateCampaign(campaigns, id, t('copySuffix'));
    if (!result) return;

    setCampaigns(result.list);
    setJourneys(prev => ensureCampaignJourneys(prev, [result.campaign]));
    setExperiences(prev =>
      ensureCampaignExperiences(prev, [result.campaign], CAMPAIGN_PRODUCT_NAMES)
    );
    setSelected([]);
    toast.success(t('toastDuplicated', { name: result.campaign.name }));
  };

  const handleDelete = () => {
    if (!deleteIds?.length) return;
    /* The journey forks and experience copies go with them — the blueprints and
       library masters they came from are untouched. */
    setJourneys(prev =>
      prev.filter(j => !deleteIds.includes(j.campaign ?? ''))
    );
    setExperiences(prev =>
      prev.filter(e => !deleteIds.includes(e.campaign ?? ''))
    );
    setCampaigns(prev => deleteCampaigns(prev, deleteIds));
    if (openId && deleteIds.includes(openId)) setOpenId(null);
    setDeleteIds(null);
    setSelected([]);
    toast.success(t('toastDeleted', { count: deleteIds.length }));
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

        {!visible.length ? (
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
