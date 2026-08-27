'use client';

import {
  ArrowDownWideNarrow,
  ListFilter,
  Loader2,
  Plus,
  Search,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';

import { FilterChips } from '@/components/molecules/portal-v2/FilterChips';
import { Tabs } from '@/components/molecules/portal-v2/Tabs';
import {
  ViewToggle,
  type PortalViewMode,
} from '@/components/molecules/portal-v2/ViewToggle';
import { ExperienceCard } from '@/components/organisms/portal-v2/experiences/ExperienceCard';
import { ExperienceDetailModal } from '@/components/organisms/portal-v2/experiences/ExperienceDetailModal';
import { ExperienceTable } from '@/components/organisms/portal-v2/experiences/ExperienceTable';
import { NewExperienceModal } from '@/components/organisms/portal-v2/experiences/NewExperienceModal';
import { UseExperienceModal } from '@/components/organisms/portal-v2/experiences/UseExperienceModal';
import {
  createExperience,
  deleteExperiences,
  duplicateExperience,
  type NewExperienceDraft,
} from '@/services/portal-v2/experienceActions';
import { errorMessage } from '@/services/portal-v2/_error';
import {
  forkExperience,
  type ForkTarget,
} from '@/services/portal-v2/experienceUse';
import { setExperienceProven } from '@/services/portal-v2/experienceProven';
import { updateExperienceDetails } from '@/services/portal-v2/experienceDetailsUpdate';
import { RxApiError } from '@/services/rexer/client';
import { rexerApi } from '@/services/rexer/endpoints';
import { ExchangeLiveCanvasPreview } from '@/components/organisms/portal-v2/exchange/ExchangeLiveCanvasPreview';
import { ExchangePreviewShell } from '@/components/organisms/portal-v2/exchange/ExchangePreviewShell';
import {
  EXPERIENCE_CATEGORIES,
  EXPERIENCE_DEFAULT_FILTERS,
  EXPERIENCE_EVIDENCE,
  EXPERIENCE_OBJECTIVES,
  EXPERIENCE_STATES,
  EXPERIENCE_VEHICLES,
} from '@/lib/portal-v2/experiences/constants';
import {
  canEditCanvas,
  canPreview,
  canvasEditorHref,
  countByState,
  filterExperiences,
  findById,
  isExchangeShelf,
} from '@/lib/portal-v2/experiences/helpers';
import { writeExchangePreviewParam } from '@/lib/portal-v2/exchange/previewParam';
import { clearExperienceOpenParam } from '@/lib/portal-v2/experiences/openParam';
import type {
  ExperienceFilters,
  ExperienceState,
  ExperienceView,
} from '@/lib/portal-v2/experiences/types';
import type { PreviewItem } from '@/lib/portal-v2/preview/types';
import { fetchExperienceLibrary } from '@/services/portal-v2/experienceLibrary';
import { cn } from '@/lib/cn';

type ExperiencesWorkspaceProps = {
  initialItems: ExperienceView[];
  initialError: string | null;
  /**
   * Brand đang xem. Phải mang theo: ô tìm kiếm nạp lại danh sách sau mỗi lần
   * gõ — quên truyền là bộ lọc rơi mất và lưới bỗng hiện trải nghiệm của brand
   * khác ngay khi người dùng gõ chữ đầu tiên.
   */
  brandId?: string | null;
  /** Experience id from `?preview=` — reopens that preview on a pasted link. */
  initialPreviewId?: string | null;
  /**
   * `?open=` — mở sẵn hộp CHI TIẾT của mục này, và nhảy sang tab chứa nó.
   *
   * Đường về từ màn Exchange sau khi bấm Thêm. Không có nó, người dùng bị thả
   * lại giữa lưới và phải tự mò ra thứ mình vừa lấy.
   */
  initialOpenId?: string | null;
};

type ModalMode = 'detail' | 'preview' | null;

/** Facet axes that live behind the Refine toggle (prototype `RKEYS`). */
type RefineAxis = 'category' | 'vehicle' | 'objective' | 'ev';

const SEARCH_DEBOUNCE_MS = 350;

const REFINE_FACETS: {
  key: RefineAxis;
  labelKey: string;
  options:
    | typeof EXPERIENCE_CATEGORIES
    | typeof EXPERIENCE_VEHICLES
    | typeof EXPERIENCE_OBJECTIVES
    | typeof EXPERIENCE_EVIDENCE;
}[] = [
  {
    key: 'category',
    labelKey: 'filterCategory',
    options: EXPERIENCE_CATEGORIES,
  },
  { key: 'vehicle', labelKey: 'filterVehicle', options: EXPERIENCE_VEHICLES },
  {
    key: 'objective',
    labelKey: 'filterObjective',
    options: EXPERIENCE_OBJECTIVES,
  },
  { key: 'ev', labelKey: 'filterEvidence', options: EXPERIENCE_EVIDENCE },
];

export const ExperiencesWorkspace = ({
  initialItems,
  initialError,
  initialPreviewId = null,
  initialOpenId = null,
  brandId = null,
}: ExperiencesWorkspaceProps) => {
  const t = useTranslations('portalV2.experiences');
  const router = useRouter();

  /**
   * Resolved at mount only: a deep link opens the preview on the first paint
   * instead of flashing the grid, and the URL never has to be rewritten.
   */
  const [deepLinkedExperience] = useState<ExperienceView | null>(() => {
    if (!initialPreviewId) return null;
    const match = findById(initialItems, initialPreviewId);
    return match && canPreview(match) ? match : null;
  });

  /**
   * `?open=` — cũng giải một lần lúc mount, cùng lý do như `?preview=`.
   *
   * `preview` thắng nếu cả hai cùng có: nó là link người dùng tự chia sẻ cho
   * nhau, còn `open` do chính hệ thống gắn vào sau khi Thêm.
   */
  const [deepLinkedOpen] = useState<ExperienceView | null>(() => {
    if (!initialOpenId || initialPreviewId) return null;
    return findById(initialItems, initialOpenId) ?? null;
  });

  const [items, setItems] = useState<ExperienceView[]>(initialItems);
  /** id đang ghi dấu Proven xuống server — khoá nút để không bấm kép. */
  const [provenPendingId, setProvenPendingId] = useState<string | null>(null);

  /** Lý do lần bấm Proven gần nhất thất bại — null khi chưa bấm hoặc đã xong. */
  const [provenError, setProvenError] = useState<string | null>(null);

  /**
   * Bật/tắt Proven. Cập nhật lạc quan trước để nút phản hồi tức thì, hỏng thì
   * trả về giá trị cũ — một lời gọi là xong, không cần nạp lại cả danh sách.
   *
   * Nhánh `catch` TRƯỚC ĐÂY nuốt trọn lỗi: nút bật rồi tắt lại, không một chữ
   * nào. Đo thật thì đó chính là chuyện đang xảy ra — BE trả **403
   * `client-portal users cannot modify library templates`**, nên với tài khoản
   * brand thì nút này không bao giờ chạy được, mà màn hình lại đọc như "bấm
   * không ăn". Hỏng thì phải NÓI hỏng, và nói vì sao.
   */
  const handleToggleProven = async (experience: ExperienceView) => {
    const next = !experience.proven;
    const apply = (value: boolean) =>
      setItems(prev =>
        prev.map(x => (x.id === experience.id ? { ...x, proven: value } : x))
      );

    setProvenPendingId(experience.id);
    setProvenError(null);
    apply(next);
    try {
      const confirmed = await setExperienceProven(experience.id, next);
      if (confirmed !== next) apply(confirmed);
    } catch (err) {
      apply(experience.proven);
      // 403 còn lại giờ chỉ có MỘT lý do: `assertTemplateMutable` khoá trải
      // nghiệm gốc hệ thống (`brand_id` NULL) cho mọi người trừ platform admin.
      // Guard chặn hẳn client-portal (bất kể sở hữu brand nào) đã gỡ — tài
      // khoản brand giờ đánh Proven được trải nghiệm gốc của chính mình (kể cả
      // bản tạo qua "Add to library"), miễn đủ vai trò manager (`EnsureBrandRole`, kiểm ở
      // `ensureManager` trước khi tới đây). Dịch thành câu người dùng làm được
      // gì tiếp; các lỗi khác thì đưa nguyên văn của BE.
      setProvenError(
        err instanceof RxApiError && err.status === 403
          ? t('provenForbidden')
          : errorMessage(err, t('provenFailed'))
      );
    } finally {
      setProvenPendingId(null);
    }
  };

  /** id đang lưu tên/cover xuống server — khoá form để không bấm Lưu kép. */
  const [detailsPendingId, setDetailsPendingId] = useState<string | null>(null);
  const [detailsError, setDetailsError] = useState<string | null>(null);

  const handleUpdateDetails = async (
    experience: ExperienceView,
    patch: { name: string; thumbnailUrl: string }
  ) => {
    setDetailsPendingId(experience.id);
    setDetailsError(null);
    try {
      const saved = await updateExperienceDetails(experience.id, patch);
      setItems(prev =>
        prev.map(x =>
          x.id === experience.id
            ? { ...x, name: saved.name, thumbnailUrl: saved.thumbnailUrl }
            : x
        )
      );
      toast.success(t('detailsSaved'));
    } catch (err) {
      setDetailsError(errorMessage(err, t('detailsSaveFailed')));
    } finally {
      setDetailsPendingId(null);
    }
  };

  /** Trải nghiệm đang chờ chọn đích để fork; null = hộp đóng. */
  const [useTarget, setUseTarget] = useState<ExperienceView | null>(null);

  /**
   * Fork xong thì NẠP LẠI danh sách, không nhét bản mới vào state.
   *
   * Bản copy vừa tạo làm đổi số đếm của cả hai tab và làm hạng mục đổi trạng
   * thái (`SyncItemAfterCopyChange` chạy ở BE). Ghép tay ở FE là dựng lại một
   * bản sao của luật server — đúng thứ đã khiến id suy ở FE trỏ vào hư không.
   */
  const handleUseConfirm = async (target: ForkTarget) => {
    if (!useTarget) return;
    const copy = await forkExperience(useTarget.id, target, brandId);
    const res = await fetchExperienceLibrary({ q: filters.q, brandId });
    setItems(res.items);
    setLoadError(res.error);
    setUseTarget(null);
    // Mở thẳng bản copy vừa có: nó là thứ người dùng vừa tạo ra, và nó nằm ở
    // tab khác tab đang đứng nên rất dễ "bấm xong không thấy gì".
    setActiveId(copy.id);
    setFilters(prev => ({ ...prev, state: copy.state }));
    toast.success(t('useDone', { name: copy.name }));
  };

  const [loadError, setLoadError] = useState<string | null>(initialError);
  const [searching, setSearching] = useState(false);
  const [filters, setFilters] = useState<ExperienceFilters>(() =>
    // Nhảy sẵn sang tab CHỨA mục được mở. Không có vế này thì đóng hộp xong
    // người dùng nhìn vào một lưới không hề có thứ họ vừa xem.
    deepLinkedOpen
      ? { ...EXPERIENCE_DEFAULT_FILTERS, state: deepLinkedOpen.state }
      : EXPERIENCE_DEFAULT_FILTERS
  );
  /** Category / Type / Objective / Evidence — collapsed until asked for. */
  const [refineOpen, setRefineOpen] = useState(false);
  /** Lưới hay bảng — prototype `xview`. */
  const [view, setView] = useState<PortalViewMode>('grid');
  /**
   * Xếp theo bằng chứng — prototype `xrank`.
   *
   * Phải đi vòng qua SERVER: `shelfLess` xếp theo lift rồi số phiên, mà danh
   * sách không trả trường nào trong hai trường đó (chỉ trả bậc `ev`). Xếp ở FE
   * thì cùng lắm là xếp theo bậc — thô hơn, và sẽ lệch với thứ tự thật.
   */
  const [rank, setRank] = useState(false);

  const [activeId, setActiveId] = useState<string | null>(
    deepLinkedExperience?.id ?? deepLinkedOpen?.id ?? null
  );
  const [modalMode, setModalMode] = useState<ModalMode>(
    deepLinkedExperience ? 'preview' : deepLinkedOpen ? 'detail' : null
  );
  const [previewReturnToDetail, setPreviewReturnToDetail] = useState(false);

  const modalModeRef = useRef(modalMode);
  /** The first debounce tick would re-fetch what the server already sent. */
  const skipFirstSearch = useRef(true);
  /** `?preview=` pointed at an experience that is gone or has nothing to render. */
  const deadPreviewLinkRef = useRef(
    Boolean(initialPreviewId) && deepLinkedExperience === null
  );
  /**
   * `?open=` trỏ vào một mục không có trong thư viện.
   *
   * Hay gặp nhất ngay sau khi Thêm từ chợ: bản ghi vừa tạo chưa kịp vào danh
   * sách. Nói một câu "đang cập nhật" còn hơn để người dùng nhìn một lưới im
   * lặng và tưởng lượt Thêm vừa rồi thất bại.
   */
  const deadOpenLinkRef = useRef(
    Boolean(initialOpenId) && !initialPreviewId && deepLinkedOpen === null
  );

  modalModeRef.current = modalMode;

  /* Search hits the server (`?q=`); the chip axes are seeded values and narrow
     client-side, so they never trigger a fetch. */
  useEffect(() => {
    if (skipFirstSearch.current) {
      skipFirstSearch.current = false;
      return;
    }

    let cancelled = false;
    const handle = setTimeout(() => {
      setSearching(true);
      void fetchExperienceLibrary({ q: filters.q, brandId, rank })
        .then(res => {
          if (cancelled) return;
          setItems(res.items);
          setLoadError(res.error);
        })
        .finally(() => {
          if (!cancelled) setSearching(false);
        });
    }, SEARCH_DEBOUNCE_MS);

    return () => {
      cancelled = true;
      clearTimeout(handle);
    };
  }, [filters.q, brandId, rank]);

  const visible = useMemo(
    () => filterExperiences(items, filters),
    [items, filters]
  );

  const active = findById(items, activeId);

  const stateTabs = useMemo(
    () =>
      EXPERIENCE_STATES.map(s => ({
        id: s.id,
        label: t(s.labelKey),
        count: countByState(items, s.id),
      })),
    [items, t]
  );

  const handleStateChange = useCallback((id: string) => {
    setFilters(prev => ({
      ...prev,
      state: id as ExperienceState | 'all',
    }));
  }, []);

  const chipOptions = <T extends string>(defs: { id: T; labelKey: string }[]) =>
    defs.map(d => ({ id: d.id, label: t(d.labelKey) }));

  const activeRefines = useMemo(
    () =>
      REFINE_FACETS.flatMap(facet => {
        const value = filters[facet.key];
        if (value === 'all') return [];
        const opt = facet.options.find(o => o.id === value);
        if (!opt) return [];
        return [{ key: facet.key, label: t(opt.labelKey) }];
      }),
    [filters, t]
  );

  const handleClearRefine = useCallback((key: RefineAxis) => {
    setFilters(prev => ({ ...prev, [key]: 'all' }));
  }, []);

  const handleToggleRefine = useCallback(() => {
    setRefineOpen(prev => !prev);
  }, []);

  /* ── preview ─────────────────────────────────────────────────────────── */

  const previewNeighbors = useMemo(() => visible.filter(canPreview), [visible]);

  /**
   * Blueprint của bản NHÁP đang xem trước.
   *
   * `ExchangeLiveCanvasPreview` đọc nó tại thời điểm bắt tay với iframe, nên
   * giữ trong ref: đổi state ở đây sẽ vẽ lại cả lưới thẻ mà không thêm được gì.
   * Rỗng thì stage hiện khung trống thay vì `/p/{slug}` trả 404.
   */
  const blueprintRef = useRef<Record<string, unknown> | null>(null);
  /** Nạp xong mà không có blueprint nào — khác với "đang nạp". */
  const [previewEmpty, setPreviewEmpty] = useState(false);

  useEffect(() => {
    const target = modalMode === 'preview' ? active : null;
    if (!target || target.externalUrl) {
      blueprintRef.current = null;
      setPreviewEmpty(false);
      return;
    }
    let cancelled = false;
    blueprintRef.current = null;
    setPreviewEmpty(false);
    // Revision MỚI NHẤT — đó là thứ người dùng vừa lấy về hoặc vừa sửa; bản
    // publish (nếu có) là chuyện khác và đã có `/p/{slug}` lo.
    rexerApi.pages
      .revisions(target.id, { page: 1, limit: 1 })
      .then(res => {
        if (cancelled) return;
        const bp = (res.items ?? [])[0]?.canvas_blueprint;
        if (bp) blueprintRef.current = bp as Record<string, unknown>;
        // Không có revision ⇒ nói ra. Dựng canvas rỗng sẽ hiện một khung
        // trắng trông y như trang thật mà chẳng có gì, và người dùng không
        // biết đó là lỗi hay là trang trống.
        else setPreviewEmpty(true);
      })
      .catch(() => {
        if (!cancelled) setPreviewEmpty(true);
      });
    return () => {
      cancelled = true;
    };
  }, [modalMode, active]);

  /* ── Chọn nhiều · nhân bản · xoá ───────────────────────────────────────── */

  const [selected, setSelected] = useState<string[]>([]);
  /** `null` = không hỏi; `'bulk'` = xoá cả lô; id = xoá một món. */
  const [deleteTarget, setDeleteTarget] = useState<string | 'bulk' | null>(
    null
  );
  const [busy, setBusy] = useState(false);

  const toggleSelect = useCallback((experience: ExperienceView) => {
    setSelected(prev =>
      prev.includes(experience.id)
        ? prev.filter(x => x !== experience.id)
        : [...prev, experience.id]
    );
  }, []);

  const clearSelection = useCallback(() => setSelected([]), []);

  /**
   * Ô tick ở đầu bảng. Phạm vi là những dòng ĐANG THẤY, không phải cả thư
   * viện — bộ lọc đang bật mà "chọn tất cả" vơ luôn thứ đã bị lọc ra thì lệnh
   * xoá tiếp theo sẽ giết những món người dùng không hề nhìn thấy.
   */
  const toggleAllVisible = useCallback(() => {
    setSelected(prev => {
      // So theo ID chứ không theo số lượng: đổi tab xong vẫn còn lựa chọn cũ
      // thì hai danh sách có thể BẰNG SỐ mà khác hẳn nội dung.
      const ids = visible.map(x => x.id);
      const allOn = ids.length > 0 && ids.every(id => prev.includes(id));
      return allOn ? [] : ids;
    });
  }, [visible]);

  const [newOpen, setNewOpen] = useState(false);

  /**
   * Tạo mới xong thì ĐI THẲNG vào canvas, không chèn thẻ vào lưới.
   *
   * `POST /v1/experiences` dựng một trải nghiệm gốc nháp (hoặc block) — không
   * phải bản copy — nên nó không thuộc thư viện này, y hệt trường hợp nhân
   * bản ở dưới. Chèn vào lưới sẽ tạo ra một thẻ biến mất ngay lần nạp sau.
   *
   * Đi bằng `canvasEditorHref`, KHÔNG bằng `edit_url` của BE — cái đó trỏ tới
   * `/templates/{id}`, một route FE này không có, và bấm Tạo sẽ rơi thẳng vào
   * trang NotFound. Xem chú thích ở `createExperience`.
   */
  const handleCreate = useCallback(
    async (draft: NewExperienceDraft) => {
      const created = await createExperience(draft);
      setNewOpen(false);
      toast.success(t('createdOpening', { name: created.name }));
      router.push(canvasEditorHref(created));
    },
    [router, t]
  );

  const handleDuplicate = useCallback(
    async (experience: ExperienceView) => {
      setBusy(true);
      const copy = await duplicateExperience(experience.id).catch(() => null);
      setBusy(false);
      if (!copy) {
        toast.error(t('duplicateFailed'));
        return;
      }

      /*
        Nhân bản một COPY ra một TRẢI NGHIỆM GỐC, không phải copy thứ hai —
        spec §4.11: hai copy cùng `origin + campaign + item` sẽ đếm trùng dòng
        fact, và có unique constraint chặn ở tầng cấu trúc. BE làm đúng luật đó.

        Trải nghiệm gốc nháp ấy giờ CÓ CHỖ ở màn này (tab "Bản gốc của tôi"),
        nên bản sao hiện ra ngay cạnh thẻ vừa nhân bản và bộ lọc nhảy sang tab
        chứa nó.

        Vẫn giữ nhánh `landsHere`: hỏi `EXPERIENCE_STATES` chứ không đoán cứng
        `'template'`. Đổi bộ lọc sang một tab không tồn tại thì lưới sẽ trống
        trơn ngay sau một thao tác vừa báo thành công — đúng lỗi đã mắc một lần.
      */
      const landsHere = EXPERIENCE_STATES.some(x => x.id === copy.state);
      if (!landsHere) {
        toast.success(t('duplicatedToLibrary', { name: copy.name }));
        return;
      }

      setItems(prev => {
        const at = prev.findIndex(x => x.id === experience.id);
        if (at < 0) return [copy, ...prev];
        return [...prev.slice(0, at + 1), copy, ...prev.slice(at + 1)];
      });
      setFilters(prev => ({ ...prev, state: copy.state, q: '' }));
      toast.success(t('duplicated', { name: copy.name }));
    },
    [t]
  );

  const handleConfirmDelete = useCallback(async () => {
    if (!deleteTarget) return;
    const ids = deleteTarget === 'bulk' ? [...selected] : [deleteTarget];
    setBusy(true);
    const { deleted, failed } = await deleteExperiences(ids);
    setBusy(false);
    if (deleted.length) {
      const gone = new Set(deleted);
      setItems(prev => prev.filter(x => !gone.has(x.id)));
      setSelected(prev => prev.filter(x => !gone.has(x)));
      toast.success(
        deleted.length === 1
          ? t('deletedOne')
          : t('deletedMany', { count: deleted.length })
      );
    }
    // Hỏng một phần thì nói rõ hỏng mấy món — im lặng ở đây nghĩa là người
    // dùng tưởng đã xoá hết trong khi vài món còn nguyên.
    if (failed.length) toast.error(t('deleteFailed', { count: failed.length }));
    setDeleteTarget(null);
  }, [deleteTarget, selected, t]);

  const toPreviewItem = useCallback(
    (experience: ExperienceView): PreviewItem => ({
      id: experience.id,
      name: experience.name,
      // LUÔN dựng từ blueprint. `/p/{slug}` phục vụ từ một Release, mà một
      // trang có thể mang `status: 'published'` với `releases: []` — đo được
      // trên dữ liệu thật. Nên không có chỉ dấu nào ở đây nói chắc trang công
      // khai tồn tại; blueprint thì luôn có và luôn là thứ trang này ĐANG là.
      source: 'live',
      slug: experience.slug ?? undefined,
      kindLabel: t('catCollection'),
      evidence: experience.stats
        ? { sessions: experience.stats.sessions, lift: experience.stats.lift }
        : null,
    }),
    [t]
  );

  const previewNeighborItems = useMemo(
    () => previewNeighbors.map(toPreviewItem),
    [previewNeighbors, toPreviewItem]
  );

  /**
   * Open the shell immediately. Stage loading (logo + progress) lives inside
   * the device frame while the iframe boots.
   */
  const handlePreview = useCallback(
    (experience: ExperienceView) => {
      if (!canPreview(experience)) {
        toast.error(t('previewNoSlug'));
        return;
      }
      setPreviewReturnToDetail(modalModeRef.current === 'detail');
      setActiveId(experience.id);
      setModalMode('preview');
    },
    [t]
  );

  const handleClosePreview = useCallback(() => {
    if (previewReturnToDetail && activeId) {
      setPreviewReturnToDetail(false);
      setModalMode('detail');
      return;
    }
    setModalMode(null);
    setActiveId(null);
  }, [previewReturnToDetail, activeId]);

  const handlePreviewNavigate = useCallback(
    (item: PreviewItem) => {
      const next = findById(items, item.id);
      if (!next || !canPreview(next)) {
        toast.error(t('previewNoSlug'));
        return;
      }
      setActiveId(next.id);
    },
    [items, t]
  );

  /** Address bar follows the open preview, so the URL can be copied and pasted back. */
  useEffect(() => {
    const previewing = modalMode === 'preview' ? activeId : null;
    writeExchangePreviewParam(previewing);
  }, [modalMode, activeId]);

  useEffect(() => {
    if (!deadPreviewLinkRef.current) return;
    deadPreviewLinkRef.current = false;
    toast.error(t('previewUnavailable'));
  }, [t]);

  /*
   * `?open=` đã làm xong việc của nó ⇒ xoá khỏi thanh địa chỉ.
   *
   * Còn để đó thì tải lại trang sẽ mở lại cái hộp người dùng vừa cố ý đóng, và
   * link họ copy đi sẽ mang theo một mục chẳng liên quan gì tới người nhận.
   */
  useEffect(() => {
    if (!initialOpenId) return;
    if (deadOpenLinkRef.current) {
      deadOpenLinkRef.current = false;
      toast.message(t('openMissing'));
    }
    clearExperienceOpenParam();
  }, [initialOpenId, t]);

  /* ── edit ────────────────────────────────────────────────────────────── */

  /* Same tab, so the canvas's own back button has a history entry to return to. */
  const handleEdit = useCallback(
    (experience: ExperienceView) => {
      if (!canEditCanvas(experience)) {
        // Hai lý do khác nhau, hai câu khác nhau: kệ Exchange thì chỉ ra chỗ
        // sửa đúng (Dùng rồi sửa bản copy), trang ngoài thì không có canvas.
        toast.error(
          isExchangeShelf(experience)
            ? t('editShelfHint')
            : t('editExternalHint')
        );
        return;
      }
      router.push(canvasEditorHref(experience));
    },
    [router, t]
  );

  const handleOpen = useCallback((experience: ExperienceView) => {
    setActiveId(experience.id);
    setModalMode('detail');
  }, []);

  const handleCloseDetail = useCallback(() => {
    setModalMode(null);
    setActiveId(null);
  }, []);

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

          <button
            type='button'
            onClick={() => setNewOpen(true)}
            className={cn(
              'inline-flex shrink-0 cursor-pointer items-center gap-1.5 rounded-full px-3.5 py-2',
              'bg-[var(--pv2-electric)] text-[12.5px] font-semibold text-[var(--pv2-paper)]',
              'shadow-[0_2px_8px_rgba(56,98,255,0.18)] transition-colors',
              'hover:bg-[var(--pv2-electric-hover)]',
              'focus-visible:ring-2 focus-visible:ring-[var(--pv2-electric)] focus-visible:ring-offset-2 focus-visible:outline-none'
            )}
          >
            <Plus className='size-3.5' strokeWidth={2.4} aria-hidden />
            {t('newAction')}
          </button>
        </div>
      </div>

      <div className='mx-auto w-full px-5 py-6 md:px-8'>
        {loadError && !items.length ? (
          <div
            className={cn(
              'rounded-[var(--pv2-r-lg)] border border-dashed border-[var(--pv2-hair)]',
              'bg-[var(--pv2-paper)] px-6 py-14 text-center'
            )}
          >
            <p className='text-[15px] font-semibold text-[var(--pv2-ink)]'>
              {t('loadError')}
            </p>
            <p className='mt-2 text-[13px] text-[var(--pv2-mut)]'>
              {loadError}
            </p>
          </div>
        ) : (
          <>
            {loadError ? (
              <div
                className={cn(
                  'mb-4 rounded-[var(--pv2-r)] border border-[var(--pv2-hair)]',
                  'bg-[var(--pv2-paper)] px-4 py-3 text-[12.5px] text-[var(--pv2-mut)]'
                )}
              >
                {loadError}
              </div>
            ) : null}

            <div className='sticky top-0 z-10 -mx-5 mb-3.5 bg-[var(--pv2-canvas)] px-5 md:-mx-8 md:px-8'>
              <Tabs
                items={stateTabs}
                value={filters.state}
                onChange={handleStateChange}
                aria-label={t('stateTabsAria')}
              />
            </div>

            <div className='mb-3.5 flex flex-col gap-2.5'>
              <div className='flex flex-wrap items-center justify-between gap-2'>
                <label
                  className={cn(
                    'flex w-full max-w-[320px] shrink-0 items-center gap-2 rounded-[10px]',
                    'border border-[var(--pv2-hair)] bg-[var(--pv2-paper)] px-[11px] py-2 text-[var(--pv2-faint)]',
                    'transition-colors focus-within:border-[var(--pv2-violet)]',
                    'sm:w-[320px]'
                  )}
                >
                  <Search
                    className='size-3.5 shrink-0'
                    strokeWidth={2.2}
                    aria-hidden
                  />
                  <input
                    type='search'
                    value={filters.q}
                    onChange={e =>
                      setFilters(prev => ({ ...prev, q: e.target.value }))
                    }
                    placeholder={t('searchPlaceholder')}
                    aria-label={t('searchAria')}
                    className='min-w-0 flex-1 border-0 bg-transparent text-[12.5px] text-[var(--pv2-ink)] outline-none placeholder:text-[var(--pv2-faint)]'
                  />
                </label>

                <button
                  type='button'
                  aria-expanded={refineOpen}
                  aria-controls='experiences-refine-panel'
                  aria-label={t('filterRefineAria')}
                  tabIndex={0}
                  onClick={handleToggleRefine}
                  onKeyDown={e => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleToggleRefine();
                    }
                  }}
                  className={cn(
                    'inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5',
                    'text-[12px] font-semibold transition-colors duration-150',
                    'focus-visible:ring-2 focus-visible:ring-[var(--pv2-electric)] focus-visible:ring-offset-2 focus-visible:outline-none',
                    'active:scale-[0.98]',
                    refineOpen
                      ? 'border-[var(--pv2-ink)] bg-[var(--pv2-ink)] text-[var(--pv2-paper)]'
                      : 'border-[var(--pv2-hair)] bg-[var(--pv2-paper)] text-[var(--pv2-mut)] hover:border-[color-mix(in_srgb,var(--pv2-violet)_35%,var(--pv2-hair))] hover:text-[var(--pv2-ink)]'
                  )}
                >
                  <ListFilter
                    className='size-3.5 shrink-0'
                    strokeWidth={2}
                    aria-hidden
                  />
                  {t('filterRefine')}
                  {activeRefines.length > 0 ? (
                    <span
                      className={cn(
                        'ml-0.5 inline-flex min-w-[1.1rem] items-center justify-center rounded-full px-1.5 text-[10px] font-bold tabular-nums',
                        refineOpen
                          ? 'bg-[var(--pv2-paper)]/20 text-[var(--pv2-paper)]'
                          : 'bg-[var(--pv2-canvas)] text-[var(--pv2-ink)]'
                      )}
                    >
                      {activeRefines.length}
                    </span>
                  ) : null}
                </button>

                {activeRefines.map(token => (
                  <button
                    key={token.key}
                    type='button'
                    tabIndex={0}
                    title={t('clearRefineAria', { label: token.label })}
                    aria-label={t('clearRefineAria', { label: token.label })}
                    onClick={() => handleClearRefine(token.key)}
                    onKeyDown={e => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        handleClearRefine(token.key);
                      }
                    }}
                    className={cn(
                      'inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5',
                      'text-[12px] font-semibold transition-colors duration-150',
                      'border-[color-mix(in_srgb,var(--pv2-violet)_28%,var(--pv2-hair))]',
                      'bg-[color-mix(in_srgb,var(--pv2-violet)_12%,var(--pv2-paper))] text-[var(--pv2-violet)]',
                      'hover:border-[var(--pv2-violet)] hover:bg-[var(--pv2-violet)] hover:text-[var(--pv2-paper)]',
                      'focus-visible:ring-2 focus-visible:ring-[var(--pv2-electric)] focus-visible:ring-offset-2 focus-visible:outline-none',
                      'active:scale-[0.98]'
                    )}
                  >
                    {token.label}
                    <span
                      className='text-[13px] leading-none opacity-75'
                      aria-hidden
                    >
                      ×
                    </span>
                  </button>
                ))}

                <span className='flex-1' />

                {/*
                  Xếp hạng là một lần GỌI LẠI SERVER, không phải sắp lại mảng
                  đang có — nên nó phải nằm cạnh ô tìm kiếm (thứ cũng gọi lại
                  server), chứ không nằm trong bảng lọc chip (thứ lọc tại chỗ).
                */}
                <button
                  type='button'
                  aria-pressed={rank}
                  title={t('rankHint')}
                  onClick={() => setRank(prev => !prev)}
                  className={cn(
                    'inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5',
                    'cursor-pointer text-[12px] font-semibold transition-colors duration-150',
                    'focus-visible:ring-2 focus-visible:ring-[var(--pv2-electric)] focus-visible:ring-offset-2 focus-visible:outline-none',
                    rank
                      ? 'border-[var(--pv2-ink)] bg-[var(--pv2-ink)] text-[var(--pv2-paper)]'
                      : 'border-[var(--pv2-hair)] bg-[var(--pv2-paper)] text-[var(--pv2-mut)] hover:border-[color-mix(in_srgb,var(--pv2-violet)_35%,var(--pv2-hair))] hover:text-[var(--pv2-ink)]'
                  )}
                >
                  <ArrowDownWideNarrow
                    className='size-3.5 shrink-0'
                    strokeWidth={2}
                    aria-hidden
                  />
                  {t('rankAction')}
                </button>

                <ViewToggle value={view} onChange={setView} />
              </div>

              {refineOpen ? (
                <div
                  id='experiences-refine-panel'
                  className={cn(
                    'flex flex-col gap-2.5 rounded-[var(--pv2-r)] border border-[var(--pv2-hair)]',
                    'bg-[var(--pv2-paper)] px-4 py-3.5'
                  )}
                >
                  {REFINE_FACETS.map(facet => (
                    <div
                      key={facet.key}
                      className='flex min-w-0 flex-col gap-1.5 sm:flex-row sm:items-center sm:gap-2.5'
                    >
                      <span
                        className={cn(
                          'w-[74px] shrink-0 text-[9.5px] font-bold tracking-[0.09em]',
                          'text-[var(--pv2-faint)] uppercase'
                        )}
                      >
                        {t(facet.labelKey)}
                      </span>
                      <FilterChips
                        inline
                        options={chipOptions(facet.options)}
                        value={filters[facet.key]}
                        onChange={id =>
                          setFilters(prev => ({ ...prev, [facet.key]: id }))
                        }
                      />
                    </div>
                  ))}
                </div>
              ) : null}
            </div>

            {searching ? (
              <div className='mt-4 flex items-center justify-center gap-2 py-10 text-[13px] text-[var(--pv2-mut)]'>
                <Loader2 className='size-4 animate-spin text-[var(--pv2-electric)]' />
                {t('loading')}
              </div>
            ) : visible.length ? (
              <>
                <p className='mb-3 text-[12px] text-[var(--pv2-faint)]'>
                  {t('resultsCount', { count: visible.length })}
                </p>
                {selected.length > 0 ? (
                  <div
                    role='toolbar'
                    aria-label={t('bulkAria')}
                    className='mb-3.5 flex flex-wrap items-center gap-2 rounded-[var(--pv2-r)] bg-[var(--pv2-ink)] px-3.5 py-2.5'
                  >
                    <span className='mr-1 text-[12.5px] font-semibold text-[var(--pv2-paper)]'>
                      {t('bulkSelected', { count: selected.length })}
                    </span>
                    <button
                      type='button'
                      disabled={busy}
                      onClick={() => setDeleteTarget('bulk')}
                      className='cursor-pointer rounded-full bg-[var(--pv2-error)] px-3 py-1.5 text-[12px] font-semibold text-[var(--pv2-paper)] transition-colors hover:bg-[color-mix(in_srgb,var(--pv2-error)_80%,#000)] disabled:cursor-not-allowed disabled:opacity-60'
                    >
                      {t('bulkDelete')}
                    </button>
                    <span className='flex-1' />
                    <button
                      type='button'
                      onClick={clearSelection}
                      className='cursor-pointer rounded-full bg-white/[0.13] px-3 py-1.5 text-[12px] font-semibold text-[var(--pv2-paper)] transition-colors hover:bg-white/25'
                    >
                      {t('bulkClear')}
                    </button>
                  </div>
                ) : null}
                {view === 'table' ? (
                  <ExperienceTable
                    experiences={visible}
                    selected={selected}
                    onToggleSelect={toggleSelect}
                    onToggleAll={toggleAllVisible}
                    onOpen={handleOpen}
                    onPreview={handlePreview}
                    onDuplicate={handleDuplicate}
                    onDelete={e => setDeleteTarget(e.id)}
                  />
                ) : (
                  <div className='grid grid-cols-[repeat(auto-fill,minmax(244px,1fr))] gap-4'>
                    {visible.map(experience => (
                      <ExperienceCard
                        key={experience.id}
                        experience={experience}
                        onOpen={handleOpen}
                        onPreview={handlePreview}
                        selected={selected.includes(experience.id)}
                        onToggleSelect={toggleSelect}
                        onDuplicate={handleDuplicate}
                        onDelete={e => setDeleteTarget(e.id)}
                      />
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div
                className={cn(
                  'rounded-[var(--pv2-r)] border border-dashed border-[var(--pv2-hair)]',
                  'px-10 py-12 text-center'
                )}
              >
                <p className='text-[14px] font-semibold text-[var(--pv2-ink)]'>
                  {t('empty')}
                </p>
                <p className='mt-1.5 text-[13px] text-[var(--pv2-faint)]'>
                  {t('emptyHint')}
                </p>
              </div>
            )}
          </>
        )}
      </div>

      {modalMode === 'detail' && active ? (
        <ExperienceDetailModal
          experience={active}
          onClose={handleCloseDetail}
          onPreview={handlePreview}
          onEdit={handleEdit}
          onUse={setUseTarget}
          onToggleProven={handleToggleProven}
          provenPending={provenPendingId === active.id}
          provenError={provenError}
          onUpdateDetails={patch => handleUpdateDetails(active, patch)}
          detailsPending={detailsPendingId === active.id}
          detailsError={detailsError}
        />
      ) : null}

      {newOpen ? (
        <NewExperienceModal
          onClose={() => setNewOpen(false)}
          onConfirm={handleCreate}
        />
      ) : null}

      {useTarget ? (
        <UseExperienceModal
          experience={useTarget}
          brandId={brandId}
          onClose={() => setUseTarget(null)}
          onConfirm={handleUseConfirm}
        />
      ) : null}

      {deleteTarget ? (
        <div
          role='dialog'
          aria-modal='true'
          aria-label={t('deleteTitle')}
          className='fixed inset-0 z-[var(--pv2-z-modal)] grid place-items-center bg-black/40 px-4'
          onClick={() => (busy ? undefined : setDeleteTarget(null))}
        >
          <div
            onClick={e => e.stopPropagation()}
            className='w-full max-w-[420px] rounded-[var(--pv2-r)] bg-[var(--pv2-paper)] p-5 shadow-[var(--pv2-sh-lift)]'
          >
            <h2 className='text-[16px] font-semibold text-[var(--pv2-ink)]'>
              {t('deleteTitle')}
            </h2>
            <p className='mt-1.5 text-[13px] leading-relaxed text-[var(--pv2-mut)]'>
              {deleteTarget === 'bulk'
                ? t('deleteBodyMany', { count: selected.length })
                : t('deleteBodyOne', {
                    name: findById(items, deleteTarget)?.name ?? '',
                  })}
            </p>
            <div className='mt-4 flex justify-end gap-2'>
              <button
                type='button'
                disabled={busy}
                onClick={() => setDeleteTarget(null)}
                className='cursor-pointer rounded-full border border-[var(--pv2-hair)] px-3.5 py-1.5 text-[12.5px] font-semibold text-[var(--pv2-ink)] disabled:opacity-60'
              >
                {t('cancel')}
              </button>
              <button
                type='button'
                disabled={busy}
                onClick={handleConfirmDelete}
                className='cursor-pointer rounded-full bg-[var(--pv2-error)] px-3.5 py-1.5 text-[12.5px] font-semibold text-[var(--pv2-paper)] disabled:opacity-60'
              >
                {t('deleteConfirm')}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      <ExchangePreviewShell
        open={modalMode === 'preview' && active !== null}
        listing={
          modalMode === 'preview' && active ? toPreviewItem(active) : null
        }
        neighbors={previewNeighborItems}
        onClose={handleClosePreview}
        onNavigate={handlePreviewNavigate}
        onEdit={
          active && canEditCanvas(active) ? () => handleEdit(active) : undefined
        }
        renderStage={device =>
          previewEmpty ? (
            <div className='grid h-full place-items-center px-8 text-center text-[13px] text-[var(--pv2-mut)]'>
              {t('previewNoContent')}
            </div>
          ) : (
            <ExchangeLiveCanvasPreview
              device={device}
              lang='vi'
              urlLabel={active?.slug ? `/${active.slug}` : '/preview'}
              getBlueprint={() => blueprintRef.current ?? {}}
            />
          )
        }
      />
    </div>
  );
};
