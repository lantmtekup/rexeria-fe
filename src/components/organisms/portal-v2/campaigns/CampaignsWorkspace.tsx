'use client';

import { Plus } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';

import {
  promoteJourney as promoteJourneyApi,
  useJourney as forkJourneyOntoCampaign,
} from '@/services/portal-v2/journeyBoard';
import {
  addCampaignItem,
  createCampaign as createCampaignApi,
  deleteCampaigns as deleteCampaignsApi,
  duplicateCampaign as duplicateCampaignApi,
  fetchCampaignDetail,
  saveCampaign,
} from '@/services/portal-v2/campaignBoardV2';
import { fetchCampaignFactDetail } from '@/services/portal-v2/campaignFacts';

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
  withJourneyLinks,
} from '@/lib/portal-v2/campaigns/journeyLink';
import { campVerdict } from '@/lib/portal-v2/campaigns/verdict';

import type {
  CampaignExperience,
  CampaignFilters,
  CampaignStage,
  CampaignTeamMember,
  CampaignView,
  CampaignWizard,
} from '@/lib/portal-v2/campaigns/types';
import { wizardDraft } from '@/lib/portal-v2/campaigns/wizard';
import type { DeployChannel } from '@/lib/portal-v2/deploy/types';
import type { Journey } from '@/lib/portal-v2/journeys/types';
import type {
  PulseCampaignCard,
  PulseSubjectRow,
} from '@/lib/portal-v2/analytics/pulseView';

type CampaignsWorkspaceProps = {
  /** `?id=` — the campaign to open on arrival, so the screen is shareable. */
  initialCampaignId: string | null;
  /** Chiến dịch THẬT — `GET /v1/campaigns`, đã lọc theo brand. */
  initialCampaigns: CampaignView[];
  /** Hành trình THẬT — `GET /v1/journeys`, cùng brand. */
  initialJourneys: Journey[];
  /** Brand đang xem. null = admin chưa chọn ⇒ chưa tạo được chiến dịch. */
  brandId: string | null;
  /** SKU THẬT của brand — `GET /products`. */
  initialProducts: { id: string; name: string }[];
  /** Thư viện trải nghiệm THẬT — `GET /experiences`. */
  initialExperiences: CampaignExperience[];
  /** Thành viên brand THẬT — `GET /brands/{id}/users`. Ai Owner có thể gán tới. */
  team: CampaignTeamMember[];
  /** Kênh deploy THẬT của brand — `GET /v1/channels`. Cho nút Deploy thật
   *  trong `CampaignItemModal`, cùng danh sách màn Deploy đang đọc. */
  channels: DeployChannel[];
  /** `campaign_id → rollup` THẬT — `GET /v1/intel/campaigns`, một lần cho cả
   *  bảng. Thay `MOCK_FACT_ROWS`, bảng fact giả lọc theo id thật ⇒ luôn rỗng. */
  initialFacts: Record<string, PulseCampaignCard>;
  /** Lift trung bình toàn brand — `GET /v1/intel/overview`. null = chưa đo được. */
  earnedBar: number | null;
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
  initialJourneys,
  brandId,
  initialProducts,
  initialExperiences,
  team,
  channels,
  initialFacts,
  earnedBar,
  initialError = null,
}: CampaignsWorkspaceProps) => {
  const t = useTranslations('portalV2.campaigns');

  /**
   * `id → tên` của SKU thật. Bản trước dùng `CAMPAIGN_PRODUCT_NAMES` suy từ
   * mock, nên một hạng mục trỏ tới sản phẩm thật sẽ hiện ra id thô.
   */
  const productNames = useMemo(
    () => Object.fromEntries(initialProducts.map(p => [p.id, p.name])),
    [initialProducts]
  );

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
  /**
   * Hành trình THẬT — `GET /v1/journeys`. `ensureCampaignJourneys` vẫn chạy để
   * chiến dịch nào chưa có fork thì có một bản tại chỗ mà vẽ; bản đó chưa nằm
   * trên server cho tới khi người dùng thật sự gắn hành trình vào.
   */
  const [journeys, setJourneys] = useState<Journey[]>(() =>
    ensureCampaignJourneys(initialJourneys, initialCampaigns)
  );
  const [experiences, setExperiences] = useState<CampaignExperience[]>(() =>
    // Thư viện THẬT. `ensureCampaignExperiences` vẫn chạy để bản copy mà chiến
    // dịch khai là có nhưng chưa nạp về thì vẫn vẽ được thẻ.
    ensureCampaignExperiences(
      initialExperiences,
      initialCampaigns,
      productNames
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

  /**
   * Board-level verdict cho mỗi chiến dịch — suy từ `initialFacts` (bulk
   * `/intel/campaigns`, không `expand`). Không có leads/CAC/trust/best-worst
   * ở tầng này — `campVerdict` để chúng ở giá trị mặc định/`null` cho tới khi
   * chiến dịch được mở và tầng chi tiết (`factDetail` dưới) nạp về.
   */
  const verdicts = useMemo(
    () =>
      Object.fromEntries(
        campaigns.map(c => [c.id, campVerdict(initialFacts[c.id])])
      ),
    [campaigns, initialFacts]
  );

  /**
   * Tầng chi tiết — leads/CAC/hạng mục tốt-kém nhất — chỉ nạp khi một chiến
   * dịch được mở, cùng nhịp với `fetchCampaignDetail` bên dưới. `subjects` ở
   * đây, KHÔNG phải một `card` — lift cấp chiến dịch của lời gọi lọc
   * `campaign_id` luôn `null` (xem `campaignFacts.ts`), nên `card` thật vẫn
   * lấy từ `initialFacts` (bulk, không lọc) qua `verdicts`/`openVerdict`.
   */
  const [factDetail, setFactDetail] = useState<{
    campaignId: string;
    subjects: PulseSubjectRow[];
    leads: number;
    cac: number;
    trust: number | null;
  } | null>(null);

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
      if (!alive || !detail) return;
      // `GET /campaigns/{id}` cũng không trả `journey_id`, nên gán thẳng vào
      // state sẽ xoá mất liên kết vừa ghép ở route.
      const [linked] = withJourneyLinks([detail], journeys);
      setCampaigns(prev => replaceCampaign(prev, linked ?? detail));
    });
    return () => {
      alive = false;
    };
  }, [openId, journeys]);

  /**
   * Cùng nhịp mở chiến dịch — nạp tầng chi tiết của verdict (leads/CAC/độ phủ
   * tín hiệu/hạng mục tốt-kém nhất), ba thứ `initialFacts` (bulk, không
   * `expand`) không có. Đặt `null` ngay khi đổi `openId` để không hiện verdict
   * chi tiết của chiến dịch VỪA đóng trong lúc chờ chiến dịch mới nạp xong.
   */
  useEffect(() => {
    setFactDetail(null);
    if (!openId) return;
    let alive = true;
    void fetchCampaignFactDetail(openId, brandId).then(detail => {
      if (!alive) return;
      setFactDetail({
        campaignId: openId,
        subjects: detail.subjects,
        leads: detail.leads,
        cac: detail.cac,
        trust: detail.trust,
      });
    });
    return () => {
      alive = false;
    };
  }, [openId, brandId]);

  /**
   * Verdict của chiến dịch đang mở. `card` LUÔN từ `initialFacts` (bulk) — có
   * sibling thật để tính lift, không lấy từ lời gọi lọc `campaign_id`. Trong
   * lúc chờ tầng chi tiết nạp xong, verdict vẫn hiện đầy đủ sessions/lift/roi,
   * chỉ thiếu leads/CAC/trust/best-worst (mặc định của `campVerdict`).
   */
  const openVerdict = useMemo(() => {
    if (!openId) return null;
    const card = initialFacts[openId];
    if (factDetail && factDetail.campaignId === openId) {
      return campVerdict(card, {
        leads: factDetail.leads,
        cac: factDetail.cac,
        trust: factDetail.trust,
        subjects: factDetail.subjects,
      });
    }
    return campVerdict(card);
  }, [openId, factDetail, initialFacts]);

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
    const saved = await createCampaignApi(draft, brandId).catch(() => null);
    if (!saved) {
      // Thiếu brand là lỗi khác hẳn "server hỏng" — nói đúng cái nào.
      toast.error(brandId ? t('toastCreateFailed') : t('toastCreateNoBrand'));
      return;
    }
    // Id do SERVER cấp, không phải `nextCampaignId` đếm trong mảng — id bịa ở
    // FE sẽ trỏ vào hư không ngay lần tải lại trang đầu tiên.
    const id = saved.id;

    // Hạng mục KHÔNG đi kèm lệnh tạo: `CreateCampaignV2Request` không có chỗ
    // cho chúng, BE nhận riêng qua `POST /campaigns/{id}/items`. Bước
    // Merchandise của wizard vẫn thu thập lựa chọn, nên trước đây nó bị bỏ rơi
    // lặng lẽ — chiến dịch sinh ra rỗng dù người dùng đã chọn xong sản phẩm,
    // và màn chi tiết báo "Nothing is being sold yet".
    //
    // Gắn TUẦN TỰ, không song song: thứ tự hạng mục là thứ người dùng vừa
    // thấy ở wizard, và Promise.all trả về theo thứ tự hoàn thành.
    const wanted: { kind: 'product' | 'topic'; value: string }[] = [
      ...wizard.subjects.map(p => ({ kind: 'product' as const, value: p })),
      ...wizard.topics.map(name => ({ kind: 'topic' as const, value: name })),
    ];
    let created = saved;
    if (wanted.length) {
      const items = [];
      for (const w of wanted) {
        const item = await addCampaignItem(id, w.kind, w.value).catch(
          () => null
        );
        if (item) items.push(item);
      }
      created = { ...saved, items };
      // Giữ chiến dịch vừa tạo dù gắn hụt — nó đã nằm trên server. Nói rõ hụt
      // bao nhiêu, thay vì để người dùng tự đếm trên màn chi tiết.
      if (items.length < wanted.length) {
        toast.error(
          t('toastItemsPartial', {
            done: items.length,
            total: wanted.length,
          })
        );
      }
    }

    if (wizard.journeyId) {
      // Chiến dịch đã có id thật ⇒ fork được ngay. Hỏng thì vẫn giữ chiến dịch
      // vừa tạo: nó đã nằm trên server, giấu đi là nói dối về thứ đang có.
      const res = await forkJourneyOntoCampaign(
        wizard.journeyId,
        created.id
      ).catch(() => null);

      if (res) {
        const fork = { ...res.journey, campaignName: created.name };
        setJourneys(prev => [fork, ...prev.filter(j => j.id !== fork.id)]);
        const bound = bindRouteToItems(
          { ...created, journeyId: fork.id },
          experiences,
          productNames,
          [fork]
        );
        setExperiences(bound.experiences);
        setCampaigns(prev => [bound.campaign, ...prev]);
      } else {
        toast.error(t('toastRouteFailed'));
        setCampaigns(prev => [created, ...prev]);
      }
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
      ensureCampaignExperiences(prev, [result.campaign], productNames)
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

  /**
   * Gắn một blueprint lên chiến dịch đang mở.
   *
   * Fork do SERVER tạo (`POST /journeys/{id}/use`), không dựng ở FE nữa: bản
   * cũ tự sinh id rồi giữ trong state, nên tải lại trang là mất sạch. Phần
   * gắn trải nghiệm vào từng hạng mục vẫn cục bộ — experiences chưa ráp API.
   */
  const handleRouteJourney = async (blueprintId: string) => {
    if (!open) return;
    const res = await forkJourneyOntoCampaign(blueprintId, open.id).catch(
      () => null
    );
    if (!res) {
      toast.error(t('toastRouteFailed'));
      return;
    }

    const fork = { ...res.journey, campaignName: open.name };
    setJourneys(prev => [fork, ...prev.filter(j => j.id !== fork.id)]);

    const bound = bindRouteToItems(
      { ...open, journeyId: fork.id },
      experiences,
      productNames,
      [fork]
    );
    setExperiences(bound.experiences);
    handleChange(bound.campaign);
    toast.success(
      res.autoForked > 0
        ? t('toastRoutedStaged', {
            name: bound.campaign.name,
            count: res.autoForked,
          })
        : t('toastRouted', { name: bound.campaign.name })
    );
  };

  const handleCarryRoute = () => {
    if (!open) return;
    const bound = bindRouteToItems(open, experiences, productNames, journeys);
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

  /**
   * A finished campaign's route becomes the next one's starting point — the
   * fork is promoted back to a blueprint, and the copy keeps its numbers.
   */
  const handlePromoteJourney = async () => {
    if (!open) return;
    const fork = journeys.find(j => j.id === open.journeyId);
    if (!fork) return;

    // Blueprint do SERVER dựng, kể cả id — bản cũ đặt `j-promoted-{campaignId}`,
    // một chuỗi không tồn tại ở đâu ngoài tab đang mở.
    const res = await promoteJourneyApi(
      fork.id,
      `${fork.name} — ${t('promotedSuffix')}`
    ).catch(() => null);
    if (!res) {
      toast.error(t('toastPromoteFailed'));
      return;
    }
    const blueprint = res.journey;

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
          products={initialProducts}
          productNames={productNames}
          team={team}
          channels={channels}
          verdict={openVerdict}
          earnedBar={earnedBar}
          today={today}
          onChange={handleChange}
          onBack={() => setOpenId(null)}
          onDelete={() => setDeleteIds([open.id])}
          onRouteJourney={handleRouteJourney}
          onCarryRoute={handleCarryRoute}
          onEnsureExperiences={handleEnsureExperience}
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
            <Button
              variant='primary'
              disabled={!brandId}
              title={!brandId ? t('needBrandToCreate') : undefined}
              onClick={() => setWizardOpen(true)}
            >
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
              <Button
                variant='primary'
                disabled={!brandId}
                title={!brandId ? t('needBrandToCreate') : undefined}
                onClick={() => setWizardOpen(true)}
              >
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
            productNames={productNames}
            experiences={experiences}
            journeys={journeys}
            team={team}
            today={today}
            verdicts={verdicts}
            earnedBar={earnedBar}
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
            team={team}
            today={today}
            verdicts={verdicts}
            earnedBar={earnedBar}
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
          team={team}
          products={initialProducts}
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
