'use client';

import { Plus, Search } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';

import type { JourneySegment } from '@/lib/portal-v2/journeys/constants';
import type { PersonaOption } from '@/services/portal-v2/journeyAudience';

import { fetchExperienceRefs } from '@/services/portal-v2/journeyMeasured';
import {
  saveFailureReasons,
  createJourney as createJourneyApi,
  deleteJourneys as deleteJourneysApi,
  duplicateJourney as duplicateJourneyApi,
  saveJourney as saveJourneyApi,
  useJourney as forkJourneyOntoCampaign,
} from '@/services/portal-v2/journeyBoard';

import { Button } from '@/components/molecules/portal-v2/Button';
import { Tabs } from '@/components/molecules/portal-v2/Tabs';
import { DeleteJourneyModal } from '@/components/organisms/portal-v2/journeys/DeleteJourneyModal';
import { ForkJourneyModal } from '@/components/organisms/portal-v2/journeys/ForkJourneyModal';
import { JourneyCard } from '@/components/organisms/portal-v2/journeys/JourneyCard';
import { JourneyDetailModal } from '@/components/organisms/portal-v2/journeys/JourneyDetailModal';
import { JourneyEditor } from '@/components/organisms/portal-v2/journeys/editor/JourneyEditor';
import { NewJourneyModal } from '@/components/organisms/portal-v2/journeys/NewJourneyModal';
import { cn } from '@/lib/cn';
import {
  JOURNEY_DEFAULT_FILTERS,
  JOURNEY_STATE_TABS,
} from '@/lib/portal-v2/journeys/constants';
import { writeJourneyEditParam } from '@/lib/portal-v2/journeys/editParam';
import {
  copiesOfJourney,
  countByState,
  createJourney,
  deleteJourney,
  filterJourneys,
  findJourney,
  journeyHome,
  journeyStats,
  nodeNamesOf,
} from '@/lib/portal-v2/journeys/helpers';
import type {
  Journey,
  JourneyDraftInput,
  JourneyFilters,
  JourneyStateFilter,
} from '@/lib/portal-v2/journeys/types';

/** Which overlay owns the screen. Only one at a time, by construction. */
type Overlay =
  | { kind: 'detail'; id: string }
  | { kind: 'edit'; id: string }
  | { kind: 'fork'; id: string }
  | { kind: 'delete'; id: string }
  | { kind: 'new' }
  | null;

type JourneysWorkspaceProps = {
  /** Hành trình THẬT — `GET /v1/journeys`, đã lọc theo brand. */
  initialJourneys: Journey[];
  /** `version` theo id, cho lần `PUT` kế tiếp. */
  initialVersions: Record<string, number>;
  /** Brand đang xem — cần khi TẠO, vì admin không thuộc brand nào. */
  brandId: string | null;
  /** Chân dung khách của brand — `brand_profiles.audience`. */
  personas: PersonaOption[];
  /** Chiến dịch THẬT — `GET /v1/campaigns`, cho hộp "Use in campaign". */
  campaigns: { id: string; name: string; stage?: string }[];
  /** Phân khúc hành vi ĐO ĐƯỢC — `GET /v1/intel/segments`. */
  segments: JourneySegment[];
  initialError?: string | null;
  /** Journey id from `?edit=` — reopens the canvas editor on a pasted / reloaded link. */
  initialEditId?: string | null;
};

export const JourneysWorkspace = ({
  initialEditId = null,
  initialJourneys,
  initialVersions,
  brandId,
  personas,
  campaigns,
  segments,
  initialError = null,
}: JourneysWorkspaceProps) => {
  const t = useTranslations('portalV2.journeys');

  // Dữ liệu THẬT — `GET /v1/journeys`.
  const [journeys, setJourneys] = useState<Journey[]>(() => initialJourneys);
  /**
   * `version` theo id — khoá lạc quan mà `PUT` bắt buộc gửi kèm. Giữ riêng vì
   * shape UI không mang trường đó; lệch số là BE từ chối ghi.
   */
  const versionsRef = useRef<Record<string, number>>(initialVersions);
  const [loadError] = useState<string | null>(initialError);

  /**
   * Tập id trải nghiệm đang được trỏ tới, ĐÃ dựng thành chuỗi.
   *
   * Phụ thuộc theo chuỗi này chứ không theo `journeys`: hiệu ứng bên dưới ghi
   * nhãn NGƯỢC vào `journeys`, nên lấy cả mảng làm phụ thuộc sẽ tự kích hoạt
   * lại chính nó mãi.
   */
  const linkedExperienceIds = useMemo(
    () =>
      [
        ...new Set(
          journeys.flatMap(j => j.nodes.flatMap(n => (n.x ? [n.x] : [])))
        ),
      ]
        .sort()
        .join('|'),
    [journeys]
  );

  /**
   * Nhãn + độ phủ của trải nghiệm mà các node đang trỏ tới.
   *
   * Node chỉ giữ `experience_id`; `xName`/`xCoverage` thuộc về THƯ VIỆN. Không
   * nạp chúng thì luật "Every linked experience has tracking points" đọc một
   * trường không ai điền, nên VĨNH VIỄN trượt — dấu ✗ đó không thao tác nào
   * chuyển xanh được.
   */
  useEffect(() => {
    const ids = journeys.flatMap(j => j.nodes.flatMap(n => (n.x ? [n.x] : [])));
    if (ids.length === 0) return;
    let alive = true;
    void fetchExperienceRefs(ids, brandId).then(refs => {
      if (!alive || Object.keys(refs).length === 0) return;
      setJourneys(prev =>
        prev.map(j => ({
          ...j,
          nodes: j.nodes.map(n => {
            const ref = n.x ? refs[n.x] : undefined;
            return ref
              ? {
                  ...n,
                  xName: ref.name,
                  ...(ref.coverage !== null ? { xCoverage: ref.coverage } : {}),
                }
              : n;
          }),
        }))
      );
    });
    return () => {
      alive = false;
    };
    // `journeys` CỐ Ý không nằm trong phụ thuộc: hiệu ứng này ghi nhãn ngược
    // vào chính nó, nên thêm vào là một vòng lặp vô tận. Tập id đã đại diện đủ
    // cho thứ cần nạp lại.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [brandId, linkedExperienceIds]);
  const [filters, setFilters] = useState<JourneyFilters>(
    JOURNEY_DEFAULT_FILTERS
  );

  /**
   * Resolved at mount only: a deep link opens the editor on the first paint
   * instead of flashing the grid. Dead ids fall through to the list.
   */
  const [overlay, setOverlay] = useState<Overlay>(() => {
    if (!initialEditId) return null;
    return findJourney(initialJourneys, initialEditId)
      ? { kind: 'edit', id: initialEditId }
      : null;
  });

  /** `?edit=` trỏ vào một hành trình không còn. */
  const deadEditLinkRef = useRef(
    Boolean(initialEditId) && !findJourney(initialJourneys, initialEditId)
  );

  const visible = useMemo(
    () => filterJourneys(journeys, filters),
    [journeys, filters]
  );

  const stateTabs = useMemo(
    () =>
      JOURNEY_STATE_TABS.map(tab => ({
        id: tab.id,
        label: t(tab.labelKey),
        count: countByState(journeys, tab.id),
      })),
    [journeys, t]
  );

  const activeId = overlay && 'id' in overlay ? overlay.id : null;
  const active = findJourney(journeys, activeId);

  /* Keep `?edit=` in the address bar while the canvas is open — reload restores it. */
  useEffect(() => {
    writeJourneyEditParam(overlay?.kind === 'edit' ? overlay.id : null);
  }, [overlay]);

  useEffect(() => {
    if (!deadEditLinkRef.current) return;
    deadEditLinkRef.current = false;
    writeJourneyEditParam(null);
  }, []);

  const handleStateChange = useCallback((id: string) => {
    setFilters(prev => ({ ...prev, state: id as JourneyStateFilter }));
  }, []);

  const handleOpen = useCallback((journey: Journey) => {
    setOverlay({ kind: 'detail', id: journey.id });
  }, []);

  const handleClose = useCallback(() => setOverlay(null), []);

  const handleDuplicate = useCallback(
    async (journey: Journey) => {
      const res = await duplicateJourneyApi(journey.id).catch(() => null);
      if (!res) {
        toast.error(t('toastDuplicateFailed'));
        return;
      }
      versionsRef.current[res.journey.id] = res.version;
      setJourneys(prev => [res.journey, ...prev]);
      toast.success(`Duplicated — ${res.journey.name}`);
    },
    [t]
  );

  const handleCreate = useCallback(
    async (input: JourneyDraftInput) => {
      const draft = createJourney(input);
      const res = await createJourneyApi(draft, brandId).catch(() => null);
      if (!res) {
        toast.error(t('toastCreateFailed'));
        return;
      }
      // Id do SERVER cấp — id dựng ở FE sẽ trỏ vào hư không sau lần tải lại đầu.
      versionsRef.current[res.journey.id] = res.version;
      setJourneys(prev => [res.journey, ...prev]);
      /* Rule 10 — never create into a filter that would hide the result. */
      setFilters(prev => ({ ...prev, state: 'all', q: '' }));
      setOverlay({ kind: 'detail', id: res.journey.id });
      toast.success(`Created — ${res.journey.name}`);
    },
    [brandId, t]
  );

  const handleFork = useCallback(
    async (campaignId: string, campaignName: string) => {
      if (!activeId) return;
      // BE tự chặn "một chiến dịch, một hành trình"; không đoán trước ở FE.
      const res = await forkJourneyOntoCampaign(activeId, campaignId).catch(
        (err: unknown) => {
          // `use` áp hợp đồng ĐẦY ĐỦ — một bản nháp dở dang bị từ chối kèm
          // danh sách kiểm. Nói ra từng mục, giống nút Save.
          const reasons = saveFailureReasons(err, nodeNamesOf(active));
          toast.error(
            reasons.length
              ? t('toastForkInvalid', { reasons: reasons.join(' · ') })
              : t('toastForkFailed')
          );
          return null;
        }
      );
      if (!res) return;
      versionsRef.current[res.journey.id] = res.version;
      setJourneys(prev => [
        { ...res.journey, campaignName },
        ...prev.filter(j => j.id !== res.journey.id),
      ]);
      toast.success(`Forked into ${campaignName} — the blueprint is untouched`);
      setFilters(prev => ({ ...prev, state: 'copy', q: '' }));
      setOverlay({ kind: 'detail', id: res.journey.id });
    },
    [activeId, active, t]
  );

  /** Ghi lại cục bộ cho autosave và khôi-phục-khi-huỷ. Không gọi server. */
  const handlePersistEdit = useCallback((next: Journey) => {
    setJourneys(prev => prev.map(j => (j.id === next.id ? next : j)));
  }, []);

  /**
   * Save — `PUT` thay TOÀN BỘ và bắt buộc gửi `version` vừa đọc.
   *
   * Lệch version nghĩa là người khác đã lưu trước; BE từ chối và ta nói ra thay
   * vì nuốt lỗi rồi đóng cửa sổ như thể đã lưu xong.
   */
  const handleSaveEdit = useCallback(
    async (next: Journey) => {
      const version = versionsRef.current[next.id];
      if (version === undefined) {
        toast.error(t('toastSaveFailed'));
        return;
      }
      const res = await saveJourneyApi(next, version).catch((err: unknown) => {
        // BE trả danh sách kiểm cụ thể (thiếu mô tả, thiếu via, node trải
        // nghiệm chưa gắn…). Nói ra từng cái — "không lưu được" thì người dùng
        // không biết phải sửa gì, dù chính panel Requirements đã liệt kê sẵn.
        const reasons = saveFailureReasons(err, nodeNamesOf(next));
        toast.error(
          reasons.length
            ? t('toastSaveInvalid', { reasons: reasons.join(' · ') })
            : t('toastSaveStale')
        );
        return null;
      });
      if (!res) return;
      versionsRef.current[res.journey.id] = res.version;
      handlePersistEdit(res.journey);
      setOverlay({ kind: 'detail', id: res.journey.id });
      toast.success(
        res.journey.template
          ? 'Blueprint saved — existing campaign copies are untouched'
          : `Saved to ${journeyHome(res.journey)}'s copy — the blueprint is untouched`
      );
    },
    [handlePersistEdit, t]
  );

  const handleConfirmDelete = useCallback(async () => {
    if (!activeId) return;
    const target = findJourney(journeys, activeId);
    const failed = await deleteJourneysApi([activeId]);
    if (failed.length) {
      toast.error(t('toastDeleteFailed'));
      return;
    }
    setJourneys(prev => deleteJourney(prev, activeId));
    setOverlay(null);
    if (target) toast.success(`Deleted — ${target.name}`);
  }, [activeId, journeys, t]);

  return (
    <div className='flex min-h-0 flex-col'>
      <div className='pv2-page-header'>
        <div className='mx-auto flex w-full flex-wrap items-end justify-between gap-4 px-5 pt-6 pb-4 md:px-8'>
          <div className='min-w-0'>
            <h1 className='font-[family-name:var(--pv2-disp)] text-[1.625rem] font-bold tracking-[-0.03em] text-[var(--pv2-ink)] md:text-[1.75rem]'>
              {t('title')}
            </h1>
            <p className='mt-1 max-w-[80ch] text-[13.5px] leading-relaxed text-[var(--pv2-mut)]'>
              {t('subtitle')}
            </p>
          </div>

          <div className='flex shrink-0 items-center gap-2 pb-0.5'>
            <Button
              variant='primary'
              onClick={() => setOverlay({ kind: 'new' })}
            >
              <Plus className='size-[15px]' strokeWidth={2.4} aria-hidden />
              {t('newJourney')}
            </Button>
          </div>
        </div>
      </div>

      <div className='mx-auto w-full px-5 py-6 md:px-8'>
        <div className='sticky top-0 z-10 -mx-5 mb-3.5 bg-[var(--pv2-canvas)] px-5 md:-mx-8 md:px-8'>
          <Tabs
            items={stateTabs}
            value={filters.state}
            onChange={handleStateChange}
            aria-label={t('stateTabsAria')}
          />
        </div>

        <label
          className={cn(
            'mb-3.5 flex w-full max-w-[320px] items-center gap-2 rounded-[10px]',
            'border border-[var(--pv2-hair)] bg-[var(--pv2-paper)] px-[11px] py-2 text-[var(--pv2-faint)]',
            'transition-colors focus-within:border-[var(--pv2-violet)]'
          )}
        >
          <Search className='size-3.5 shrink-0' strokeWidth={2.2} aria-hidden />
          <input
            type='search'
            value={filters.q}
            onChange={e => setFilters(prev => ({ ...prev, q: e.target.value }))}
            placeholder={t('searchPlaceholder')}
            aria-label={t('searchAria')}
            className='min-w-0 flex-1 border-0 bg-transparent text-[12.5px] text-[var(--pv2-ink)] outline-none placeholder:text-[var(--pv2-faint)]'
          />
        </label>

        {visible.length ? (
          <>
            <p className='mb-3 text-[12px] text-[var(--pv2-faint)]'>
              {t('resultsCount', { count: visible.length })}
            </p>
            <div className='grid grid-cols-[repeat(auto-fill,minmax(258px,1fr))] gap-4'>
              {visible.map(journey => (
                <JourneyCard
                  key={journey.id}
                  journey={journey}
                  stats={journeyStats(journeys, journey)}
                  onOpen={handleOpen}
                  onEdit={j => setOverlay({ kind: 'edit', id: j.id })}
                  onDuplicate={handleDuplicate}
                  onDelete={j => setOverlay({ kind: 'delete', id: j.id })}
                />
              ))}
            </div>
          </>
        ) : (
          <div
            className={cn(
              'rounded-[var(--pv2-r)] border border-dashed border-[var(--pv2-hair)]',
              'px-10 py-12 text-center'
            )}
          >
            {/*
              Nạp hỏng ⇒ nói ra. Để rơi vào trạng thái rỗng sẽ đọc như "chưa có
              hành trình nào", trong khi sự thật là chưa hỏi được server.
            */}
            <p
              className={cn(
                'text-[14px] font-semibold',
                loadError ? 'text-[var(--pv2-error)]' : 'text-[var(--pv2-ink)]'
              )}
            >
              {loadError ?? t('empty')}
            </p>
            {loadError ? null : (
              <p className='mt-1.5 text-[13px] text-[var(--pv2-faint)]'>
                {t('emptyHint')}
              </p>
            )}
          </div>
        )}
      </div>

      {overlay?.kind === 'detail' && active ? (
        <JourneyDetailModal
          key={active.id}
          journey={active}
          journeys={journeys}
          personas={personas}
          segments={segments}
          onClose={handleClose}
          onEdit={j => setOverlay({ kind: 'edit', id: j.id })}
          onFork={j => setOverlay({ kind: 'fork', id: j.id })}
          onDuplicate={handleDuplicate}
          onOpenJourney={id => setOverlay({ kind: 'detail', id })}
        />
      ) : null}

      {overlay?.kind === 'edit' && active ? (
        <JourneyEditor
          key={active.id}
          journey={active}
          journeys={journeys}
          personas={personas}
          onCancel={() => setOverlay({ kind: 'detail', id: active.id })}
          onPersist={handlePersistEdit}
          onSave={handleSaveEdit}
        />
      ) : null}

      {overlay?.kind === 'fork' && active ? (
        <ForkJourneyModal
          journey={active}
          campaigns={campaigns}
          forkedInto={copiesOfJourney(journeys, active).flatMap(c =>
            c.campaign ? [c.campaign] : []
          )}
          onClose={() => setOverlay({ kind: 'detail', id: active.id })}
          onPick={handleFork}
        />
      ) : null}

      {overlay?.kind === 'delete' && active ? (
        <DeleteJourneyModal
          journey={active}
          copies={copiesOfJourney(journeys, active).length}
          onClose={handleClose}
          onConfirm={handleConfirmDelete}
        />
      ) : null}

      {overlay?.kind === 'new' ? (
        <NewJourneyModal
          personas={personas}
          onClose={handleClose}
          onCreate={handleCreate}
        />
      ) : null}
    </div>
  );
};
